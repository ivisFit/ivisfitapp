import { Resend } from "resend";

export interface SendPlanNutricionalEmailParams {
  to: string;
  alumnaNombre: string;
  appName: string;
  appUrl?: string;
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

export async function sendPlanNutricionalEmail({
  to,
  alumnaNombre,
  appName,
  appUrl,
}: SendPlanNutricionalEmailParams): Promise<void> {
  const resend = getResendClient();
  const from = getFromEmail();
  const link = appUrl ? `<p><a href="${appUrl}">Ver mi plan en la app</a></p>` : "";

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Tu plan nutricional está listo — ${appName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">${appName}</h2>
        <p>Hola ${alumnaNombre},</p>
        <p>Tu profesora publicó tu plan nutricional personalizado. Ya podés verlo en la sección de Alimentación de la app.</p>
        ${link}
        <p style="color: #666; font-size: 14px;">
          Si tenés dudas, usá el asistente nutricional dentro de la app o contactá a tu profe.
        </p>
      </div>
    `,
    text: `Hola ${alumnaNombre}, tu plan nutricional ya está disponible en ${appName}. Ingresá a la sección Alimentación para verlo.`,
  });

  if (error) {
    console.error("Error al enviar email de plan nutricional:", error);
    throw new Error("No se pudo enviar la notificación del plan");
  }
}
