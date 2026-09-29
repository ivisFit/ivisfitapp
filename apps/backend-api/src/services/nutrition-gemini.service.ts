import {
  calculateMacrosObjetivo,
  type ComidaPlan,
  type CreateEvaluacionNutricionalInput,
  type CreatePlanNutricionalInput,
  type MacrosObjetivo,
} from "@ivisfit/database";
import { generateGeminiText, isGeminiConfigured } from "./gemini-client.js";

const NUTRITION_SYSTEM_PROMPT = `Sos una nutricionista deportiva de IVIIS FIT, especializada en mujeres.
Respondés en español rioplatense (vos, querés). Tono cálido y profesional.
Respetá siempre restricciones, alergias y preferencias alimentarias indicadas.
No inventés datos médicos ni diagnósticos.
Para planes alimenticios, devolvé JSON válido cuando se solicite.`;

type EvaluacionContext = Pick<
  CreateEvaluacionNutricionalInput,
  | "edad"
  | "sexo"
  | "estaturaCm"
  | "pesoActualKg"
  | "pesoObjetivoKg"
  | "fechaObjetivo"
  | "nivelActividad"
  | "ocupacion"
  | "objetivo"
  | "preferenciasAlimentarias"
  | "restricciones"
  | "alergias"
  | "alimentosFavoritos"
  | "alimentosEvitados"
  | "horariosDisponibles"
  | "cantidadComidas"
  | "tiempoCocinaMinutos"
>;

async function generateNutritionText(
  instruction: string,
  fallback: string,
  maxTokens = 2048,
  options?: { jsonMode?: boolean },
): Promise<string> {
  return generateGeminiText({
    instruction,
    systemInstruction: NUTRITION_SYSTEM_PROMPT,
    fallback,
    maxOutputTokens: maxTokens,
    temperature: 0.6,
    responseMimeType: options?.jsonMode ? "application/json" : undefined,
    logLabel: "nutrition-gemini",
  });
}

function extractJson<T>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced?.[1]?.trim() ?? text.trim();

  try {
    return JSON.parse(candidate) as T;
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    try {
      return JSON.parse(candidate.slice(start, end + 1)) as T;
    } catch {
      return null;
    }
  }
}

function buildFallbackPlan(
  evaluacion: EvaluacionContext,
  macros: MacrosObjetivo,
): Pick<CreatePlanNutricionalInput, "titulo" | "observacionesProfe" | "macrosObjetivo" | "dias" | "generadoPorIa"> {
  const mealNames = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Colación", "Snack"];
  const comidas = Array.from({ length: evaluacion.cantidadComidas }, (_, index) => ({
    nombre: mealNames[index] ?? `Comida ${index + 1}`,
    horario: undefined,
    ingredientes: [
      { nombre: "Proteína magra", cantidad: 120, unidad: "g" as const },
      { nombre: "Carbohidrato complejo", cantidad: 80, unidad: "g" as const },
      { nombre: "Vegetales", cantidad: 1, unidad: "unidad" as const },
    ],
    notas: "Ajustá porciones según hambre y energía del día.",
    preparacion: "Preparación simple en menos de 30 minutos.",
  }));

  return {
    titulo: "Plan nutricional personalizado",
    observacionesProfe:
      "Borrador base generado sin IA. Revisá porciones, horarios y alimentos según la evaluación de la alumna.",
    macrosObjetivo: macros,
    dias: [{ nombre: "Día tipo", comidas }],
    generadoPorIa: false,
  };
}

function enforceComidasCount(
  dias: NonNullable<Pick<CreatePlanNutricionalInput, "dias">["dias"]>,
  cantidadComidas: number,
): typeof dias {
  const mealNames = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Colación", "Snack"];

  return dias.map((dia) => {
    const comidas = dia.comidas.slice(0, cantidadComidas);

    while (comidas.length < cantidadComidas) {
      const index = comidas.length;
      comidas.push({
        nombre: mealNames[index] ?? `Comida ${index + 1}`,
        horario: undefined,
        ingredientes: [
          { nombre: "Proteína magra", cantidad: 120, unidad: "g" as const },
          { nombre: "Carbohidrato complejo", cantidad: 80, unidad: "g" as const },
          { nombre: "Vegetales", cantidad: 1, unidad: "unidad" as const },
        ],
        notas: "Ajustá porciones según hambre y energía del día.",
        preparacion: "Preparación simple en menos de 30 minutos.",
      });
    }

    return { ...dia, comidas };
  });
}

