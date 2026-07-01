import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidDate, sanitizeString } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = rateLimit(`sessions:${ip}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes" },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");
  const businessSlug = sanitizeString(
    searchParams.get("business") || "alma-studio"
  );

  if (
    !startDate ||
    !endDate ||
    !isValidDate(startDate) ||
    !isValidDate(endDate)
  ) {
    return NextResponse.json(
      { error: "Fechas inválidas" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const admin = createAdminClient();

  // Get business
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("slug", businessSlug)
    .single();

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Get classes with instructor info (class template defaults)
  const { data: classes } = await admin
    .from("classes")
    .select(`
      id,
      name,
      day_of_week,
      start_time,
      duration_minutes,
      max_capacity,
      discipline_id,
      level_id,
      instructor_id,
      disciplines(name),
      class_levels(name),
      instructors(id, photo_url, profiles(first_name, last_name))
    `)
    .eq("business_id", business.id)
    .eq("is_active", true);

  // Get existing sessions for the date range
  const { data: existingSessions } = await admin
    .from("class_sessions")
    .select("id, class_id, session_date, status, instructor_id")
    .eq("business_id", business.id)
    .gte("session_date", startDate)
    .lte("session_date", endDate);

  // Fetch instructor details for all assigned sessions (bypasses RLS on profiles)
  const assignedInstructorIds = [
    ...new Set(
      (existingSessions || [])
        .filter((s) => s.instructor_id)
        .map((s) => s.instructor_id!)
    ),
  ];

  const instructorMap: Record<string, { id: string; name: string; photo_url: string | null }> = {};

  if (assignedInstructorIds.length > 0) {
    const { data: instructors } = await admin
      .from("instructors")
      .select("id, photo_url, profiles(first_name, last_name)")
      .in("id", assignedInstructorIds);

    for (const inst of instructors || []) {
      const profile = Array.isArray((inst as any).profiles)
        ? (inst as any).profiles[0]
        : (inst as any).profiles;
      instructorMap[inst.id] = {
        id: inst.id,
        name: `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim(),
        photo_url: inst.photo_url,
      };
    }
  }

  // Get booking counts per session
  const sessionIds = (existingSessions || []).map((s) => s.id);
  let bookingCounts: Record<string, number> = {};

  if (sessionIds.length > 0) {
    const { data: bookings } = await supabase
      .from("bookings")
      .select("session_id")
      .in("session_id", sessionIds)
      .in("status", ["confirmed", "attended"]);

    bookingCounts = (bookings || []).reduce(
      (acc, b) => {
        acc[b.session_id] = (acc[b.session_id] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  // Generate sessions for each day in range
  const start = new Date(startDate + "T12:00:00");
  const end = new Date(endDate + "T12:00:00");
  const sessions = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1; // 0=Monday ... 6=Sunday
    const dateStr = d.toISOString().split("T")[0];

    const dayClasses = (classes || []).filter(
      (c) => c.day_of_week === dayOfWeek
    );

    for (const cls of dayClasses) {
      const existingSession = (existingSessions || []).find(
        (s) => s.class_id === cls.id && s.session_date === dateStr
      );

      const booked = existingSession
        ? bookingCounts[existingSession.id] || 0
        : 0;

      // Instructor: session override first, then class template default
      let instructor: { id: string; name: string; photo_url: string | null } | null = null;

      if (existingSession?.instructor_id && instructorMap[existingSession.instructor_id]) {
        instructor = instructorMap[existingSession.instructor_id];
      } else if ((cls.instructors as any)) {
        const src = cls.instructors as any;
        const profile = Array.isArray(src.profiles) ? src.profiles[0] : src.profiles;
        const name = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
        if (name || src.photo_url) {
          instructor = { id: src.id, name, photo_url: src.photo_url };
        }
      }

      sessions.push({
        class_id: cls.id,
        session_id: existingSession?.id || null,
        date: dateStr,
        name: cls.name,
        start_time: cls.start_time,
        duration_minutes: cls.duration_minutes,
        max_capacity: cls.max_capacity,
        booked_count: booked,
        available: cls.max_capacity - booked,
        status: existingSession?.status || "scheduled",
        discipline: (cls.disciplines as any)?.name || null,
        level: (cls.class_levels as any)?.name || null,
        instructor,
      });
    }
  }

  // Sort by date, then time
  sessions.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.start_time.localeCompare(b.start_time);
  });

  return NextResponse.json({ sessions });
}
