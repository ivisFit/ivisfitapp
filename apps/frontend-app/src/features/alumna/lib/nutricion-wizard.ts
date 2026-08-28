import type { Sexo, UsuarioApiDoc } from "@/types/usuario";
import type {
  CreateEvaluacionNutricionalPayload,
  HorarioDisponible,
  NivelActividad,
  ObjetivoNutricional,
  Ocupacion,
  PreferenciaAlimentaria,
  PresupuestoAproximado,
  RestriccionAlimentaria,
} from "@/features/alumna/types/evaluacion-nutricional";

export type NutricionWizardStepId =
  | "datos"
  | "objetivo"
  | "preferencias"
  | "restricciones"
  | "gustos"
  | "logistica"
  | "resumen";

export type WizardStepConfig = {
  id: NutricionWizardStepId;
  label: string;
  shortLabel: string;
};

export const WIZARD_STEPS: WizardStepConfig[] = [
  { id: "datos", label: "Datos personales", shortLabel: "Datos" },
  { id: "objetivo", label: "Objetivo", shortLabel: "Objetivo" },
  { id: "preferencias", label: "Preferencias", shortLabel: "Preferencias" },
  { id: "restricciones", label: "Restricciones", shortLabel: "Restricciones" },
  { id: "gustos", label: "Gustos", shortLabel: "Gustos" },
  { id: "logistica", label: "Logística", shortLabel: "Logística" },
  { id: "resumen", label: "Resumen", shortLabel: "Resumen" },
];

export const OBJETIVO_OPTIONS: {
  value: ObjetivoNutricional;
  label: string;
  description: string;
}[] = [
  {
    value: "bajar_grasa",
    label: "Bajar grasa",
    description: "Reducir porcentaje de grasa corporal",
  },
  {
    value: "ganar_masa",
    label: "Ganar masa muscular",
    description: "Aumentar músculo con alimentación estratégica",
  },
  {
    value: "recomposicion",
    label: "Recomposición corporal",
    description: "Bajar grasa y ganar músculo al mismo tiempo",
  },
  {
    value: "mantener",
    label: "Mantener peso",
    description: "Conservar tu composición actual",
  },
  {
    value: "rendimiento",
    label: "Mejorar rendimiento",
    description: "Optimizar energía para entrenar mejor",
  },
  {
    value: "salud",
    label: "Salud general",
    description: "Hábitos sostenibles y bienestar integral",
  },
];

export const PREFERENCIA_OPTIONS: { value: PreferenciaAlimentaria; label: string }[] =
  [
    { value: "omnivoro", label: "Omnívoro" },
    { value: "vegetariano", label: "Vegetariano" },
    { value: "vegano", label: "Vegano" },
    { value: "keto", label: "Keto" },
    { value: "low_carb", label: "Low Carb" },
    { value: "mediterranea", label: "Mediterránea" },
  ];

export const RESTRICCION_OPTIONS: {
  value: RestriccionAlimentaria;
  label: string;
}[] = [
  { value: "celiaquia", label: "Celiaquía" },
  { value: "lactosa", label: "Intolerancia a la lactosa" },
  { value: "diabetes", label: "Diabetes" },
  { value: "hipertension", label: "Hipertensión" },
  { value: "colesterol", label: "Colesterol" },
  { value: "embarazo", label: "Embarazo" },
];

export const NIVEL_ACTIVIDAD_OPTIONS: { value: NivelActividad; label: string }[] =
  [
    { value: "sedentario", label: "Sedentario" },
    { value: "ligero", label: "Ligero (1-2 días/semana)" },
    { value: "moderado", label: "Moderado (3-4 días/semana)" },
    { value: "intenso", label: "Intenso (5-6 días/semana)" },
    { value: "muy_intenso", label: "Muy intenso (atleta)" },
  ];

export const OCUPACION_OPTIONS: { value: Ocupacion; label: string }[] = [
  { value: "sedentario", label: "Sedentario (oficina, poco movimiento)" },
  { value: "activo", label: "Activo (trabajo de pie, caminatas)" },
  { value: "muy_activo", label: "Muy activo (trabajo físico intenso)" },
];

export const HORARIO_OPTIONS: { value: HorarioDisponible; label: string }[] = [
  { value: "manana", label: "Mañana" },
  { value: "tarde", label: "Tarde" },
  { value: "noche", label: "Noche" },
];

