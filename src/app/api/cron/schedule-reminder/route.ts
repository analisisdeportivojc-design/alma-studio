import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Vercel Cron: runs every Monday at 9AM Lima (14:00 UTC)
// vercel.json: { "path": "/api/cron/schedule-reminder", "schedule": "0 14 * * 1" }
//
// Revisa si el horario cubre las próximas 2 semanas.
// Si no, envía un email al admin (kickoffperu@gmail.com).
// Requiere: RESEND_API_KEY y CRON_SECRET en Vercel

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const { data: business } = await admin.from("businesses").select("id, name").limit(1).single();
  if (!business) return NextResponse.json({ ok: true, skipped: "no business" });

  const { data: classes } = await admin
    .from("classes")
    .select("id, day_of_week")
    .eq("business_id", business.id)
    .eq("is_active", true);

  if (!classes?.length) return NextResponse.json({ ok: true, skipped: "no classes" });

  const futureEnd = new Date(today);
  futureEnd.setDate(today.getDate() + 20);

  const { data: sessions } = await admin
    .from("class_sessions")
    .select("class_id, session_date")
    .eq("business_id", business.id)
    .eq("status", "scheduled")
    .gte("session_date", todayStr)
    .lte("session_date", futureEnd.toISOString().split("T")[0]);

  const existingKeys = new Set((sessions || []).map((s) => `${s.class_id}|${s.session_date}`));

  let daysAhead = 0;
  for (let i = 0; i < 20; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1;
    const dateStr = d.toISOString().split("T")[0];
    const dayClasses = classes.filter((c) => c.day_of_week === dayOfWeek);
    if (dayClasses.length === 0) { daysAhead = i + 1; continue; }
    if (!dayClasses.every((c) => existingKeys.has(`${c.id}|${dateStr}`))) break;
    daysAhead = i + 1;
  }

  if (daysAhead >= 14) {
    return NextResponse.json({ ok: true, days_ahead: daysAhead, action: "no_action_needed" });
  }

  // Necesita acción — enviar email al admin
  const adminEmail = process.env.ADMIN_EMAIL || "kickoffperu@gmail.com";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://alma-studio-pearl.vercel.app";
  const limitDate = new Date(today);
  limitDate.setDate(today.getDate() + daysAhead);
  const limitStr = limitDate.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log(`[schedule-reminder] Sin RESEND_API_KEY. Días cubiertos: ${daysAhead}`);
    return NextResponse.json({ ok: true, days_ahead: daysAhead, action: "email_skipped_no_key" });
  }

  const { Resend } = await import("resend");
  const resend = new Resend(resendKey);

  await resend.emails.send({
    from: "Alma Studio Sistema <sistema@alma-studio.pe>",
    to: adminEmail,
    subject: `⚠ Horario incompleto — solo ${daysAhead} días cubiertos`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;">

        <tr>
          <td style="background:#2c2c2c;padding:32px 40px;">
            <p style="color:#c9a96e;font-size:11px;letter-spacing:4px;margin:0 0 6px;">ALMA STUDIO · SISTEMA</p>
            <h1 style="color:#fff;font-size:22px;margin:0;font-weight:normal;">Recordatorio de horario</h1>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 40px;">
            <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 16px;">
              El horario solo está cubierto hasta el <strong style="color:#2c2c2c;text-transform:capitalize;">${limitStr}</strong>
              (<strong>${daysAhead} días</strong> desde hoy).
            </p>
            <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 28px;">
              Recuerda subir al menos <strong>2 semanas</strong> de horario para que las alumnas puedan reservar con anticipación.
            </p>

            <table cellpadding="0" cellspacing="0" width="100%">
              <tr><td align="center">
                <a href="${appUrl}/admin/horario"
                   style="display:inline-block;background:#c9a96e;color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">
                  Ir al panel de horario
                </a>
              </td></tr>
            </table>

            <p style="color:#aaa;font-size:12px;text-align:center;margin:28px 0 0;">
              Usa el botón "Auto-rellenar 2 sem." para completar rápidamente con las instructoras por defecto.
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:#f5f4f0;padding:20px 40px;text-align:center;">
            <p style="color:#999;font-size:11px;margin:0;">Alma Studio · Sistema automático</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
    `,
  });

  return NextResponse.json({ ok: true, days_ahead: daysAhead, action: "email_sent", to: adminEmail });
}