type PlanDraftContent = Pick<
  CreatePlanNutricionalInput,
  "titulo" | "observacionesProfe" | "macrosObjetivo" | "dias" | "generadoPorIa"
>;

function cloneComidas(comidas: ComidaPlan[]): ComidaPlan[] {
  return comidas.map((comida) => ({
    ...comida,
    ingredientes: comida.ingredientes.map((ingrediente) => ({ ...ingrediente })),
  }));
}

/** Replica las comidas del primer día generado por IA en cada nombre del esqueleto. */
export function expandPlanDraftToDays(
  draft: PlanDraftContent,
  skeleton: { nombre: string }[],
): PlanDraftContent {
  const templateComidas = draft.dias[0]?.comidas ?? [];
  const nombres =
    skeleton.length > 0
      ? skeleton
      : [{ nombre: draft.dias[0]?.nombre ?? "Día tipo" }];

  return {
    ...draft,
    dias: nombres.map(({ nombre }) => ({
      nombre,
      comidas: cloneComidas(templateComidas),
    })),
  };
}

export type ComposicionCorporalContext = {
  pesoKg?: number;
  imc?: number;
  porcentajeGrasaCorporal?: number;
  fechaMedicion?: string;
};

export const nutritionGeminiService = {
  isConfigured() {
    return isGeminiConfigured();
  },

  async buildEvaluacionBriefing(
    evaluacion: EvaluacionContext,
    alumnaNombre: string,
    composicion?: ComposicionCorporalContext,
  ) {
    const fallback = `Resumen de ${alumnaNombre}: objetivo ${evaluacion.objetivo}, ${evaluacion.cantidadComidas} comidas/día. Revisá alergias (${evaluacion.alergias.join(", ") || "ninguna"}) y restricciones (${evaluacion.restricciones.join(", ") || "ninguna"}).`;

    const composicionTexto = composicion
      ? `\nÚltima composición corporal registrada: ${JSON.stringify(composicion)}`
      : "";

    return generateNutritionText(
      `Generá un briefing breve (3-5 bullets) para la profe sobre esta evaluación de ${alumnaNombre}:\n${JSON.stringify(evaluacion)}${composicionTexto}\nSi hay composición corporal, considerala para ajustar el enfoque calórico (por ejemplo, un déficit más conservador si el % de grasa ya es bajo).`,
      fallback,
      1024,
    );
  },

  async generatePlanDraft(evaluacion: EvaluacionContext) {
    const macros = calculateMacrosObjetivo(evaluacion);
    const fallback = buildFallbackPlan(evaluacion, macros);

    const instruction = `Generá un plan nutricional diario tipo (un solo día replicable) en JSON con esta estructura exacta:
{
  "titulo": "string",
  "observacionesProfe": "string con notas para la profe",
  "macrosObjetivo": { "kcal": number, "proteinaG": number, "carbohidratosG": number, "grasasG": number },
  "dias": [{
    "nombre": "Día tipo",
    "comidas": [{
      "nombre": "Desayuno|Almuerzo|etc",
      "horario": "08:00",
      "ingredientes": [{ "nombre": "string", "cantidad": number, "unidad": "g|ml|unidad" }],
      "notas": "string opcional",
      "preparacion": "string breve"
    }]
  }],
  "generadoPorIa": true
}

Datos de la evaluación:
${JSON.stringify(evaluacion)}

Macros objetivo sugeridos (podés ajustar levemente): ${JSON.stringify(macros)}
Cantidad de comidas requeridas: ${evaluacion.cantidadComidas}
OBLIGATORIO: el plan debe tener EXACTAMENTE ${evaluacion.cantidadComidas} comidas, ni una más ni una menos.
Tiempo máximo de cocina: ${evaluacion.tiempoCocinaMinutos} minutos
Respetá preferencias, restricciones, alergias y alimentos evitados.
Devolvé SOLO JSON válido.`;

    const text = await generateNutritionText(
      instruction,
      JSON.stringify(fallback),
      8192,
      { jsonMode: true },
    );
    const parsed = extractJson<typeof fallback>(text);

    if (!parsed?.dias?.length || !parsed.macrosObjetivo) {
      return fallback;
    }

    return {
      ...parsed,
      generadoPorIa: true,
      macrosObjetivo: parsed.macrosObjetivo ?? macros,
      dias: enforceComidasCount(parsed.dias, evaluacion.cantidadComidas),
    };
  },

  async chat(
    rol: "alumna" | "profe",
    mensaje: string,
    context: {
      evaluacion?: EvaluacionContext;
      plan?: Pick<CreatePlanNutricionalInput, "titulo" | "macrosObjetivo" | "dias" | "observacionesProfe">;
      alumnaNombre?: string;
    },
  ) {
    const fallback =
      rol === "alumna"
        ? "Por ahora podés revisar tu plan en la app. Si tenés dudas específicas, consultá a tu profe."
        : "Revisá la evaluación y el borrador del plan. Podés regenerar con IA si necesitás otra propuesta.";

    const instruction = `Rol: ${rol === "alumna" ? "asistente nutricional para la alumna" : "copiloto para la profe"}.
${context.alumnaNombre ? `Alumna: ${context.alumnaNombre}` : ""}
${context.evaluacion ? `Evaluación: ${JSON.stringify(context.evaluacion)}` : ""}
${context.plan ? `Plan actual: ${JSON.stringify(context.plan)}` : ""}

Mensaje del usuario: ${mensaje}

Respondé en 2-4 oraciones, práctico y empático. Si es sustitución de alimento, proponé alternativas concretas respetando restricciones.`;

    return generateNutritionText(instruction, fallback, 1024);
  },

  async sustitucionAlimento(input: {
    alimento: string;
    gramos: number;
    evaluacion?: EvaluacionContext;
    plan?: Pick<
      CreatePlanNutricionalInput,
      "titulo" | "macrosObjetivo" | "dias" | "observacionesProfe"
    >;
    alumnaNombre?: string;
    sugerenciasCatalogo?: {
      nombre: string;
      gramos: number;
      categoria: string;
    }[];
    preserveAlternatives?: boolean;
  }) {
    const bullets =
      input.sugerenciasCatalogo && input.sugerenciasCatalogo.length > 0
        ? `Podés probar:\n${input.sugerenciasCatalogo
            .slice(0, 4)
            .map(
              (item) =>
                `• ${item.nombre}: ~${item.gramos} g (equivalente a ${input.gramos} g de ${input.alimento})`,
            )
            .join("\n")}\nRespetá tu plan y las porciones del día.`
        : `Equivalentes para ${input.gramos} g de ${input.alimento} según tu catálogo.`;

    const listaObligatoria =
      input.sugerenciasCatalogo?.length && input.preserveAlternatives
        ? `\nINCLUÍ TEXTUALMENTE estas alternativas (mismos gramos):\n${input.sugerenciasCatalogo
            .map((item) => `- ${item.nombre}: ${item.gramos} g`)
            .join("\n")}`
        : "";

    const instruction = `Sos asistente nutricional para la alumna${input.alumnaNombre ? ` ${input.alumnaNombre}` : ""}.
Quieren sustituir ${input.gramos} g de "${input.alimento}".
${input.evaluacion ? `Evaluación (restricciones y preferencias): ${JSON.stringify(input.evaluacion)}` : ""}
${input.plan ? `Plan publicado: ${JSON.stringify(input.plan)}` : ""}
${
  input.sugerenciasCatalogo?.length
    ? `Alternativas del catálogo (OBLIGATORIO usar estas con estos gramos): ${JSON.stringify(input.sugerenciasCatalogo)}`
    : ""
}
${listaObligatoria}

Respondé en español rioplatense, empático y concreto:
- Presentá 2 a 4 alternativas con los gramos indicados (no inventes otros alimentos distintos).
- Respetá alergias, restricciones y alimentos evitados.
Máximo 6 oraciones cortas más la lista de alternativas.`;

    return generateNutritionText(instruction, bullets, 1024);
  },
};