export const PRESUPUESTO_OPTIONS: {
  value: PresupuestoAproximado;
  label: string;
}[] = [
  { value: "bajo", label: "Bajo" },
  { value: "medio", label: "Medio" },
  { value: "alto", label: "Alto" },
];

export const CANTIDAD_COMIDAS_OPTIONS = [3, 4, 5, 6];

export const TIEMPO_COCINA_OPTIONS = [
  { value: 15, label: "Hasta 15 min" },
  { value: 30, label: "Hasta 30 min" },
  { value: 45, label: "Hasta 45 min" },
  { value: 60, label: "Hasta 1 hora" },
  { value: 90, label: "Más de 1 hora" },
];

export type WizardQuestionInputType =
  | "number"
  | "date"
  | "chips-single"
  | "chips-multi"
  | "cards-single"
  | "tags"
  | "resumen";

export type WizardQuestionField = keyof NutricionWizardFormState;

export type WizardQuestionConfig = {
  id: string;
  sectionIndex: number;
  field: WizardQuestionField | null;
  question: string;
  inputType: WizardQuestionInputType;
  optional?: boolean;
  help?: string;
};

export const WIZARD_QUESTIONS: WizardQuestionConfig[] = [
  {
    id: "edad",
    sectionIndex: 0,
    field: "edad",
    question: "¿Cuántos años tenés?",
    inputType: "number",
    help: "Ingresá tu edad en años cumplidos. Se usa para calcular tus necesidades calóricas.",
  },
  {
    id: "sexo",
    sectionIndex: 0,
    field: "sexo",
    question: "¿Cuál es tu sexo?",
    inputType: "chips-single",
    help: "El sexo biológico es uno de los datos que se usan para estimar tu metabolismo basal.",
  },
  {
    id: "estaturaCm",
    sectionIndex: 0,
    field: "estaturaCm",
    question: "¿Cuál es tu estatura en centímetros?",
    inputType: "number",
    help: "Medí sin zapatos, de pie y con la espalda recta contra la pared.",
  },
  {
    id: "pesoActualKg",
    sectionIndex: 0,
    field: "pesoActualKg",
    question: "¿Cuál es tu peso actual en kilogramos?",
    inputType: "number",
    help: "Pesate por la mañana, en ayunas y con ropa liviana para mayor precisión.",
  },
  {
    id: "pesoObjetivoKg",
    sectionIndex: 0,
    field: "pesoObjetivoKg",
    question: "¿Cuál es tu peso objetivo en kilogramos?",
    inputType: "number",
    help: "El peso al que querés llegar. Si tenés dudas, tu profe puede ayudarte a definirlo.",
  },
  {
    id: "fechaObjetivo",
    sectionIndex: 0,
    field: "fechaObjetivo",
    question: "¿Para cuándo querés alcanzar tu objetivo?",
    inputType: "date",
    help: "Elegí una fecha realista (mínimo 4–8 semanas) para que el plan sea sostenible.",
  },
  {
    id: "nivelActividad",
    sectionIndex: 0,
    field: "nivelActividad",
    question: "¿Cuál es tu nivel de actividad física?",
    inputType: "chips-single",
    help: "Sumá tus entrenamientos y tu movimiento diario (trabajo, caminatas, tareas).",
  },
  {
    id: "ocupacion",
    sectionIndex: 0,
    field: "ocupacion",
    question: "¿Cómo describirías tu ocupación diaria?",
    inputType: "chips-single",
    help: "Describe cuánto movimiento tenés por tu trabajo o rutina habitual.",
  },
  {
    id: "objetivo",
    sectionIndex: 1,
    field: "objetivo",
    question: "¿Cuál es tu objetivo principal?",
    inputType: "cards-single",
    help: "Tu objetivo guía todos los cálculos del plan: calorías, macros y distribución.",
  },
  {
    id: "preferenciasAlimentarias",
    sectionIndex: 2,
    field: "preferenciasAlimentarias",
    question: "¿Qué estilo alimentario te identifica?",
    inputType: "chips-multi",
    help: "Elegí el estilo que mejor se adapte a tu día a día. Podés seleccionar más de uno.",
  },
  {
    id: "restricciones",
    sectionIndex: 3,
    field: "restricciones",
    question: "¿Tenés alguna restricción de salud?",
    inputType: "chips-multi",
    optional: true,
    help: "Marcá solo las condiciones diagnosticadas: influyen en qué alimentos se sugieren.",
  },
  {
    id: "alergias",
    sectionIndex: 3,
    field: "alergias",
    question: "¿Tenés alguna alergia alimentaria?",
    inputType: "tags",
    optional: true,
    help: "Escribí cada alergia y presioná Enter. Se excluyen de tus sugerencias.",
  },
  {
    id: "alimentosFavoritos",
    sectionIndex: 4,
    field: "alimentosFavoritos",
    question: "¿Qué alimentos te gustan?",
    inputType: "tags",
    optional: true,
    help: "Cuanto más específico seas, más personalizadas serán tus comidas.",
  },
  {
    id: "alimentosEvitados",
    sectionIndex: 4,
    field: "alimentosEvitados",
    question: "¿Qué alimentos preferís no consumir?",
    inputType: "tags",
    optional: true,
    help: "Indicá los alimentos que no comés para excluirlos del plan.",
  },
  {
    id: "horariosDisponibles",
    sectionIndex: 5,
    field: "horariosDisponibles",
    question: "¿En qué horarios podés comer?",
    inputType: "chips-multi",
    help: "Elegí las franjas del día en las que podés comer con tranquilidad.",
  },
  {
    id: "cantidadComidas",
    sectionIndex: 5,
    field: "cantidadComidas",
    question: "¿Cuántas comidas preferís por día?",
    inputType: "chips-single",
    help: "La cantidad de comidas que se ajusta mejor a tu rutina y tu apetito.",
  },
  {
    id: "tiempoCocinaMinutos",
    sectionIndex: 5,
    field: "tiempoCocinaMinutos",
    question: "¿Cuánto tiempo tenés para cocinar?",
    inputType: "chips-single",
    help: "Estimá el tiempo real que podés dedicarle a preparar tus comidas.",
  },
  {
    id: "resumen",
    sectionIndex: 6,
    field: null,
    question: "Revisá tus respuestas antes de generar tu plan",
    inputType: "resumen",
  },
];

