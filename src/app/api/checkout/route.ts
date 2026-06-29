import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidUUID } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email/send";
import { paymentConfirmedEmail } from "@/lib/email/templates";

const VALID_METHODS = ["card", "transfer", "cash"];

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { allowed } = rateLimit(`checkout:${user.id}`, 5, 60_000);
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

  const { package_id, payment_method } = body;

  if (!package_id || !isValidUUID(package_id)) {
    return NextResponse.json(
      { error: "Datos inválidos" },
      { status: 400 }
    );
  }

  if (payment_method && !VALID_METHODS.includes(payment_method)) {
    return NextResponse.json(
      { error: "Método de pago inválido" },
      { status: 400 }
    );
  }

  // Get package
  const { data: pkg } = await supabase
    .from("packages")
    .select("*")
    .eq("id", package_id)
    .single();

  if (!pkg) {
    return NextResponse.json(
      { error: "Paquete no encontrado" },
      { status: 404 }
    );
  }

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + pkg.duration_days);

  // Create payment record
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      user_id: user.id,
      business_id: pkg.business_id,
      amount: pkg.price,
      currency: pkg.currency,
      payment_method: payment_method || "card",
      status: payment_method === "transfer" ? "pending" : "completed",
      metadata: { package_name: pkg.name },
    })
    .select()
    .single();

  if (paymentError) {
    return NextResponse.json(
      { error: "Error registrando pago" },
      { status: 500 }
    );
  }

  // Create subscription
  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .insert({
      user_id: user.id,
      business_id: pkg.business_id,
      package_id: pkg.id,
      classes_remaining: pkg.total_classes,
      classes_used: 0,
      start_date: new Date().toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      freeze_days_remaining: pkg.freeze_days,
      status: payment_method === "transfer" ? "frozen" : "active",
      payment_id: payment.id,
    })
    .select()
    .single();

  if (subError) {
    return NextResponse.json(
      { error: "Error creando suscripción" },
      { status: 500 }
    );
  }

  // Ensure user has a membership as client
  await supabase.from("memberships").upsert(
    {
      user_id: user.id,
      business_id: pkg.business_id,
      role: "client",
      is_active: true,
    },
    { onConflict: "user_id,business_id", ignoreDuplicates: true }
  );

  // Send payment confirmation email (non-blocking)
  if (user.email && payment.status === "completed") {
    const firstName = user.user_metadata?.first_name || "Alumna";
    const template = paymentConfirmedEmail(
      firstName,
      pkg.name,
      pkg.price,
      pkg.total_classes,
      endDate.toLocaleDateString("es-PE")
    );
    sendEmail(user.email, template.subject, template.html).catch(() => {});
  }

  return NextResponse.json({
    subscription_id: subscription.id,
    payment_id: payment.id,
    status: payment.status,
    message:
      payment_method === "transfer"
        ? "Pedido registrado. Envía tu comprobante por WhatsApp para activar."
        : "¡Pago exitoso! Tu plan está activo.",
  });
}
