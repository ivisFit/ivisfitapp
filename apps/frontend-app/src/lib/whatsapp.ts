const DEFAULT_WHATSAPP_PHONE = "59898390351";

export function getAppWhatsAppPhone() {
  return (
    process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.trim() ||
    process.env.NEXT_PUBLIC_PROFE_WHATSAPP_NUMBER?.trim() ||
    DEFAULT_WHATSAPP_PHONE
  );
}

export function buildCoachGreeting(nombre?: string, tema?: string) {
  const topic = tema?.trim();
  return nombre
    ? `Hola Ivis, soy ${nombre}${topic ? ` y ${topic}` : " y me gustaría contarte algo"}.`
    : `Hola Ivis${topic ? `, ${topic}` : ", me gustaría contarte algo"}.`;
}

export function buildWhatsAppIvisHref(nombre?: string, tema?: string) {
  return `https://wa.me/${getAppWhatsAppPhone()}?text=${encodeURIComponent(buildCoachGreeting(nombre, tema))}`;
}
