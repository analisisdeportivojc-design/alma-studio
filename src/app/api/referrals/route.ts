import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/validation";

// GET: get my referral info
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Get or create referral code
  let { data: profile } = await supabase
    .from("profiles")
    .select("referral_code, first_name")
    .eq("id", user.id)
    .single();

  if (!profile?.referral_code) {
    const firstName = user.user_metadata?.first_name || "USER";
    const code = (
      firstName.slice(0, 4).toUpperCase() +
      user.id.slice(0, 4).toUpperCase()
    ).replace(/[^A-Z0-9]/g, "X");

    await supabase
      .from("profiles")
      .update({ referral_code: code })
      .eq("id", user.id);

    profile = { ...profile, referral_code: code } as any;
  }

  // Get my referrals
  const { data: referrals } = await supabase
    .from("referrals")
    .select("id, status, created_at, completed_at, profiles!referrals_referred_id_fkey(first_name, last_name)")
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false });

  const stats = {
    total: referrals?.length || 0,
    completed: referrals?.filter((r) => r.status === "completed" || r.status === "rewarded").length || 0,
    rewarded: referrals?.filter((r) => r.status === "rewarded").length || 0,
  };

  return NextResponse.json({
    referral_code: profile?.referral_code,
    referral_link: `https://almastudio.com.pe/r/${profile?.referral_code}`,
    stats,
    referrals: referrals || [],
  });
}

// POST: apply a referral code (called during registration)
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { allowed } = rateLimit(`referral:${user.id}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes" },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const code = sanitizeString(body.code || "").toUpperCase();
  if (!code || code.length < 4) {
    return NextResponse.json({ error: "Código inválido" }, { status: 400 });
  }

  // Find the referrer by code
  const { data: referrer } = await supabase
    .from("profiles")
    .select("id, first_name")
    .eq("referral_code", code)
    .single();

  if (!referrer) {
    return NextResponse.json(
      { error: "Código de referido no encontrado" },
      { status: 404 }
    );
  }

  if (referrer.id === user.id) {
    return NextResponse.json(
      { error: "No puedes usar tu propio código" },
      { status: 400 }
    );
  }

  // Get business
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("slug", "alma-studio")
    .single();

  if (!business) {
    return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
  }

  // Check if already referred
  const { data: existing } = await supabase
    .from("referrals")
    .select("id")
    .eq("referred_id", user.id)
    .eq("business_id", business.id)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "Ya tienes un código de referido aplicado" },
      { status: 400 }
    );
  }

  // Create referral
  const { data: referral, error } = await supabase
    .from("referrals")
    .insert({
      referrer_id: referrer.id,
      referred_id: user.id,
      business_id: business.id,
      referral_code: code,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: `Código aplicado. ${referrer.first_name} te refirió. Ambas ganarán 1 clase gratis cuando completes tu primera clase.`,
    referral,
  });
}
