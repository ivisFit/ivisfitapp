export const REGISTER_TOTAL_STEPS = 5;

export const MAX_COMPROBANTE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_COMPROBANTE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export type RegisterStep = 1 | 2 | 3 | 4 | 5;

export type RegisterFormData = {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
  cedula: string;
  telefono: string;
  fechaNacimiento: string;
  sexo: "hombre" | "mujer" | "";
  alturaCm: string;
  mutualista: string;
  coberturaEmergenciaMedica: string;
  lesionesPatologias: string;
  alergias: string;
};

export type UploadedComprobante = {
  url: string;
  publicId: string;
  nombreArchivo?: string;
  formato?: string;
  bytes?: number;
};

export const INITIAL_REGISTER_FORM: RegisterFormData = {
  nombre: "",
  email: "",
  password: "",
  confirmPassword: "",
  cedula: "",
  telefono: "",
  fechaNacimiento: "",
  sexo: "",
  alturaCm: "",
  mutualista: "",
  coberturaEmergenciaMedica: "",
  lesionesPatologias: "",
  alergias: "",
};

export const REGISTER_STEPS = [
  {
    id: 1 as RegisterStep,
    label: "Tu cuenta",
    title: "Tu cuenta",
    subtitle: "Creá tu acceso para ingresar cuando te admitan al programa.",
  },
  {
    id: 2 as RegisterStep,
    label: "Contacto",
    title: "Contacto",
    subtitle: "Necesitamos estos datos para identificarte y comunicarnos.",
  },
  {
    id: 3 as RegisterStep,
    label: "Perfil",
    title: "Perfil",
    subtitle: "Información básica para personalizar tu plan de entrenamiento.",
  },
  {
    id: 4 as RegisterStep,
    label: "Salud",
    title: "Salud",
    subtitle: "Contanos si tenés alguna condición que debamos tener en cuenta.",
  },
  {
    id: 5 as RegisterStep,
    label: "Pago",
    title: "Comprobante de pago",
    subtitle: "Adjuntá una captura, foto o PDF del comprobante para finalizar.",
  },
] as const;

export function getRegisterStepConfig(step: RegisterStep) {
  return REGISTER_STEPS[step - 1];
}

export function getRegisterProgressPercent(step: RegisterStep) {
  return Math.round((step / REGISTER_TOTAL_STEPS) * 100);
}

export function validateRegisterStep(
  step: RegisterStep,
  data: RegisterFormData,
  comprobante: File | null,
): string | null {
  switch (step) {
    case 1: {
      if (!data.nombre.trim()) return "Ingresá tu nombre y apellido";
      if (!data.email.trim()) return "Ingresá tu correo electrónico";
      if (data.password.length < 8) {
        return "La contraseña debe tener al menos 8 caracteres";
      }
      if (data.password !== data.confirmPassword) {
        return "Las contraseñas no coinciden";
      }
      return null;
    }
    case 2: {
      if (!/^\d+$/.test(data.cedula.trim())) {
        return "Ingresá la cédula sin puntos ni guión";
      }
      if (!data.telefono.trim()) return "Ingresá tu teléfono";
      if (!data.fechaNacimiento) return "Ingresá tu fecha de nacimiento";
      return null;
    }
    case 3: {
      if (data.sexo !== "hombre" && data.sexo !== "mujer") {
        return "Seleccioná si sos hombre o mujer";
      }
      const altura = Number(data.alturaCm);
      if (!Number.isFinite(altura) || altura <= 0) {
        return "Ingresá una altura válida en centímetros";
      }
      if (!data.mutualista.trim()) return "Ingresá tu servicio médico";
      if (!data.coberturaEmergenciaMedica.trim()) {
        return "Ingresá tu cobertura de emergencia médica";
      }
      return null;
    }
    case 4: {
      if (!data.lesionesPatologias.trim()) {
        return "Completá lesiones o patologías (podés escribir 'ninguna')";
      }
      if (!data.alergias.trim()) {
        return "Completá alergias (podés escribir 'ninguna')";
      }
      return null;
    }
    case 5: {
      if (!comprobante) return "Adjuntá el comprobante de pago para continuar";
      if (!ALLOWED_COMPROBANTE_TYPES.has(comprobante.type)) {
        return "El comprobante debe ser PDF, JPG, PNG o WebP";
      }
      if (comprobante.size > MAX_COMPROBANTE_BYTES) {
        return "El comprobante no puede superar los 5 MB";
      }
      return null;
    }
    default:
      return null;
  }
}

export function validateComprobanteFile(file: File | null): string | null {
  if (!file) return null;
  if (!ALLOWED_COMPROBANTE_TYPES.has(file.type)) {
    return "El comprobante debe ser PDF, JPG, PNG o WebP";
  }
  if (file.size > MAX_COMPROBANTE_BYTES) {
    return "El comprobante no puede superar los 5 MB";
  }
  return null;
}

export function getProfeWhatsappUrl() {
  const phone = process.env.NEXT_PUBLIC_PROFE_WHATSAPP_NUMBER ?? "";
  const message = encodeURIComponent(
    "Hola, quiero solicitar un plan o consultar cómo pagar en IVIS Fit.",
  );

  return phone
    ? `https://wa.me/${phone.replace(/\D/g, "")}?text=${message}`
    : `https://wa.me/?text=${message}`;
}
