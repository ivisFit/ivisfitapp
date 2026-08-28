export type FaqItem = {
  question: string;
  answer: string;
};

export type TestimonioItem = {
  nombre: string;
  role: string;
  textos: string[];
};

export type HomeDictionary = {
  home: {
    hero: {
      eyebrow: string;
      titleLine1: string;
      titleLine2: string;
      highlight: string;
      description: string;
      descriptionMobile: string;
      ctaPrimary: string;
      ctaSecondary: string;
      appPreviewImage: string;
    };
    presentacion: {
      greeting: string;
      title: string;
      body: string;
      hashtag: string;
      image: string;
    };
    faq: {
      eyebrow: string;
      title: string;
      subtitle: string;
      items: FaqItem[];
    };
    testimonios: {
      eyebrow: string;
      title: string;
      subtitle: string;
      backgroundImage: string;
      items: TestimonioItem[];
    };
    estoEsParaTi: {
      eyebrow: string;
      title: string;
      items: string[];
    };
    separadores: {
      transformacion: string;
      camino: string;
    };
    contacto: {
      eyebrow: string;
      title: string;
      titleHighlight: string;
      image: string;
    };
    contacto2: {
      image: string;
    };
    nutricion: {
      eyebrow: string;
      title: string;
      body: string;
    };
    incluyenPlanes: {
      eyebrow: string;
      title: string;
      highlight: string;
      subtitle: string;
      imageDesktop: string;
      imageMobile: string;
    };
    planTotal: {
      backgroundImage: string;
    };
    planTotal2: {
      backgroundImage: string;
    };
    transformaciones: {
      eyebrow: string;
      title: string;
      images: string[];
    };
    footer: {
      tagline: string;
      logo: string;
      instagramIcon: string;
    };
  };
};

