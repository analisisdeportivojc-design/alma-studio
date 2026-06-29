const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "Alma Studio <noreply@almastudio.com.pe>";

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  // If no API key, log to console (development mode)
  if (!RESEND_API_KEY) {
    console.log(`[EMAIL-DEV] To: ${to} | Subject: ${subject}`);
    return { success: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.message || "Error enviando email" };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Error de conexión" };
  }
}
