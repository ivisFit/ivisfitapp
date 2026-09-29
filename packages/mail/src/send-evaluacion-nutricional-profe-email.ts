import { Resend } from "resend";

export interface SendEvaluacionNutricionalProfeEmailParams {
  to: string;
  alumnaNombre: string;
  objetivoLabel: string;
  alumnaId: string;
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

function buildAlimentacionHref(appUrl: string | undefined, alumnaId: string) {
  if (!appUrl?.trim()) return null;
  const base = appUrl.replace(/\/$/, "");
  return `${base}/alumnas/${encodeURIComponent(alumnaId)}/alimentacion`;
}

export async function sendEvaluacionNutricionalProfeEmail({
  to,
  alumnaNombre,
  objetivoLabel,
  alumnaId,
  appName,
  appUrl,
}: SendEvaluacionNutricionalProfeEmailParams): Promise<void> {
  const resend = getResendClient();
  const from = getFromEmail();
  const alimentacionHref = buildAlimentacionHref(appUrl, alumnaId);
  const link = alimentacionHref
    ? `<p><a href="${alimentacionHref}">Abrir alimentación de ${alumnaNombre}</a></p>`
    : "";

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Nueva evaluación nutricional — ${alumnaNombre}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">${appName}</h2>
        <p><strong>${alumnaNombre}</strong> completó la evaluación nutricional inicial.</p>
        <p>Objetivo principal: <strong>${objetivoLabel}</strong></p>
        <p>Podés revisar sus respuestas y generar el plan desde el panel de alimentación.</p>
        ${link}
      </div>
    `,
    text: `${alumnaNombre} completó la evaluación nutricional. Objetivo: ${objetivoLabel}. Revisá y generá el plan en ${appName}.`,
  });

  if (error) {
    console.error("Error al enviar email de evaluación a profe:", error);
    throw new Error("No se pudo enviar la notificación de evaluación");
  }
}
