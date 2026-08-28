const DEFAULT_WHATSAPP_PHONE = "59898390351";

export function getWhatsAppPhone(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.trim() || DEFAULT_WHATSAPP_PHONE;
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
