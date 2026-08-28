import type { Plan } from "@/features/landing/data/plans";

/** Planes por defecto si la API no responde (cold start, 429, etc.). */
export const FALLBACK_LANDING_PLANS: Plan[] = [
  {
    id: "gluteos",
    title: "Plan de Glúteos de Acero",
    shortTitle: "Glúteos de Acero",
    route: "/gluteos",
    subtitle: "Hipertrofia de glúteos y piernas con enfoque científico",
    duration: "8 semanas (2 meses)",
    format: "Específico",
    investment: "$3000",
    badge: "PROGRAMA ESPECÍFICO",
    cardBullets: [
      "Programa de nivel élite para glúteos y piernas.",
      "Sobrecarga progresiva científica y controlada.",
      "Nutrición de precisión, movilidad y seguimiento semanal.",
    ],
    intro:
      "Programa de nivel élite, diseñado científicamente para forjar una hipertrofia de glúteos y piernas de hierro, optimizando cada repetición con biomecánica avanzada y periodización estratégica.",
    focus:
      "Tren inferior al límite, con entrenamientos enfocados en glúteos y piernas.",
    methodology:
      "Rutinas progresivas y efectivas con una selección élite de ejercicios biomecánicamente superiores.",
    extras: [
      "Plan nutricional de precisión para el crecimiento de glúteos.",
      "Protocolos de recuperación y movilidad.",
      "Soporte exclusivo y seguimiento semanal.",
    ],
    ctaLabel: "Quiero Glúteos de Acero",
    cardImage: "/imgs/imagenback2.jpg",
  },
  {
    id: "abs-power",
    title: "Abs Power",
    shortTitle: "Abs Power",
    route: "/abs-power",
    subtitle: "Core fuerte, estable y definido",
    duration: "4 semanas (1 mes)",
    format: "Digital",
    investment: "$2000",
    badge: "FORMATO DIGITAL",
    cardBullets: [
      "Rutinas cortas e intensas para abdomen.",
      "Periodización de 8 semanas en 2 ciclos.",
      "Videos, guía técnica, nutrición y recuperación específica.",
    ],
    intro:
      "Fortalece tu core con rutinas cortas e intensas que optimizan tu estabilidad y estética abdominal.",
    focus:
      "Rutinas específicas para abdomen, logrando un núcleo fuerte y definido y maximizando la hipertrofia abdominal.",
    methodology:
      "Ejercicios efectivos y variados con guía de activación muscular precisa para cada fibra, de oblicuos a rectus abdominis inferior, sin crunches genéricos.",
    extras: [
      "Videos explicativos y guía técnica incluida.",
      "Guía nutricional completa adaptada a cada fase.",
      "Protocolo de suplementación opcional.",
    ],
    benefits: [
      "Ciclo 1 enfocado en técnica y volumen.",
      "Ciclo 2 enfocado en intensidad y definición.",
    ],
    ctaLabel: "Quiero Abs Power",
    cardImage: "/imgs/imagenback3.jpg",
  },
  {
    id: "mami-fit",
    title: "Mami Fit",
    shortTitle: "Mami Fit",
    route: "/mami-fit",
    subtitle: "Recuperación post-embarazo segura y progresiva",
    duration: "8 semanas (2 meses)",
    format: "Digital desde casa",
    investment: "$3000",
    badge: "POST-EMBARAZO",
    cardBullets: [
      "Rutinas cortas y seguras para el post-embarazo.",
      "Estabilidad pélvica, abdominal y postural.",
      "Guía nutricional para madres y soporte continuo.",
    ],
    intro:
      "Recupera tu core con rutinas cortas y seguras para el post-embarazo, enfocadas en la estabilidad pélvica y abdominal. No importa el tiempo que haya pasado desde que fuiste madre.",
    focus:
      "Rehabilitación muscular completa, maximizando tu recuperación abdominal.",
    methodology:
      "8 semanas de progresión estratégica con clases diseñadas para entrenar desde casa.",
    extras: [
      "Ejercicios que puedes hacer en casa todos los días.",
      "Plan nutricional adaptado para madres.",
      "Comunidad y soporte continuo.",
    ],
    benefits: [
      "Cierra la diástasis abdominal.",
      "Fortalece el suelo pélvico.",
      "Mejora la estabilidad postural.",
      "Ayuda a eliminar y prevenir la incontinencia de esfuerzo.",
    ],
    ctaLabel: "Quiero Mami Fit",
    cardImage: "/imgs/imagenback2.jpg",
  },
  {
    id: "online",
    title: "Plan 100% Online",
    shortTitle: "100% Online",
    route: "/online",
    subtitle: "Entrenamiento personalizado mensual desde donde estés",
    duration: "4 semanas (1 mes)",
    format: "100% Online",
    investment: "$2500",
    badge: "MENSUAL RECURRENTE",
    cardBullets: [
      "Acceso completo a la plataforma.",
      "Rutinas personalizadas para gym o casa.",
      "Guía nutricional, videos, evaluación inicial y check-ins.",
    ],
    intro:
      "Plan mensual 100% online para entrenar con estructura, seguimiento y una rutina adaptada a tu nivel, objetivos y equipo disponible.",
    focus:
      "Rutinas personalizadas adaptadas a tu nivel, objetivos y equipo disponible, ya sea en gym o en casa.",
    methodology:
      "Evaluación inicial, registro de progresos, check-ins regulares y ajustes según evolución.",
    extras: [
      "Acceso completo a la plataforma.",
      "Guía nutricional específica, flexible y acorde a tus objetivos.",
      "Videos explicativos de técnica.",
      "1 clase mensual online en vivo.",
      "Soporte limitado vía App.",
    ],
    ctaLabel: "Quiero el Plan Online",
    cardImage: "/imgs/imagenback1.jpg",
  },
  {
    id: "semi-presencial",
    title: "Plan Semi Presencial",
    shortTitle: "Semi Presencial",
    route: "/semi-presencial",
    subtitle: "Acompañamiento online con una clase presencial semanal",
    duration: "4 semanas (1 mes)",
    format: "Semi presencial",
    investment: "$4000",
    badge: "SEMI PRESENCIAL",
    cardBullets: [
      "1 clase presencial por semana.",
      "Rutinas personalizadas según nivel, objetivos y equipo.",
      "Plan alimenticio y soporte ilimitado vía App.",
    ],
    intro:
      "Un plan mensual para combinar estructura personalizada con contacto presencial semanal y seguimiento cercano.",
    focus:
      "Rutinas personalizadas adaptadas a tu nivel, objetivos y equipo disponible.",
    methodology:
      "Trabajo semanal con clase presencial, registro de datos y devolución de seguimiento para ajustar el proceso.",
    extras: [
      "Plan alimenticio.",
      "Videos explicativos.",
      "Evaluación inicial y registro de progresos.",
      "Soporte ilimitado vía App.",
    ],
    ctaLabel: "Quiero el Plan Semi Presencial",
    cardImage: "/imgs/imagenback1.jpg",
  },
  {
    id: "presencial",
    title: "Entrenamiento Personalizado Presencial",
    shortTitle: "Presencial",
    route: "/presencial",
    subtitle: "Exigencia máxima, control total y atención exclusiva",
    duration: "4 semanas (mensual)",
    format: "Presencial",
    investment: "Precio a convenir",
    badge: "PRESENCIAL",
    cardBullets: [
      "Entrenamientos diarios en el lugar que te quede cómodo.",
      "Rutinas 100% personalizadas y atención exclusiva.",
      "Precio según disponibilidad de días y horarios.",
    ],
    intro:
      "¡Entrenemos juntas! Exigencia máxima y control total. Entrenemos todos los días juntas en el lugar que te quede cómodo a vos.",
    focus:
      "Atención presencial exclusiva con resultados adaptados a tus objetivos.",
    methodology:
      "Entrenamientos diarios, guía técnica precisa y control de progresos con devolución de seguimiento.",
    extras: [
      "Rutinas 100% personalizadas.",
      "Plan alimenticio.",
      "Videos explicativos.",
      "Precio a convenir según disponibilidad de días y horarios.",
    ],
    ctaLabel: "Consultar disponibilidad",
    cardImage: "/imgs/imagenback3.jpg",
  },
];

export function getFallbackLandingPlanBySlug(slug: string): Plan | undefined {
  return FALLBACK_LANDING_PLANS.find((plan) => plan.id === slug);
}
