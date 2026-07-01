import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole, canAccessAdmin } from "@/lib/auth";

// GET /api/admin/schedule/health
// Retorna cuántos días adelante está cubierto el horario
export async function GET() {
  const { role } = await getUserRole();
  if (!canAccessAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const { data: business } = await admin.from("businesses").select("id").limit(1).single();
  if (!business) return NextResponse.json({ days_ahead: 0, needs_action: true });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  // Clases activas agrupadas por día de semana
  const { data: classes } = await admin
    .from("classes")
    .select("id, day_of_week")
    .eq("business_id", business.id)
    .eq("is_active", true);

  if (!classes?.length) return NextResponse.json({ days_ahead: 0, needs_action: false, no_classes: true });

  // Sesiones futuras (scheduled)
  const futureEnd = new Date(today);
  futureEnd.setDate(today.getDate() + 30);
  const futureEndStr = futureEnd.toISOString().split("T")[0];

  const { data: sessions } = await admin
    .from("class_sessions")
    .select("class_id, session_date")
    .eq("business_id", business.id)
    .eq("status", "scheduled")
    .gte("session_date", todayStr)
    .lte("session_date", futureEndStr);

  const existingKeys = new Set(
    (sessions || []).map((s) => `${s.class_id}|${s.session_date}`)
  );

  // Encontrar hasta qué día está completamente cubierto
  let daysAhead = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1;
    const dateStr = d.toISOString().split("T")[0];

    const dayClasses = classes.filter((c) => c.day_of_week === dayOfWeek);
    if (dayClasses.length === 0) {
      daysAhead = i + 1;
      continue;
    }

    const allCovered = dayClasses.every((c) => existingKeys.has(`${c.id}|${dateStr}`));
    if (!allCovered) break;
    daysAhead = i + 1;
  }

  const needs_action = daysAhead < 14;

  // Fecha límite: cuándo se acaba el horario
  const limitDate = new Date(today);
  limitDate.setDate(today.getDate() + daysAhead);

  return NextResponse.json({
    days_ahead: daysAhead,
    needs_action,
    limit_date: limitDate.toISOString().split("T")[0],
    message: needs_action
      ? `⚠ El horario solo cubre ${daysAhead} días. Recuerda subir 2 semanas adelante.`
      : `✓ Horario cubierto por ${daysAhead} días`,
  });
}
