import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidUUID, isValidDate } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email/send";
import { bookingConfirmedEmail } from "@/lib/email/templates";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { allowed } = rateLimit(`booking:${user.id}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intenta en un minuto." }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { class_id, date } = body;
  if (!class_id || !date || !isValidUUID(class_id) || !isValidDate(date)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  // Get class info
  const { data: classInfo } = await supabase
    .from("classes")
    .select("id, business_id, max_capacity, name, start_time")
    .eq("id", class_id)
    .single();

  if (!classInfo) {
    return NextResponse.json({ error: "Clase no encontrada" }, { status: 404 });
  }

  // Check active subscription with classes remaining
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, classes_remaining, classes_used")
    .eq("user_id", user.id)
    .eq("business_id", classInfo.business_id)
    .eq("status", "active")
    .gte("end_date", new Date().toISOString().split("T")[0])
    .gt("classes_remaining", 0)
    .order("end_date", { ascending: true })
    .limit(1)
    .single();

  if (!subscription) {
    return NextResponse.json(
      { error: "No tienes clases disponibles. Compra un paquete para reservar.", no_subscription: true },
      { status: 402 }
    );
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
      .insert({ class_id, business_id: classInfo.business_id, session_date: date, status: "scheduled" })
      .select("id, status")
      .single();

    if (sessionError) return NextResponse.json({ error: "Error creando sesión" }, { status: 500 });
    session = newSession;
  }

  if (session.status === "cancelled") {
    return NextResponse.json({ error: "Esta clase fue cancelada" }, { status: 400 });
  }

  // Check if already booked
  const { data: existingBooking } = await supabase
    .from("bookings")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("session_id", session.id)
    .single();

  if (existingBooking && existingBooking.status === "confirmed") {
    return NextResponse.json({ error: "Ya tienes esta clase reservada" }, { status: 400 });
  }

  // Check capacity
  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("session_id", session.id)
    .in("status", ["confirmed", "attended"]);

  const bookedCount = count || 0;

  if (bookedCount >= classInfo.max_capacity) {
    // Waitlist — no subscription deduction
    const { data: booking, error } = await supabase
      .from("bookings")
      .upsert(
        { user_id: user.id, business_id: classInfo.business_id, session_id: session.id, status: "waitlist" },
        { onConflict: "user_id,session_id" }
      )
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ booking, message: "Clase llena. Te agregamos a la lista de espera.", waitlist: true });
  }

  // Create booking and deduct class from subscription atomically
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .upsert(
      {
        user_id: user.id,
        business_id: classInfo.business_id,
        session_id: session.id,
        subscription_id: subscription.id,
        status: "confirmed",
        booked_at: new Date().toISOString(),
      },
      { onConflict: "user_id,session_id" }
    )
    .select()
    .single();

  if (bookingError) return NextResponse.json({ error: bookingError.message }, { status: 500 });

  // Deduct one class from subscription
  await supabase
    .from("subscriptions")
    .update({
      classes_remaining: subscription.classes_remaining - 1,
      classes_used: subscription.classes_used + 1,
    })
    .eq("id", subscription.id);

  // Send confirmation email (non-blocking)
  if (user.email) {
    const firstName = user.user_metadata?.first_name || "Alumna";
    const template = bookingConfirmedEmail(firstName, classInfo.name, date, classInfo.start_time?.slice(0, 5) || "");
    sendEmail(user.email, template.subject, template.html).catch(() => {});
  }

  return NextResponse.json({ booking, message: "¡Clase reservada!" });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

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

  // Get booking to check it belongs to user and get subscription_id
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, status, subscription_id, session_id, class_sessions(session_date)")
    .eq("id", booking_id)
    .eq("user_id", user.id)
    .single();

  if (!booking) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  if (booking.status !== "confirmed") return NextResponse.json({ error: "Solo puedes cancelar reservas confirmadas" }, { status: 400 });

  // Don't allow cancellation of past sessions
  const sessionDate = (booking.class_sessions as any)?.session_date;
  if (sessionDate && sessionDate < new Date().toISOString().split("T")[0]) {
    return NextResponse.json({ error: "No puedes cancelar una clase pasada" }, { status: 400 });
  }

  await supabase.from("bookings").update({ status: "cancelled" }).eq("id", booking_id);

  // Return class to subscription
  if (booking.subscription_id) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("classes_remaining, status, end_date")
      .eq("id", booking.subscription_id)
      .single();

    if (sub && sub.status === "active") {
      await supabase
        .from("subscriptions")
        .update({ classes_remaining: sub.classes_remaining + 1 })
        .eq("id", booking.subscription_id);
    }
  }

  return NextResponse.json({ message: "Reserva cancelada. La clase fue devuelta a tu suscripción." });
}
