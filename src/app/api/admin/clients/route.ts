import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, canAccessAdmin } from "@/lib/auth";

export async function GET() {
  const { role, businessId } = await getUserRole();
  if (!canAccessAdmin(role) || !businessId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("memberships")
    .select("id, user_id, is_active, created_at, profiles(first_name, last_name, phone)")
    .eq("business_id", businessId)
    .eq("role", "client")
    .order("created_at", { ascending: false });

  const userIds = (memberships || []).map((m) => m.user_id);

  const [{ data: subscriptions }, { data: bookings }] = await Promise.all([
    userIds.length
      ? supabase
          .from("subscriptions")
          .select("user_id, classes_remaining, end_date, status, packages(name)")
          .eq("business_id", businessId)
          .in("user_id", userIds)
          .order("end_date", { ascending: false })
      : Promise.resolve({ data: [] }),
    userIds.length
      ? supabase
          .from("bookings")
          .select("user_id, status, booked_at")
          .eq("business_id", businessId)
          .in("user_id", userIds)
      : Promise.resolve({ data: [] }),
  ]);

  const activeSubByUser: Record<string, any> = {};
  (subscriptions || []).forEach((s: any) => {
    if (s.status === "active" && !activeSubByUser[s.user_id]) {
      activeSubByUser[s.user_id] = s;
    }
  });

  const bookingStatsByUser: Record<string, { total: number; lastVisit: string | null }> = {};
  (bookings || []).forEach((b: any) => {
    const stat = (bookingStatsByUser[b.user_id] ||= { total: 0, lastVisit: null });
    if (b.status === "confirmed" || b.status === "attended") {
      stat.total += 1;
      if (!stat.lastVisit || b.booked_at > stat.lastVisit) stat.lastVisit = b.booked_at;
    }
  });

  const clients = (memberships || []).map((m: any) => ({
    membership_id: m.id,
    user_id: m.user_id,
    first_name: m.profiles?.first_name || "",
    last_name: m.profiles?.last_name || "",
    phone: m.profiles?.phone || "",
    is_active: m.is_active,
    member_since: m.created_at,
    active_subscription: activeSubByUser[m.user_id]
      ? {
          package_name: activeSubByUser[m.user_id].packages?.name || "—",
          classes_remaining: activeSubByUser[m.user_id].classes_remaining,
          end_date: activeSubByUser[m.user_id].end_date,
        }
      : null,
    total_bookings: bookingStatsByUser[m.user_id]?.total || 0,
    last_visit: bookingStatsByUser[m.user_id]?.lastVisit || null,
  }));

  return NextResponse.json({ clients });
}
