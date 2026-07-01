import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Vercel Cron: runs daily at 11 PM Lima time (04:00 UTC)
// vercel.json: { "crons": [{ "path": "/api/cron/rating-reminders", "schedule": "0 4 * * *" }] }
//
// Requires: RESEND_API_KEY env var + "resend" npm package
// To activate: npm install resend  →  add RESEND_API_KEY to Vercel

export async function GET(req: NextRequest) {
  // Security: only Vercel cron or internal calls
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();

  // Find all class_sessions that ended in the past 24 hours
  const yesterday = new Date(now);
  yesterday.setHours(now.getHours() - 24);

  const { data: sessions } = await admin
    .from("class_sessions")
    .select(`
      id,
      session_date,
      instructor_id,
      classes!inner(name, start_time, duration_minutes),
      businesses!inner(name)
    `)
    .gte("session_date", yesterday.toISOString().split("T")[0])
    .lte("session_date", now.toISOString().split("T")[0])
    .eq("status", "scheduled");

  if (!sessions?.length) return NextResponse.json({ sent: 0 });

  let sent = 0;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://alma-studio-pearl.vercel.app";

  for (const session of sessions) {
    const cls = Array.isArray((session as any).classes)
      ? (session as any).classes[0]
      : (session as any).classes;
    if (!cls) continue;

    // Check class actually ended
    const [h, m] = cls.start_time.split(":");
    const endTime = new Date(`${session.session_date}T${h.padStart(2, "0")}:${m.padStart(2, "0")}:00`);
    endTime.setMinutes(endTime.getMinutes() + (cls.duration_minutes || 50));
    if (endTime > now) continue;

    // Find confirmed bookings for this session without a rating
    const { data: bookings } = await admin
      .from("bookings")
      .select("user_id, profiles!inner(email, first_name)")
      .eq("session_id", session.id)
      .in("status", ["confirmed", "attended"]);

    if (!bookings?.length) continue;

    const ratedUsers = await admin
      .from("class_ratings")
      .select("user_id")
      .eq("session_id", session.id);

    const ratedSet = new Set((ratedUsers.data || []).map((r) => r.user_id));

    for (const booking of bookings) {
      if (ratedSet.has(booking.user_id)) continue;

      const profile = Array.isArray((booking as any).profiles)
        ? (booking as any).profiles[0]
        : (booking as any).profiles;
      if (!profile?.email) continue;

      // Send email — activate by installing resend: npm install resend
      try {
        await sendRatingEmail({
          to: profile.email,
          firstName: profile.first_name || "Alumna",
          className: cls.name,
          sessionDate: session.session_date,
          sessionId: session.id,
          appUrl,
        });
        sent++;
      } catch (e) {
        console.error("Email error:", e);
      }
    }
  }

  return NextResponse.json({ sent });
}

async function sendRatingEmail({
  to, firstName, className, sessionDate, sessionId, appUrl,
}: {
  to: string;
  firstName: string;
  className: string;
  sessionDate: string;
  sessionId: string;
  appUrl: string;
}) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log(`[rating-email] RESEND_API_KEY no configurada. Destinatario: ${to}`);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(resendKey);

  const dateLabel = new Date(sessionDate + "T12:00:00").toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long",
  });
  const ratingUrl = `${appUrl}/reserva`;

  await resend.emails.send({
    from: "Alma Studio <hola@alma-studio.pe>",
    to,
    subject: `¿Cómo estuvo tu clase de ${className}?`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#2c2c2c;padding:40px;text-align:center;">
            <p style="color:#c9a96e;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 8px;">Alma Studio</p>
            <h1 style="color:#ffffff;font-size:26px;margin:0;font-weight:normal;">¿Cómo estuvo tu clase?</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="color:#555;font-size:16px;margin:0 0 8px;">Hola, ${firstName} 🌿</p>
            <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 24px;">
              Acabas de terminar tu clase de <strong style="color:#2c2c2c;">${className}</strong>
              del <span style="color:#2c2c2c;text-transform:capitalize;">${dateLabel}</span>.
            </p>
            <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 32px;">
              Tu valoración ayuda a otras alumnas a elegir sus clases y motiva a nuestras instructoras a seguir creciendo. ¿Nos cuentas cómo fue?
            </p>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="center">
                  <a href="${ratingUrl}" style="display:inline-block;background:#2c2c2c;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:14px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">
                    Valorar mi clase
                  </a>
                </td>
              </tr>
            </table>

            <p style="color:#aaa;font-size:12px;text-align:center;margin:32px 0 0;line-height:1.6;">
              Puedes valorar tu clase en cualquier momento desde el horario.<br/>
              Gracias por ser parte de nuestra comunidad 🙏
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f4f0;padding:24px;text-align:center;border-top:1px solid #e8e4dc;">
            <p style="color:#999;font-size:11px;margin:0;">Alma Studio · Magdalena del Mar, Lima</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
    `,
  });
}