export const DEFAULT_HOME_DICTIONARY: HomeDictionary = {
  home: {
    hero: {
      eyebrow: "",
      titleLine1: "ENTRENA CON",
      titleLine2: "PROPÓSITO 2026",
      highlight: "",
      description: "",
      descriptionMobile: "",
      ctaPrimary: "Ver planes",
      ctaSecondary: "Conóceme",
      appPreviewImage: "/imgs/app-rutina-preview.png",
    },
    presentacion: {
      greeting: "HOLA",
      title: "Soy Ivis",
      body: "Hola, soy Ivis Fernández: entrenadora personal con formación en educación física, musculación y nutrición deportiva.\n\nMi misión es ayudarte a alcanzar tu mejor versión con un seguimiento 100% personalizado, transformando vidas a través del deporte y la disciplina.\n\nSoy especialista en musculación femenina con enfoque en recomposición corporal. Trabajo para que cada entrenamiento tenga intención, técnica y una progresión real según tus objetivos.\n\nEn Ivis Fit no se trata de entrenar por obligación: se trata de construir hábitos, fuerza, confianza y una relación más consciente con tu cuerpo.",
      hashtag: "# ENTRENA CON PROPÓSITO 2026",
      image: "/imgs/Presentacion.JPG",
    },
    faq: {
      eyebrow: "PREGUNTAS FRECUENTES",
      title: "¿Tenés dudas?",
      subtitle: "Acá las respondemos",
      items: [
        {
          question: "¿En qué consisten los programas de Ivis Fit?",
          answer:
            "Son programas de entrenamiento con guía nutricional, seguimiento y ajustes según tus objetivos, nivel de experiencia y disponibilidad.",
        },
        {
          question: "¿Cómo recibo mi plan una vez contratado?",
          answer:
            "Una vez coordinado el programa, recibirás las indicaciones para completar tu información inicial y acceder a tu rutina, guía nutricional y seguimiento.",
        },
        {
          question: "¿Qué tipos de objetivos puedo trabajar con Ivis Fit?",
          answer:
            "Puedes elegir planes para pérdida de peso, aumento de masa muscular, tonificación (especialmente glúteos y abdomen), mejora de hábitos saludables o recomposición corporal.",
        },
        {
          question: "¿Necesito tener experiencia previa en entrenamiento para comenzar?",
          answer:
            "¡No! Diseño planes tanto para principiantes como para avanzados. Ajustamos cargas, ejercicios y rutinas según tu nivel y recursos disponibles.",
        },
        {
          question: "¿Puedo entrenar en casa o necesito un gimnasio?",
          answer:
            "Ambos son posibles. Adapto tu plan según el equipamiento que tengas disponible: mancuernas, bandas elásticas o máquinas de gimnasio.",
        },
        {
          question: "¿Dónde se hacen las asesorías?",
          answer:
            "Depende del programa: hay opciones digitales, 100% online, semi presenciales y presenciales.",
        },
        {
          question: "¿Qué necesito para entrenar?",
          answer: "Depende del plan, pero puedo adaptarlo a gimnasio o a casa. Te aviso el material necesario.",
        },
        {
          question: "¿Incluye alimentación?",
          answer: "Sí, todos los planes incluyen guía nutricional adaptada a tus objetivos.",
        },
        {
          question: "¿Cuál es el plan ideal para mí?",
          answer:
            "Escríbeme por WhatsApp y revisamos tu objetivo, disponibilidad, experiencia y si entrenas en casa, gym o presencial.",
        },
        {
          question: "¿Cómo se paga?",
          answer: "Acepto transferencias, depósito o pago por PayPal.",
        },
        {
          question: "¿Cómo es el seguimiento durante la asesoría?",
          answer:
            "Depende del plan elegido: algunos incluyen check-ins regulares, seguimiento semanal, soporte limitado o soporte ilimitado vía App.",
        },
        {
          question: "¿Los programas incluyen alimentación?",
          answer:
            "Sí, los programas incluyen guía nutricional o plan alimenticio según el tipo de programa contratado.",
        },
        {
          question: "¿Cuánto duran los planes?",
          answer:
            "Hay programas de 4 semanas y de 8 semanas. El entrenamiento presencial se coordina de forma mensual según días y horarios disponibles.",
        },
        {
          question: "¿Qué medios de pago se aceptan?",
          answer:
            "Se aceptan transferencias bancarias, Mercado Pago y PayPal. Desde Uruguay o desde el exterior.",
        },
        {
          question: "¿En cuánto tiempo veré resultados?",
          answer:
            "Depende de la constancia, alimentación y descanso. Muchos clientes comienzan a notar cambios desde la cuarta semana, pero buscamos resultados sostenibles y saludables, no soluciones rápidas.",
        },
      ],
    },
    testimonios: {
      eyebrow: "Historias reales",
      title: "TESTIMONIOS",
      subtitle:
        "Resultados reales de personas que confiaron en el proceso. Esto es lo que viven día a día entrenando conmigo.",
      backgroundImage: "/imgs/testimonio.jpg",
      items: [
        {
          nombre: "Mica",
          role: "Alumna Ivis Fit",
          textos: [
            "Mi experiencia ha sido muy buena, aprendí a alimentarme mejor sin pasar hambre y comiendo variado.",
            "Tu acompañamiento me ayuda a sentirme contenida en los momentos que necesito motivación.",
          ],
        },
        {
          nombre: "Pablo",
          role: "Alumno Ivis Fit",
          textos: [
            "Excelente. Mi cambio físico fue muy notorio gracias a tus rutinas.",
            "Antes iba al gimnasio y no tenía una rutina realmente pensada en mis objetivos.",
          ],
        },
        {
          nombre: "Carla",
          role: "Alumna Ivis Fit",
          textos: [
            "Nunca creí que iba a ver estos cambios en mi físico.",
            "Logré bajar muchísimo mi porcentaje graso y sentirme cómoda con mi cuerpo y con más energía.",
            "Gracias por ayudarme a lograr mejores hábitos.",
          ],
        },
      ],
    },
    estoEsParaTi: {
      eyebrow: "SIENTE EL CAMBIO",
      title: "Esto es para ti si:",
      items: [
        "Te miras al espejo, y no te gusta lo que ves.",
        "La ropa que te gustaría usar, no te sienta cómoda.",
        "Estas dispuesta a salir de tu zona de confort.",
        "Necesitas una guía, en este nuevo camino.",
        "Reconoces que para cambiar tu cuerpo definitivamente, primero debes cambiar tu mente.",
        "Sos consciente de que tenes el poder de cambiar tu realidad.",
      ],
    },
    separadores: {
      transformacion: "Comienza tu transformación hoy mismo",
      camino: "Comencemos este camino juntas",
    },
    contacto: {
      eyebrow: "Hablemos",
      title: "Contacta ",
      titleHighlight: "Conmigo",
      image: "/imgs/campeonato.JPG",
    },
    contacto2: {
      image: "/imgs/campeonato.JPG",
    },
    nutricion: {
      eyebrow: "Alimentación inteligente",
      title: "NUTRICIÓN PARA TU OBJETIVO",
      body: "Cada programa suma una guía nutricional pensada para acompañar tu entrenamiento y potenciar tus objetivos.",
    },
    incluyenPlanes: {
      eyebrow: "Todo lo que recibes",
      title: "¿Qué incluye cada plan?",
      highlight: "¡Descúbrelo!",
      subtitle:
        "Cada programa combina entrenamiento, nutrición y seguimiento personalizado. Despliega cada plan y descubre todo lo que vas a recibir.",
      imageDesktop: "/imgs/IncluyenPlanes.jpg",
      imageMobile: "/imgs/pesas.jpg",
    },
    planTotal: {
      backgroundImage: "/imgs/imagenPlanTotal.jpg",
    },
    planTotal2: {
      backgroundImage: "/imgs/imagenPlanTotal.jpg",
    },
    transformaciones: {
      eyebrow: "EDUCA TU MENTE. CAMBIA TU CUERPO",
      title: "Transformaciones de Alumnos",
      images: [
        "/imgs/transformaciones/Fabiana.jpeg",
        "/imgs/transformaciones/Pablo.png",
        "/imgs/transformaciones/omar.jpeg",
        "/imgs/transformaciones/Gaby.png",
        "/imgs/transformaciones/Fabiana2.jpeg",
        "/imgs/transformaciones/omar2.jpeg",
        "/imgs/transformaciones/Pablo2.png",
        "/imgs/transformaciones/omar3.jpeg",
        "/imgs/transformaciones/Fabiana3.jpeg",
      ],
    },
    footer: {
      tagline: "© 2026 ivisfit. # ENTRENA CON PROPÓSITO 2026",
      logo: "/imgs/LogoFooter.png",
      instagramIcon: "/imgs/instagram.png",
    },
  },
};

export function defaultHomeDictionary(): Record<string, unknown> {
  return DEFAULT_HOME_DICTIONARY as unknown as Record<string, unknown>;
}
