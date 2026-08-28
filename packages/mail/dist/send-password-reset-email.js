import { Resend } from "resend";
function getResendClient() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error("RESEND_API_KEY no está definida en las variables de entorno");
    }
    return new Resend(apiKey);
}
function getFromEmail() {
    const from = process.env.RESEND_FROM_EMAIL;
    if (!from) {
        throw new Error("RESEND_FROM_EMAIL no está definida en las variables de entorno");
    }
    return from;
}
export async function sendPasswordResetEmail({ to, resetUrl, appName, }) {
    const resend = getResendClient();
    const from = getFromEmail();
    const { error } = await resend.emails.send({
        from,
        to,
        subject: `Restablecer contraseña — ${appName}`,
        html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">${appName}</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #f5c518; color: #1a1a1a; text-decoration: none; font-weight: 600; border-radius: 8px;">
            Restablecer contraseña
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Este enlace expira en una hora. Si no solicitaste restablecer tu contraseña, ignorá este mensaje.
        </p>
        <p style="color: #666; font-size: 12px; word-break: break-all;">
          Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br />
          ${resetUrl}
        </p>
      </div>
    `,
        text: `Restablecé tu contraseña de ${appName} visitando: ${resetUrl}. El enlace expira en una hora. Si no solicitaste esto, ignorá este mensaje.`,
    });
    if (error) {
        console.error("Error al enviar email de restablecimiento:", error);
        throw new Error("No se pudo enviar el email de restablecimiento");
    }
}
//# sourceMappingURL=send-password-reset-email.js.map