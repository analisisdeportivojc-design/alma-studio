import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole, canAccessAdmin } from "@/lib/auth";

// POST /api/admin/schedule/autofill
// - Crea sesiones nuevas que falten
// - Rellena instructor_id en sesiones existentes que lo tengan vacío (sin tocar las asignadas manualmente)
export async function POST(req: NextRequest) {
  const { role } = await getUserRole();
  if (!canAccessAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const { weeks = 2 } = await req.json().catch(() => ({}));
  const days = Math.min(weeks * 7, 28);

  const { data: business } = await admin.from("businesses").select("id").limit(1).single();
  if (!business) return NextResponse.json({ error: "No business" }, { status: 400 });

  const { data: classes } = await admin
    .from("classes")
    .select("id, day_of_week, instructor_id")
    .eq("business_id", business.id)
    .eq("is_active", true);

  if (!classes?.length) return NextResponse.json({ created: 0, updated: 0, message: "No hay clases activas" });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + days - 1);
  const startStr = today.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  // Sesiones existentes en ese rango (con su instructor_id actual)
  const { data: existing } = await admin
    .from("class_sessions")
    .select("id, class_id, session_date, instructor_id")
    .eq("business_id", business.id)
    .gte("session_date", startStr)
    .lte("session_date", endStr);

  const existingMap = new Map(
    (existing || []).map((s) => [`${s.class_id}|${s.session_date}`, s])
  );

  const toInsert: any[] = [];
  const toUpdate: { id: string; instructor_id: string }[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1;
    const dateStr = d.toISOString().split("T")[0];

    for (const cls of classes.filter((c) => c.day_of_week === dayOfWeek)) {
      const key = `${cls.id}|${dateStr}`;
      const existingSession = existingMap.get(key);

      if (!existingSession) {
        // Crear sesión nueva
        toInsert.push({
          class_id: cls.id,
          business_id: business.id,
          session_date: dateStr,
          instructor_id: cls.instructor_id || null,
          status: "scheduled",
        });
      } else if (!existingSession.instructor_id && cls.instructor_id) {
        // Sesión existe pero sin instructora → rellenar con la por defecto
        toUpdate.push({ id: existingSession.id, instructor_id: cls.instructor_id });
      }
      // Si ya tiene instructora asignada manualmente → no tocar
    }
  }

  let created = 0;
  let updated = 0;

  if (toInsert.length > 0) {
    const { error } = await admin.from("class_sessions").insert(toInsert);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    created = toInsert.length;
  }

  // Actualizar sesiones sin instructora en lotes
  for (const row of toUpdate) {
    await admin
      .from("class_sessions")
      .update({ instructor_id: row.instructor_id })
      .eq("id", row.id);
    updated++;
  }

  const total = created + updated;
  if (total === 0) {
    return NextResponse.json({ created: 0, updated: 0, message: "Todas las sesiones ya tienen instructora asignada" });
  }

  return NextResponse.json({
    created,
    updated,
    message: `✓ ${created > 0 ? `${created} sesiones creadas` : ""}${created > 0 && updated > 0 ? " · " : ""}${updated > 0 ? `${updated} instructoras asignadas` : ""}`,
  });
}