export type NutricionWizardFormState = {
  edad: string;
  sexo: Sexo | "";
  estaturaCm: string;
  pesoActualKg: string;
  pesoObjetivoKg: string;
  fechaObjetivo: string;
  nivelActividad: NivelActividad | "";
  ocupacion: Ocupacion | "";
  objetivo: ObjetivoNutricional | "";
  preferenciasAlimentarias: PreferenciaAlimentaria[];
  restricciones: RestriccionAlimentaria[];
  alergias: string[];
  alimentosFavoritos: string[];
  alimentosEvitados: string[];
  horariosDisponibles: HorarioDisponible[];
  cantidadComidas: string;
  presupuestoAproximado: PresupuestoAproximado | "";
  tiempoCocinaMinutos: string;
};

export function createInitialFormState(
  prefill?: Partial<NutricionWizardFormState>,
): NutricionWizardFormState {
  return {
    edad: "",
    sexo: "",
    estaturaCm: "",
    pesoActualKg: "",
    pesoObjetivoKg: "",
    fechaObjetivo: "",
    nivelActividad: "",
    ocupacion: "",
    objetivo: "",
    preferenciasAlimentarias: [],
    restricciones: [],
    alergias: [],
    alimentosFavoritos: [],
    alimentosEvitados: [],
    horariosDisponibles: [],
    cantidadComidas: "",
    presupuestoAproximado: "",
    tiempoCocinaMinutos: "",
    ...prefill,
  };
}

