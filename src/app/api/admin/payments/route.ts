import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, canAccessAdmin } from "@/lib/auth";

export async function GET() {
  const { role, businessId } = await getUserRole();
  if (!canAccessAdmin(role) || !businessId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const supabase = await createClient();

  const { data: payments, error } = await supabase
    .from("payments")
    .select(
      "id, amount, currency, payment_method, status, created_at, external_id, subscription_id, profiles(first_name, last_name), subscriptions(packages(name))"
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ payments: payments || [] });
}

export async function POST(req: NextRequest) {
  const { role, businessId } = await getUserRole();
  if (!canAccessAdmin(role) || !businessId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const { user_id, package_id, payment_method, amount, notes } = body;

  if (!user_id || !package_id || !payment_method) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const supabase = await createClient();

  // Get package details
  const { data: pkg } = await supabase
    .from("packages")
    .select("id, total_classes, duration_days, price")
    .eq("id", package_id)
    .eq("business_id", businessId)
    .single();

  if (!pkg) return NextResponse.json({ error: "Paquete no encontrado" }, { status: 404 });

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + pkg.duration_days);

  // Expire any existing active subscription for this user
  await supabase
    .from("subscriptions")
    .update({ status: "expired" })
    .eq("user_id", user_id)
    .eq("business_id", businessId)
    .eq("status", "active");

  // Create subscription
  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .insert({
      user_id,
      business_id: businessId,
      package_id,
      classes_remaining: pkg.total_classes,
      classes_used: 0,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      status: "active",
    })
    .select("id")
    .single();

  if (subError) return NextResponse.json({ error: subError.message }, { status: 500 });

  // Create payment record
  const { error: payError } = await supabase.from("payments").insert({
    user_id,
    business_id: businessId,
    subscription_id: subscription.id,
    amount: amount ?? pkg.price,
    currency: "PEN",
    payment_method,
    status: "completed",
    metadata: notes ? { notes } : null,
  });

  if (payError) return NextResponse.json({ error: payError.message }, { status: 500 });

  return NextResponse.json({ ok: true, subscription_id: subscription.id });
}
