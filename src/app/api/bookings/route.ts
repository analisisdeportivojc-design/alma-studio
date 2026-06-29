import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidUUID, isValidDate } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { allowed } = rateLimit(`booking:${user.id}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta en un minuto." },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { class_id, date } = body;

  if (!class_id || !date || !isValidUUID(class_id) || !isValidDate(date)) {
    return NextResponse.json(
      { error: "Datos inválidos" },
      { status: 400 }
    );
  }

  // Get class info
  const { data: classInfo } = await supabase
    .from("classes")
    .select("id, business_id, max_capacity")
    .eq("id", class_id)
    .single();

  if (!classInfo) {
    return NextResponse.json({ error: "Clase no encontrada" }, { status: 404 });
  }

  // Get or create session
  let { data: session } = await supabase
    .from("class_sessions")
    .select("id, status")
    .eq("class_id", class_id)
    .eq("session_date", date)
    .single();

  if (!session) {
    const { data: newSession, error: sessionError } = await supabase
      .from("class_sessions")
      .insert({
        class_id,
        business_id: classInfo.business_id,
        session_date: date,
        status: "scheduled",
      })
      .select("id, status")
      .single();

    if (sessionError) {
      return NextResponse.json(
        { error: "Error creando sesión" },
        { status: 500 }
      );
    }
    session = newSession;
  }

  if (session.status === "cancelled") {
    return NextResponse.json(
      { error: "Esta clase fue cancelada" },
      { status: 400 }
    );
  }

  // Check if already booked
  const { data: existingBooking } = await supabase
    .from("bookings")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("session_id", session.id)
    .single();

  if (existingBooking && existingBooking.status === "confirmed") {
    return NextResponse.json(
      { error: "Ya tienes esta clase reservada" },
      { status: 400 }
    );
  }

  // Check capacity
  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("session_id", session.id)
    .in("status", ["confirmed", "attended"]);

  const bookedCount = count || 0;

  if (bookedCount >= classInfo.max_capacity) {
    // Add to waitlist
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        business_id: classInfo.business_id,
        session_id: session.id,
        status: "waitlist",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      booking,
      message: "Clase llena. Te agregamos a la lista de espera.",
      waitlist: true,
    });
  }

  // Create booking
  if (existingBooking) {
    const { data: booking, error } = await supabase
      .from("bookings")
      .update({ status: "confirmed", booked_at: new Date().toISOString() })
      .eq("id", existingBooking.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ booking, message: "¡Clase reservada!" });
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      user_id: user.id,
      business_id: classInfo.business_id,
      session_id: session.id,
      status: "confirmed",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ booking, message: "¡Clase reservada!" });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { booking_id } = body;

  if (!booking_id || !isValidUUID(booking_id)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", booking_id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Reserva cancelada" });
}
