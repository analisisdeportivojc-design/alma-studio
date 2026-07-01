import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, canAccessAdmin } from "@/lib/auth";

export async function GET() {
  const { role, businessId } = await getUserRole();
  if (!canAccessAdmin(role) || !businessId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const supabase = await createClient();

  const { data: packages } = await supabase
    .from("packages")
    .select("id, name, price, total_classes, duration_days, is_active")
    .eq("business_id", businessId)
    .order("sort_order");

  return NextResponse.json({ packages: packages || [] });
}
