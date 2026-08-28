import { Resend } from "resend";

export interface SendOtpEmailParams {
  to: string;
  code: string;
  appName: string;
}

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY no está definida en las variables de entorno",
    );
  }

  return new Resend(apiKey);
}

function getFromEmail(): string {
  const from = process.env.RESEND_FROM_EMAIL;

  if (!from) {
    throw new Error(
      "RESEND_FROM_EMAIL no está definida en las variables de entorno",
    );
  }

  return from;
}

export async function sendOtpEmail({
  to,
  code,
  appName,
}: SendOtpEmailParams): Promise<void> {
  const resend = getResendClient();
  const from = getFromEmail();

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Tu código de verificación — ${appName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">${appName}</h2>
        <p>Tu código de verificación en dos pasos es:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2563eb;">
          ${code}
        </p>
        <p style="color: #666; font-size: 14px;">
          Este código expira en unos minutos. Si no solicitaste este código, ignorá este mensaje.
        </p>
      </div>
    `,
    text: `Tu código de verificación para ${appName} es: ${code}. Expira en unos minutos.`,
  });

  if (error) {
    console.error("Error al enviar OTP por email:", error);
    throw new Error("No se pudo enviar el código de verificación");
  }
}