export function calculateAgeFromBirthDate(fechaNacimiento?: string): string {
  if (!fechaNacimiento) return "";
  const birth = new Date(fechaNacimiento);
  if (Number.isNaN(birth.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age > 0 ? String(age) : "";
}

export function parseAlergiasFromProfile(alergias?: string): string[] {
  if (!alergias?.trim()) return [];
  return alergias
    .split(/[,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function prefillFormFromProfile(
  profile: UsuarioApiDoc,
): Partial<NutricionWizardFormState> {
  const sexo: Sexo | "" =
    profile.sexo === "hombre" || profile.sexo === "mujer"
      ? profile.sexo
      : "";

  return {
    edad: calculateAgeFromBirthDate(profile.fechaNacimiento),
    sexo,
    estaturaCm:
      typeof profile.alturaCm === "number" && profile.alturaCm > 0
        ? String(profile.alturaCm)
        : "",
    alergias: parseAlergiasFromProfile(profile.alergias),
  };
}

export function shouldSkipQuestion(
  questionId: string,
  profile: UsuarioApiDoc,
): boolean {
  switch (questionId) {
    case "edad": {
      const edad = calculateAgeFromBirthDate(profile.fechaNacimiento);
      return edad !== "" && Number(edad) > 0;
    }
    case "sexo":
      return profile.sexo === "hombre" || profile.sexo === "mujer";
    case "estaturaCm":
      return typeof profile.alturaCm === "number" && profile.alturaCm > 0;
    case "alergias":
      return Boolean(profile.alergias?.trim());
    default:
      return false;
  }
}

export function getActiveWizardQuestions(
  profile: UsuarioApiDoc,
): WizardQuestionConfig[] {
  return WIZARD_QUESTIONS.filter((q) => !shouldSkipQuestion(q.id, profile));
}

export type StepValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

function parsePositiveNumber(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export function getSectionIndexForQuestion(
  questionIndex: number,
  activeQuestions: WizardQuestionConfig[] = WIZARD_QUESTIONS,
): number {
  return activeQuestions[questionIndex]?.sectionIndex ?? 0;
}

export function getFirstQuestionIndexForSection(
  sectionIndex: number,
  activeQuestions: WizardQuestionConfig[] = WIZARD_QUESTIONS,
): number {
  const index = activeQuestions.findIndex(
    (question) => question.sectionIndex === sectionIndex,
  );
  return index >= 0 ? index : 0;
}

export function getQuestionProgress(
  questionIndex: number,
  activeQuestions: WizardQuestionConfig[] = WIZARD_QUESTIONS,
): {
  current: number;
  total: number;
  percent: number;
} {
  const total = activeQuestions.length;
  const current = Math.min(questionIndex + 1, total);
  return {
    current,
    total,
    percent: (current / total) * 100,
  };
}

export function validateQuestion(
  questionId: string,
  form: NutricionWizardFormState,
): string | null {
  switch (questionId) {
    case "edad": {
      const edad = Number(form.edad);
      if (!Number.isInteger(edad) || edad < 14 || edad > 100) {
        return "Ingresá una edad válida (14–100)";
      }
      return null;
    }
    case "sexo":
      if (form.sexo !== "hombre" && form.sexo !== "mujer") {
        return "Seleccioná tu sexo";
      }
      return null;
    case "estaturaCm":
      if (!parsePositiveNumber(form.estaturaCm)) {
        return "Ingresá una estatura válida en cm";
      }
      return null;
    case "pesoActualKg":
      if (!parsePositiveNumber(form.pesoActualKg)) {
        return "Ingresá tu peso actual";
      }
      return null;
    case "pesoObjetivoKg":
      if (!parsePositiveNumber(form.pesoObjetivoKg)) {
        return "Ingresá tu peso objetivo";
      }
      return null;
    case "fechaObjetivo":
      if (!form.fechaObjetivo) {
        return "Seleccioná una fecha objetivo";
      }
      {
        const fecha = new Date(form.fechaObjetivo);
        if (Number.isNaN(fecha.getTime()) || fecha <= new Date()) {
          return "La fecha objetivo debe ser futura";
        }
      }
      return null;
    case "nivelActividad":
      if (!form.nivelActividad) {
        return "Seleccioná tu nivel de actividad";
      }
      return null;
    case "ocupacion":
      if (!form.ocupacion) {
        return "Seleccioná tu ocupación";
      }
      return null;
    case "objetivo":
      if (!form.objetivo) {
        return "Seleccioná un objetivo";
      }
      return null;
    case "preferenciasAlimentarias":
      if (form.preferenciasAlimentarias.length === 0) {
        return "Seleccioná al menos una preferencia alimentaria";
      }
      return null;
    case "horariosDisponibles":
      if (form.horariosDisponibles.length === 0) {
        return "Seleccioná al menos un horario";
      }
      return null;
    case "cantidadComidas": {
      const cantidad = Number(form.cantidadComidas);
      if (!Number.isInteger(cantidad) || cantidad < 3 || cantidad > 6) {
        return "Seleccioná la cantidad de comidas (3–6)";
      }
      return null;
    }
    case "tiempoCocinaMinutos": {
      const tiempo = Number(form.tiempoCocinaMinutos);
      if (!Number.isInteger(tiempo) || tiempo < 0) {
        return "Seleccioná el tiempo disponible para cocinar";
      }
      return null;
    }
    case "restricciones":
    case "alergias":
    case "alimentosFavoritos":
    case "alimentosEvitados":
    case "resumen":
      return null;
    default:
      return null;
  }
}

export function isQuestionValid(
  questionId: string,
  form: NutricionWizardFormState,
): boolean {
  return validateQuestion(questionId, form) === null;
}

export function validateStep(
  stepIndex: number,
  form: NutricionWizardFormState,
): StepValidationResult {
  const errors: Record<string, string> = {};

  switch (stepIndex) {
    case 0: {
      const edad = Number(form.edad);
      if (!Number.isInteger(edad) || edad < 14 || edad > 100) {
        errors.edad = "Ingresá una edad válida (14–100)";
      }
      if (form.sexo !== "hombre" && form.sexo !== "mujer") {
        errors.sexo = "Seleccioná tu sexo";
      }
      if (!parsePositiveNumber(form.estaturaCm)) {
        errors.estaturaCm = "Ingresá una estatura válida en cm";
      }
      if (!parsePositiveNumber(form.pesoActualKg)) {
        errors.pesoActualKg = "Ingresá tu peso actual";
      }
      if (!parsePositiveNumber(form.pesoObjetivoKg)) {
        errors.pesoObjetivoKg = "Ingresá tu peso objetivo";
      }
      if (!form.fechaObjetivo) {
        errors.fechaObjetivo = "Seleccioná una fecha objetivo";
      } else {
        const fecha = new Date(form.fechaObjetivo);
        if (Number.isNaN(fecha.getTime()) || fecha <= new Date()) {
          errors.fechaObjetivo = "La fecha objetivo debe ser futura";
        }
      }
      if (!form.nivelActividad) {
        errors.nivelActividad = "Seleccioná tu nivel de actividad";
      }
      if (!form.ocupacion) {
        errors.ocupacion = "Seleccioná tu ocupación";
      }
      break;
    }
    case 1: {
      if (!form.objetivo) {
        errors.objetivo = "Seleccioná un objetivo";
      }
      break;
    }
    case 2: {
      if (form.preferenciasAlimentarias.length === 0) {
        errors.preferenciasAlimentarias =
          "Seleccioná al menos una preferencia alimentaria";
      }
      break;
    }
    case 3:
      break;
    case 4:
      break;
    case 5: {
      if (form.horariosDisponibles.length === 0) {
        errors.horariosDisponibles = "Seleccioná al menos un horario";
      }
      const cantidad = Number(form.cantidadComidas);
      if (!Number.isInteger(cantidad) || cantidad < 3 || cantidad > 6) {
        errors.cantidadComidas = "Seleccioná la cantidad de comidas (3–6)";
      }
      const tiempo = Number(form.tiempoCocinaMinutos);
      if (!Number.isInteger(tiempo) || tiempo < 0) {
        errors.tiempoCocinaMinutos = "Seleccioná el tiempo disponible para cocinar";
      }
      break;
    }
    case 6:
      break;
    default:
      break;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function buildPayload(
  form: NutricionWizardFormState,
): CreateEvaluacionNutricionalPayload {
  return {
    edad: Number(form.edad),
    sexo: form.sexo as Sexo,
    estaturaCm: Number(form.estaturaCm),
    pesoActualKg: Number(form.pesoActualKg),
    pesoObjetivoKg: Number(form.pesoObjetivoKg),
    fechaObjetivo: form.fechaObjetivo,
    nivelActividad: form.nivelActividad as NivelActividad,
    ocupacion: form.ocupacion as Ocupacion,
    objetivo: form.objetivo as ObjetivoNutricional,
    preferenciasAlimentarias: form.preferenciasAlimentarias,
    restricciones: form.restricciones,
    alergias: form.alergias,
    alimentosFavoritos: form.alimentosFavoritos,
    alimentosEvitados: form.alimentosEvitados,
    horariosDisponibles: form.horariosDisponibles,
    cantidadComidas: Number(form.cantidadComidas),
    tiempoCocinaMinutos: Number(form.tiempoCocinaMinutos),
    completada: true,
  };
}

export function getLabelForValue<T extends string>(
  options: { value: T; label: string }[],
  value: T | "",
): string {
  if (!value) return "—";
  return options.find((option) => option.value === value)?.label ?? value;
}

export function formatList(values: string[]): string {
  if (values.length === 0) return "Ninguna";
  return values.join(", ");
}
