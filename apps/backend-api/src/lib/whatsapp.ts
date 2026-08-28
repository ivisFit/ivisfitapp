const DEFAULT_WHATSAPP_PHONE = "59898390351";

export function getWhatsAppPhone(): string {
  return process.env.WHATSAPP_PHONE?.trim() || DEFAULT_WHATSAPP_PHONE;
}

export type WhatsAppEvaluationMessageInput = {
  resumenTexto: string;
  planName: string;
  nombre?: string;
};

export function buildWhatsAppEvaluationMessage({
  resumenTexto,
  planName,
  nombre,
}: WhatsAppEvaluationMessageInput): string {
  const greeting = nombre
    ? `¡Hola Ivis! Soy ${nombre} y hice la evaluación en la web de IVIIS FIT.`
    : "¡Hola Ivis! Hice la evaluación en la web de IVIIS FIT.";

  return `${greeting}

${resumenTexto}

Me interesa el ${planName}. ¿Podés revisar mi caso antes de decidir?`;
}

export function buildWhatsAppEvaluationLink(
  input: WhatsAppEvaluationMessageInput,
): string {
  const phone = getWhatsAppPhone();
  const message = buildWhatsAppEvaluationMessage(input);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppLink(message: string): string {
  const phone = getWhatsAppPhone();
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppComunidadHref(nombre?: string): string {
  const communityUrl = process.env.WHATSAPP_COMMUNITY_URL?.trim();
  if (communityUrl) return communityUrl;

  const greeting = nombre
    ? `Hola Ivis, soy ${nombre}. Quiero sumarme al grupo de la comunidad.`
    : "Hola Ivis, quiero sumarme al grupo de la comunidad.";
  return buildWhatsAppLink(greeting);
}

export function buildWhatsAppIvisHref(nombre?: string, tema?: string): string {
  const topic = tema?.trim();
  const greeting = nombre
    ? `Hola Ivis, soy ${nombre}${topic ? ` y ${topic}` : " y me gustaría contarte algo"}.`
    : `Hola Ivis${topic ? `, ${topic}` : ", me gustaría contarte algo"}.`;
  return buildWhatsAppLink(greeting);
}
