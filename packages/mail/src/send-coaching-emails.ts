import { Resend } from "resend";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY no está definida en las variables de entorno");
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

async function sendSimpleEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const resend = getResendClient();
  const from = getFromEmail();
  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
  if (error) {
    console.error("Error al enviar email:", error);
    throw new Error("No se pudo enviar el email");
  }
}

export interface SendRutinaAsignadaEmailParams {
  to: string;
  alumnaNombre: string;
  planNombre?: string;
  appName: string;
  appUrl?: string;
}

export async function sendRutinaAsignadaEmail({
  to,
  alumnaNombre,
  planNombre,
  appName,
  appUrl,
}: SendRutinaAsignadaEmailParams): Promise<void> {
  const link = appUrl
    ? `<p><a href="${appUrl.replace(/\/alimentacion\/?$/, "/rutina")}">Ver mi rutina</a></p>`
    : "";
  const planLine = planNombre ? ` Plan: <strong>${planNombre}</strong>.` : "";

  await sendSimpleEmail({
    to,
    subject: `Tu rutina está lista — ${appName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">${appName}</h2>
        <p>Hola ${alumnaNombre},</p>
        <p>Tu profesora te asignó una rutina.${planLine}</p>
        ${link}
      </div>
    `,
    text: `Hola ${alumnaNombre}, tu rutina ya está disponible en ${appName}.`,
  });
}

export interface SendRecordatorioEntrenamientoEmailParams {
  to: string;
  alumnaNombre: string;
  hora: string;
  appName: string;
  appUrl?: string;
}

export async function sendRecordatorioEntrenamientoEmail({
  to,
  alumnaNombre,
  hora,
  appName,
  appUrl,
}: SendRecordatorioEntrenamientoEmailParams): Promise<void> {
  const link = appUrl
    ? `<p><a href="${appUrl.replace(/\/alimentacion\/?$/, "/rutina")}">Abrir mi rutina</a></p>`
    : "";

  await sendSimpleEmail({
    to,
    subject: `Recordatorio de entrenamiento (${hora}) — ${appName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">${appName}</h2>
        <p>Hola ${alumnaNombre},</p>
        <p>Es hora de entrenar (${hora}). Tu rutina te espera.</p>
        ${link}
      </div>
    `,
    text: `Hola ${alumnaNombre}, recordatorio de entrenamiento a las ${hora} en ${appName}.`,
  });
}

export interface SendResumenSemanalEmailParams {
  to: string;
  alumnaNombre: string;
  entrenosCompletados: number;
  checkinsCumplidos: number;
  checkinsParciales: number;
  checkinsNoPude: number;
  racha: number;
  appName: string;
  appUrl?: string;
}

export async function sendResumenSemanalEmail({
  to,
  alumnaNombre,
  entrenosCompletados,
  checkinsCumplidos,
  checkinsParciales,
  checkinsNoPude,
  racha,
  appName,
  appUrl,
}: SendResumenSemanalEmailParams): Promise<void> {
  const link = appUrl
    ? `<p><a href="${appUrl.replace(/\/alimentacion\/?$/, "/progreso")}">Ver mi progreso</a></p>`
    : "";

  await sendSimpleEmail({
    to,
    subject: `Tu resumen semanal — ${appName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">${appName}</h2>
        <p>Hola ${alumnaNombre},</p>
        <p>Así fue tu semana:</p>
        <ul>
          <li>Entrenamientos completados: <strong>${entrenosCompletados}</strong></li>
          <li>Check-ins de comida cumplidos: <strong>${checkinsCumplidos}</strong></li>
          <li>Parciales: <strong>${checkinsParciales}</strong> · No pude: <strong>${checkinsNoPude}</strong></li>
          <li>Racha actual: <strong>${racha}</strong></li>
        </ul>
        ${link}
      </div>
    `,
    text: `Hola ${alumnaNombre}, resumen semanal ${appName}: ${entrenosCompletados} entrenos, racha ${racha}.`,
  });
}
