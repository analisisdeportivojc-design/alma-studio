import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Vercel Cron: runs daily at 11 PM Lima (04:00 UTC)
// Requires: RESEND_API_KEY and CRON_SECRET in Vercel env vars

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setHours(now.getHours() - 24);

  const { data: sessions } = await admin
    .from("class_sessions")
    .select("id, session_date, instructor_id, classes!inner(name, start_time, duration_minutes)")
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

    const [h, m] = cls.start_time.split(":");
    const endTime = new Date(`${session.session_date}T${h.padStart(2, "0")}:${m.padStart(2, "0")}:00`);
    endTime.setMinutes(endTime.getMinutes() + (cls.duration_minutes || 50));
    if (endTime > now) continue;

    const { data: bookings } = await admin
      .from("bookings")
      .select("user_id, profiles!inner(email, first_name)")
      .eq("session_id", session.id)
      .in("status", ["confirmed", "attended"]);

    if (!bookings?.length) continue;

    const { data: rated } = await admin
      .from("class_ratings")
      .select("user_id")
      .eq("session_id", session.id);

    const ratedSet = new Set((rated || []).map((r) => r.user_id));

    for (const booking of bookings) {
      if (ratedSet.has(booking.user_id)) continue;
      const profile = Array.isArray((booking as any).profiles)
        ? (booking as any).profiles[0]
        : (booking as any).profiles;
      if (!profile?.email) continue;

      try {
        await sendEmail({
          to: profile.email,
          subject: `¿Cómo estuvo tu clase de ${cls.name}?`,
          html: ratingEmailHtml(profile.first_name || "Alumna", cls.name, session.session_date, appUrl),
        });
        sent++;
      } catch (e) {
        console.error("Email error:", e);
      }
    }
  }

  return NextResponse.json({ sent });
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.log(`[cron] No RESEND_API_KEY — skip email to ${to}`); return; }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Alma Studio <hola@alma-studio.pe>", to, subject, html }),
  });
  if (!res.ok) throw new Error(await res.text());
}

function ratingEmailHtml(firstName: string, className: string, sessionDate: string, appUrl: string) {
  const dateLabel = new Date(sessionDate + "T12:00:00").toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long",
  });
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:40px 20px;">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;">
<tr><td style="background:#2c2c2c;padding:40px;text-align:center;">
  <p style="color:#c9a96e;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 8px;">Alma Studio</p>
  <h1 style="color:#fff;font-size:24px;margin:0;font-weight:normal;">¿Cómo estuvo tu clase?</h1>
</td></tr>
<tr><td style="padding:40px;">
  <p style="color:#555;font-size:15px;margin:0 0 12px;">Hola, ${firstName} 🌿</p>
  <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 24px;">
    Terminaste tu clase de <strong style="color:#2c2c2c;">${className}</strong>
    del <span style="text-transform:capitalize;">${dateLabel}</span>.
    Tu valoración ayuda a otras alumnas y motiva a nuestras instructoras.
  </p>
  <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
    <a href="${appUrl}/reserva" style="display:inline-block;background:#2c2c2c;color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">
      Valorar mi clase
    </a>
  </td></tr></table>
</td></tr>
<tr><td style="background:#f5f4f0;padding:20px;text-align:center;">
  <p style="color:#999;font-size:11px;margin:0;">Alma Studio · Magdalena del Mar, Lima</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}
