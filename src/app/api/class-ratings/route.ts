import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/class-ratings?pending=true → clases asistidas sin valorar
// GET /api/class-ratings?session_id=xxx → valoración promedio de esa sesión
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { searchParams } = new URL(req.url);

  const pending = searchParams.get("pending");
  const sessionId = searchParams.get("session_id");

  if (sessionId) {
    const admin = createAdminClient();
    const { data: ratings } = await admin
      .from("class_ratings")
      .select("rating, comment, created_at")
      .eq("session_id", sessionId);

    const avg = ratings && ratings.length > 0
      ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
      : null;

    return NextResponse.json({ avg_rating: avg, count: ratings?.length || 0, ratings: ratings || [] });
  }

  if (pending === "true") {
    if (!user) return NextResponse.json({ pending: [] });

    const admin = createAdminClient();
    const now = new Date();
    const nowStr = now.toISOString();

    // Get sessions user attended that are already finished
    const { data: bookings } = await admin
      .from("bookings")
      .select(`
        id,
        session_id,
        class_sessions!inner(
          id,
          session_date,
          instructor_id,
          classes!inner(name, start_time, duration_minutes)
        )
      `)
      .eq("user_id", user.id)
      .in("status", ["confirmed", "attended"]);

    if (!bookings?.length) return NextResponse.json({ pending: [] });

    // Filter: class must have already ended
    const finishedSessions = bookings.filter((b) => {
      const session = b.class_sessions as any;
      if (!session) return false;
      const cls = Array.isArray(session.classes) ? session.classes[0] : session.classes;
      if (!cls) return false;

      const [h, m] = cls.start_time.split(":");
      const endTime = new Date(`${session.session_date}T${h.padStart(2, "0")}:${m.padStart(2, "0")}:00`);
      endTime.setMinutes(endTime.getMinutes() + (cls.duration_minutes || 50));

      return endTime < now;
    });

    if (!finishedSessions.length) return NextResponse.json({ pending: [] });

    // Check which ones already have a rating
    const sessionIds = finishedSessions.map((b) => b.session_id).filter(Boolean);
    const { data: existingRatings } = await admin
      .from("class_ratings")
      .select("session_id")
      .eq("user_id", user.id)
      .in("session_id", sessionIds);

    const ratedSessionIds = new Set((existingRatings || []).map((r) => r.session_id));

    const pending_list = finishedSessions
      .filter((b) => b.session_id && !ratedSessionIds.has(b.session_id))
      .map((b) => {
        const session = b.class_sessions as any;
        const cls = Array.isArray(session.classes) ? session.classes[0] : session.classes;
        return {
          session_id: b.session_id,
          class_name: cls?.name || "Clase",
          session_date: session.session_date,
          instructor_id: session.instructor_id,
        };
      })
      // Only show the most recent unrated class (max 1 notification at a time)
      .sort((a, b) => b.session_date.localeCompare(a.session_date))
      .slice(0, 1);

    return NextResponse.json({ pending: pending_list });
  }

  return NextResponse.json({ error: "Parámetro requerido" }, { status: 400 });
}

// POST /api/class-ratings → guardar valoración
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { session_id, instructor_id, business_id, rating, comment } = await req.json();
  if (!session_id || !rating) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  // Verify user had a booking for this session
  const { data: booking } = await supabase
    .from("bookings")
    .select("id")
    .eq("user_id", user.id)
    .eq("session_id", session_id)
    .in("status", ["confirmed", "attended"])
    .single();

  if (!booking) {
    return NextResponse.json({ error: "No tienes reserva para esta clase" }, { status: 403 });
  }

  const { error } = await supabase
    .from("class_ratings")
    .upsert(
      {
        user_id: user.id,
        session_id,
        instructor_id: instructor_id || null,
        business_id,
        rating,
        comment: comment || null,
      },
      { onConflict: "user_id,session_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
