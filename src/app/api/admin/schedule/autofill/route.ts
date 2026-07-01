import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole, canAccessAdmin } from "@/lib/auth";

// POST /api/admin/schedule/autofill
// Crea class_sessions para los próximos 14 días usando la instructora por defecto de cada clase
// Solo crea sesiones que NO existen aún — nunca sobreescribe asignaciones manuales
export async function POST(req: NextRequest) {
  const { role } = await getUserRole();
  if (!canAccessAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const { weeks = 2 } = await req.json().catch(() => ({}));
  const days = Math.min(weeks * 7, 28); // máximo 4 semanas

  const { data: business } = await admin.from("businesses").select("id").limit(1).single();
  if (!business) return NextResponse.json({ error: "No business" }, { status: 400 });

  // Clases activas con instructora por defecto
  const { data: classes } = await admin
    .from("classes")
    .select("id, day_of_week, instructor_id")
    .eq("business_id", business.id)
    .eq("is_active", true);

  if (!classes?.length) return NextResponse.json({ created: 0, message: "No hay clases activas" });

  // Rango de fechas
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + days - 1);

  const startStr = today.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  // Sesiones que ya existen en ese rango
  const { data: existing } = await admin
    .from("class_sessions")
    .select("class_id, session_date")
    .eq("business_id", business.id)
    .gte("session_date", startStr)
    .lte("session_date", endStr);

  const existingKeys = new Set(
    (existing || []).map((s) => `${s.class_id}|${s.session_date}`)
  );

  // Generar sesiones faltantes
  const toInsert: any[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1; // 0=Lunes
    const dateStr = d.toISOString().split("T")[0];

    const dayClasses = classes.filter((c) => c.day_of_week === dayOfWeek);

    for (const cls of dayClasses) {
      const key = `${cls.id}|${dateStr}`;
      if (existingKeys.has(key)) continue; // ya existe, no tocar

      toInsert.push({
        class_id: cls.id,
        business_id: business.id,
        session_date: dateStr,
        instructor_id: cls.instructor_id || null,
        status: "scheduled",
      });
    }
  }

  if (toInsert.length === 0) {
    return NextResponse.json({ created: 0, message: "El horario ya está completo para ese período" });
  }

  const { error } = await admin.from("class_sessions").insert(toInsert);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    created: toInsert.length,
    message: `Se crearon ${toInsert.length} sesiones para los próximos ${days} días`,
  });
}
