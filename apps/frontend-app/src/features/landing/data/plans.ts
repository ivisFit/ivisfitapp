export const WHATSAPP_PHONE =
  process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.trim() || "59898390351";
export const DISPLAY_PHONE = "+598 98 390 351";
export const CONTACT_EMAIL = "ivannafernandez7@gmail.com";
export const INSTAGRAM_URL = "https://www.instagram.com/iviis.fit/";
export const WEBSITE_URL = "https://www.ivisfit.com";

export type Plan = {
  id: string;
  title: string;
  shortTitle: string;
  route: string;
  subtitle: string;
  duration: string;
  format: string;
  investment: string;
  badge: string;
  cardBullets: string[];
  intro: string;
  focus: string;
  methodology?: string;
  extras: string[];
  benefits?: string[];
  ctaLabel: string;
  cardImage?: string;
  isActive?: boolean;
};

export const getWhatsAppLink = (planTitle?: string) => {
  const message = planTitle
    ? `¡Hola! Estoy interesada en el ${planTitle}. ¿Podrías brindarme más información sobre precios, beneficios y cómo empezar?`
    : "¡Hola! Estuve viendo tus planes y me encantaría sumarme a uno. ¿Podrías contarme cuál sería el ideal para mí?";

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
};
