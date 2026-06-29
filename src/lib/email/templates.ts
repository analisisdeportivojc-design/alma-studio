const baseStyle = `
  body { margin: 0; padding: 0; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .container { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
  .card { background: #ffffff; border-radius: 12px; padding: 40px 32px; }
  .logo { font-family: Georgia, 'Times New Roman', serif; font-size: 24px; color: #3d3d3d; text-align: center; margin-bottom: 32px; }
  .divider { border: none; border-top: 1px solid #e8e4df; margin: 24px 0; }
  h1 { font-family: Georgia, 'Times New Roman', serif; color: #3d3d3d; font-size: 22px; margin: 0 0 8px 0; }
  h2 { font-family: Georgia, 'Times New Roman', serif; color: #3d3d3d; font-size: 18px; margin: 24px 0 8px 0; }
  p { color: #6b6b6b; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0; }
  .highlight { color: #b8956a; font-weight: bold; }
  .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f0eb; }
  .detail-label { color: #9a9a9a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; }
  .detail-value { color: #3d3d3d; font-size: 14px; font-weight: bold; }
  .btn { display: inline-block; background: #3d3d3d; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 24px; }
  .btn-outline { display: inline-block; border: 1px solid #3d3d3d; color: #3d3d3d; text-decoration: none; padding: 12px 28px; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 16px; }
  .footer { text-align: center; padding: 24px 0; color: #b8956a; font-size: 11px; }
  .footer a { color: #b8956a; text-decoration: none; }
  .info-box { background: #f5f0eb; border-radius: 8px; padding: 16px 20px; margin: 16px 0; }
`;

