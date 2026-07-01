import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole, canAccessAdmin } from "@/lib/auth";

// POST /api/admin/schedule/clear
// Elimina sesiones sin reservas activas en las próximas N semanas
export async function POST(req: NextRequest) {
  const { role } = await getUserRole();
  if (!canAccessAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const { weeks = 2 } = await req.json().catch(() => ({}));
  const days = Math.min(weeks * 7, 28);

  const { data: business } = await admin.from("businesses").select("id").limit(1).single();
  if (!business) return NextResponse.json({ error: "No business" }, { status: 400 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + days - 1);
  const startStr = today.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  // Sesiones con reservas activas — no tocar
  const { data: bookedSessions } = await admin
    .from("bookings")
    .select("session_id")
    .in("status", ["confirmed", "waitlist", "attended"]);
  const bookedIds = new Set((bookedSessions || []).map((b) => b.session_id).filter(Boolean));

  const { data: allSessions } = await admin
    .from("class_sessions")
    .select("id")
    .eq("business_id", business.id)
    .gte("session_date", startStr)
    .lte("session_date", endStr);

  const deletableIds = (allSessions || []).map((s) => s.id).filter((id) => !bookedIds.has(id));

  if (deletableIds.length === 0) {
    return NextResponse.json({ deleted: 0, message: "No hay sesiones para limpiar (todas tienen reservas)" });
  }

  const { error } = await admin.from("class_sessions").delete().in("id", deletableIds);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    deleted: deletableIds.length,
    message: `✓ ${deletableIds.length} sesiones eliminadas`,
  });
}