function wrapEmail(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>${baseStyle}</style></head>
<body>
<div class="container">
  <div class="card">
    <div class="logo">Alma Studio</div>
    ${content}
  </div>
  <div class="footer">
    <p>Alma Studio · Jirón Castilla 758, Magdalena del Mar</p>
    <p>+51 951 251 796 · <a href="mailto:contacto@almastudio.com.pe">contacto@almastudio.com.pe</a></p>
    <p style="margin-top: 8px;"><a href="https://almastudio.com.pe/legal/terminos">Términos</a> · <a href="https://almastudio.com.pe/legal/privacidad">Privacidad</a></p>
  </div>
</div>
</body>
</html>`;
}

export function welcomeEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: "Bienvenida a Alma Studio ✨",
    html: wrapEmail(`
      <h1>Hola, ${firstName}</h1>
      <p>Bienvenida a <span class="highlight">Alma Studio</span>. Nos alegra que formes parte de nuestra comunidad.</p>

      <hr class="divider">

      <h2>¿Qué sigue?</h2>
      <p>Tu cuenta está lista. Ahora puedes:</p>

      <div class="info-box">
        <p style="margin:0"><strong>1.</strong> Explorar nuestras disciplinas: Barré, Pilates Mat y Reformer</p>
      </div>
      <div class="info-box">
        <p style="margin:0"><strong>2.</strong> Reservar tu primera clase</p>
      </div>
      <div class="info-box">
        <p style="margin:0"><strong>3.</strong> Elegir el paquete que mejor se adapte a ti</p>
      </div>

      <p style="text-align:center">
        <a href="https://almastudio.com.pe/reserva" class="btn">Reservar mi primera clase</a>
      </p>

      <hr class="divider">

      <p style="font-size:13px; color:#9a9a9a;">
        Si tienes alguna pregunta, escríbenos por
        <a href="https://wa.me/51951251796" style="color:#b8956a">WhatsApp</a>
        y te responderemos con gusto.
      </p>
    `),
  };
}

export function bookingConfirmedEmail(
  firstName: string,
  className: string,
  date: string,
  time: string,
  instructor?: string
): { subject: string; html: string } {
  return {
    subject: `Reserva confirmada — ${className}`,
    html: wrapEmail(`
      <h1>¡Clase reservada!</h1>
      <p>Hola <span class="highlight">${firstName}</span>, tu reserva está confirmada.</p>

      <hr class="divider">

      <div style="padding: 8px 0;">
        <div style="margin-bottom: 12px;">
          <span class="detail-label">Clase</span><br>
          <span class="detail-value">${className}</span>
        </div>
        <div style="margin-bottom: 12px;">
          <span class="detail-label">Fecha</span><br>
          <span class="detail-value">${date}</span>
        </div>
        <div style="margin-bottom: 12px;">
          <span class="detail-label">Hora</span><br>
          <span class="detail-value">${time}</span>
        </div>
        ${instructor ? `
        <div style="margin-bottom: 12px;">
          <span class="detail-label">Instructora</span><br>
          <span class="detail-value">${instructor}</span>
        </div>
        ` : ""}
      </div>

      <div class="info-box">
        <p style="margin:0; font-size:13px;">
          📍 <strong>Jirón Castilla 758, Magdalena del Mar</strong><br>
          ⏰ Llega 10 minutos antes · Tolerancia: 15 min<br>
          🧦 Trae medias antideslizantes
        </p>
      </div>

      <hr class="divider">

      <p style="font-size:13px; color:#9a9a9a;">
        ¿Necesitas cancelar? Puedes hacerlo hasta 24 horas antes sin cargo.
        Escríbenos por <a href="https://wa.me/51951251796" style="color:#b8956a">WhatsApp</a>
        o llama al +51 951 251 796.
      </p>
    `),
  };
}

export function bookingCancelledEmail(
  firstName: string,
  className: string,
  date: string
): { subject: string; html: string } {
  return {
    subject: `Reserva cancelada — ${className}`,
    html: wrapEmail(`
      <h1>Reserva cancelada</h1>
      <p>Hola <span class="highlight">${firstName}</span>, tu reserva ha sido cancelada.</p>

      <div style="padding: 12px 0;">
        <div style="margin-bottom: 12px;">
          <span class="detail-label">Clase</span><br>
          <span class="detail-value">${className}</span>
        </div>
        <div style="margin-bottom: 12px;">
          <span class="detail-label">Fecha</span><br>
          <span class="detail-value">${date}</span>
        </div>
      </div>

      <hr class="divider">

      <p>Si fue un error o quieres reagendar, puedes reservar otra clase:</p>

      <p style="text-align:center">
        <a href="https://almastudio.com.pe/reserva" class="btn-outline">Ver horarios disponibles</a>
      </p>
    `),
  };
}

export function paymentConfirmedEmail(
  firstName: string,
  packageName: string,
  amount: number,
  classes: number,
  validUntil: string
): { subject: string; html: string } {
  return {
    subject: `Pago confirmado — ${packageName}`,
    html: wrapEmail(`
      <h1>¡Pago exitoso!</h1>
      <p>Hola <span class="highlight">${firstName}</span>, tu plan está activo.</p>

      <hr class="divider">

      <div style="padding: 8px 0;">
        <div style="margin-bottom: 12px;">
          <span class="detail-label">Plan</span><br>
          <span class="detail-value">${packageName}</span>
        </div>
        <div style="margin-bottom: 12px;">
          <span class="detail-label">Monto</span><br>
          <span class="detail-value">S/.${amount.toFixed(2)}</span>
        </div>
        <div style="margin-bottom: 12px;">
          <span class="detail-label">Clases incluidas</span><br>
          <span class="detail-value">${classes} clases presenciales</span>
        </div>
        <div style="margin-bottom: 12px;">
          <span class="detail-label">Vigencia hasta</span><br>
          <span class="detail-value">${validUntil}</span>
        </div>
      </div>

      <p style="text-align:center">
        <a href="https://almastudio.com.pe/reserva" class="btn">Reservar mi primera clase</a>
      </p>

      <hr class="divider">

      <p style="font-size:13px; color:#9a9a9a;">
        Este comprobante es informativo. Para consultas sobre tu pago,
        escríbenos por <a href="https://wa.me/51951251796" style="color:#b8956a">WhatsApp</a>.
      </p>
    `),
  };
}

export function classReminderEmail(
  firstName: string,
  className: string,
  date: string,
  time: string
): { subject: string; html: string } {
  return {
    subject: `Recordatorio: ${className} mañana`,
    html: wrapEmail(`
      <h1>Tu clase es mañana</h1>
      <p>Hola <span class="highlight">${firstName}</span>, te recordamos que tienes una clase reservada.</p>

      <div class="info-box">
        <p style="margin:0;">
          <strong>${className}</strong><br>
          📅 ${date} · ⏰ ${time}<br>
          📍 Jirón Castilla 758, Magdalena del Mar
        </p>
      </div>

      <p style="font-size:13px;">
        🧦 No olvides tus medias antideslizantes<br>
        ⏰ Llega 10 minutos antes
      </p>

      <hr class="divider">

      <p style="font-size:13px; color:#9a9a9a;">
        ¿No puedes asistir? Cancela hasta 24 horas antes sin cargo por
        <a href="https://wa.me/51951251796" style="color:#b8956a">WhatsApp</a>.
      </p>
    `),
  };
}
