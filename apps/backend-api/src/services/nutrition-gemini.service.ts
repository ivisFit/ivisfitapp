import {
  calculateMacrosObjetivo,
  type ComidaPlan,
  type CreateEvaluacionNutricionalInput,
  type CreatePlanNutricionalInput,
  type DiaPlanNutricional,
  type EstructuraComida,
  type GenerarComidaPlanInput,
  type MacrosObjetivo,
} from "@ivisfit/database";
import {
  buildComidaFallbackDesdeCatalogo,
  formatCatalogoParaPrompt,
  resolverComidaAlCatalogo,
  resolverDiasAlCatalogo,
} from "../lib/plan-catalog-ingredientes.js";
import type { CatalogAlimentoMacros } from "../lib/alimento-catalog-match.js";
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

function catalogInstructionBlock(catalog: CatalogAlimentoMacros[]): string {
  const items = formatCatalogoParaPrompt(catalog);
  return `
CATÁLOGO OBLIGATORIO (solo estos alimentos; usá nombre EXACTO o alimentoId):
${JSON.stringify(items)}
PROHIBIDO: nombres genéricos ("Proteína magra", "Carbohidrato", "Vegetales") o alimentos fuera del catálogo.
Formato ingrediente: { "alimentoId": "opcional", "nombre": "del catálogo", "cantidad": number, "unidad": "g|ml|unidad" }`;
}

function normalizeIngredienteRaw(
  raw: unknown,
): ComidaPlan["ingredientes"][number] | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const nombreRaw =
    record.nombre ??
    record.name ??
    record.alimento ??
    record.ingrediente ??
    record.food;
  const nombre = typeof nombreRaw === "string" ? nombreRaw.trim() : "";
  const alimentoIdRaw = record.alimentoId ?? record.alimento_id;
  const alimentoId =
    typeof alimentoIdRaw === "string" && alimentoIdRaw.trim()
      ? alimentoIdRaw.trim()
      : undefined;
  if (!nombre && !alimentoId) return null;

  let cantidadValue: unknown =
    record.cantidad ?? record.amount ?? record.grams ?? record.gramos;
  if (typeof cantidadValue === "string") {
    cantidadValue = Number(cantidadValue.replace(",", "."));
  }
  const cantidad =
    typeof cantidadValue === "number" &&
    Number.isFinite(cantidadValue) &&
    cantidadValue > 0
      ? cantidadValue
      : 100;

  const unidadRaw = record.unidad ?? record.unit;
  const unidad =
    unidadRaw === "ml" || unidadRaw === "unidad" ? unidadRaw : ("g" as const);

  return {
    ...(alimentoId ? { alimentoId } : {}),
    nombre,
    cantidad,
    unidad,
  };
}

function normalizeIngredientesList(raw: unknown): ComidaPlan["ingredientes"] {
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map(normalizeIngredienteRaw)
    .filter((ing): ing is ComidaPlan["ingredientes"][number] => ing !== null);
}

function normalizeComidaFromIa(comida: ComidaPlan, slot?: ComidaPlan): ComidaPlan {
  return {
    ...comida,
    nombre: (slot?.nombre ?? comida.nombre)?.trim() || "Comida",
    horario: slot?.horario ?? comida.horario,
    macrosObjetivo: slot?.macrosObjetivo ?? comida.macrosObjetivo,
    ingredientes: normalizeIngredientesList(comida.ingredientes),
  };
}

export function sanitizePlanDias(dias: DiaPlanNutricional[]): DiaPlanNutricional[] {
  return dias.map((dia) => ({
    ...dia,
    comidas: dia.comidas.map((comida) => normalizeComidaFromIa(comida)),
  }));
}

function buildFallbackPlan(
  evaluacion: EvaluacionContext,
  macros: MacrosObjetivo,
  catalog: CatalogAlimentoMacros[],
): Pick<CreatePlanNutricionalInput, "titulo" | "observacionesProfe" | "macrosObjetivo" | "dias" | "generadoPorIa"> {
  const mealNames = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Colación", "Snack"];
  const comidas = Array.from({ length: evaluacion.cantidadComidas }, (_, index) =>
    buildComidaFallbackDesdeCatalogo(
      {
        nombre: mealNames[index] ?? `Comida ${index + 1}`,
        horario: undefined,
        ingredientes: [],
      },
      catalog,
      index,
    ),
  );

  const dias = resolverDiasAlCatalogo([{ nombre: "Día tipo", comidas }], catalog);

  return {
    titulo: "Plan nutricional personalizado",
    observacionesProfe:
      "Borrador armado desde el catálogo. Revisá porciones y horarios según la evaluación.",
    macrosObjetivo: macros,
    dias,
    generadoPorIa: false,
  };
}

function enforceComidasCount(
  dias: NonNullable<Pick<CreatePlanNutricionalInput, "dias">["dias"]>,
  cantidadComidas: number,
  catalog: CatalogAlimentoMacros[],
): typeof dias {
  const mealNames = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Colación", "Snack"];

  return dias.map((dia, diaIndex) => {
    const comidas = dia.comidas.slice(0, cantidadComidas);

    while (comidas.length < cantidadComidas) {
      const index = comidas.length;
      comidas.push(
        buildComidaFallbackDesdeCatalogo(
          {
            nombre: mealNames[index] ?? `Comida ${index + 1}`,
            horario: undefined,
            ingredientes: [],
          },
          catalog,
          diaIndex * 10 + index,
        ),
      );
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

  async generatePlanDraft(
    evaluacion: EvaluacionContext,
    catalog: CatalogAlimentoMacros[],
  ) {
    const macros = calculateMacrosObjetivo(evaluacion);
    const fallback = buildFallbackPlan(evaluacion, macros, catalog);

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
${catalogInstructionBlock(catalog)}
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

    const dias = enforceComidasCount(
      parsed.dias,
      evaluacion.cantidadComidas,
      catalog,
    );

    return {
      ...parsed,
      generadoPorIa: true,
      macrosObjetivo: parsed.macrosObjetivo ?? macros,
      dias: resolverDiasAlCatalogo(sanitizePlanDias(dias), catalog),
    };
  },

  async generateDayPlan(
    evaluacion: EvaluacionContext,
    input: {
      diaNombre: string;
      macrosObjetivo: MacrosObjetivo;
      estructuraComidas: EstructuraComida[];
      comidasConObjetivo: ComidaPlan[];
      diasPreviosResumen: string[];
      catalog: CatalogAlimentoMacros[];
      diaSeed: number;
    },
  ): Promise<DiaPlanNutricional> {
    const fallback: DiaPlanNutricional = {
      nombre: input.diaNombre,
      comidas: input.comidasConObjetivo.map((slot, index) =>
        buildComidaFallbackDesdeCatalogo(slot, input.catalog, input.diaSeed * 10 + index),
      ),
    };

    const instruction = `Generá UN día del plan nutricional (${input.diaNombre}) en JSON:
{
  "nombre": "${input.diaNombre}",
  "comidas": [{
    "nombre": "string",
    "horario": "08:00",
    "ingredientes": [{ "nombre": "string", "cantidad": number, "unidad": "g|ml|unidad" }],
    "notas": "opcional",
    "preparacion": "breve"
  }]
}

Evaluación: ${JSON.stringify(evaluacion)}
Macros del día: ${JSON.stringify(input.macrosObjetivo)}
Estructura de comidas (respetá nombres y horarios): ${JSON.stringify(input.estructuraComidas)}
Metas por comida (aproximá ingredientes en gramos para llegar): ${JSON.stringify(
      input.comidasConObjetivo.map((c) => ({
        nombre: c.nombre,
        horario: c.horario,
        macrosObjetivo: c.macrosObjetivo,
      })),
    )}
${input.diasPreviosResumen.length ? `Días ya armados (variá proteínas y carbos, no repitas menús): ${input.diasPreviosResumen.join(" | ")}` : ""}
Tiempo máximo cocina: ${evaluacion.tiempoCocinaMinutos} min.
Cantidades en gramos exactos.
${catalogInstructionBlock(input.catalog)}
Devolvé SOLO JSON válido.`;

    const text = await generateNutritionText(
      instruction,
      JSON.stringify(fallback),
      4096,
      { jsonMode: true },
    );
    const parsed = extractJson<DiaPlanNutricional>(text);
    if (!parsed?.comidas?.length) return fallback;

    const comidas = parsed.comidas.map((comida, index) =>
      normalizeComidaFromIa(comida, input.comidasConObjetivo[index]),
    );

    return resolverDiasAlCatalogo(
      [{ nombre: input.diaNombre, comidas }],
      input.catalog,
    )[0]!;
  },

  async generateComidaPlan(
    evaluacion: EvaluacionContext,
    input: GenerarComidaPlanInput & {
      macrosDia?: MacrosObjetivo;
      comidaObjetivo?: MacrosObjetivo;
      catalog: CatalogAlimentoMacros[];
      comidaSeed?: number;
    },
  ): Promise<ComidaPlan> {
    const base: ComidaPlan = input.comidaActual ?? {
      nombre: "Comida",
      ingredientes: [],
    };
    const fallbackComida = resolverComidaAlCatalogo(
      buildComidaFallbackDesdeCatalogo(base, input.catalog, input.comidaSeed ?? 0),
      input.catalog,
      input.comidaSeed ?? 0,
    );

    const modoLabel =
      input.modo === "sugerir"
        ? "Sugerí una comida completa"
        : input.modo === "alternativa"
          ? "Proponé una alternativa distinta"
          : `Ajustá la comida para acercarte a ${input.proteinaObjetivoG ?? "la"} g de proteína`;

    const instruction = `${modoLabel} en JSON con esta estructura:
{
  "nombre": "string",
  "horario": "opcional",
  "ingredientes": [{ "nombre": "string", "cantidad": number, "unidad": "g|ml|unidad" }],
  "notas": "opcional",
  "preparacion": "breve"
}
Evaluación: ${JSON.stringify(evaluacion)}
Comida actual: ${JSON.stringify(base)}
${input.instruccion ? `Instrucción extra: ${input.instruccion}` : ""}
${input.comidaObjetivo ? `Meta de la comida: ${JSON.stringify(input.comidaObjetivo)}` : ""}
Cantidades en gramos exactos.
${catalogInstructionBlock(input.catalog)}
Devolvé SOLO JSON.`;

    const text = await generateNutritionText(
      instruction,
      JSON.stringify(fallbackComida),
      2048,
      { jsonMode: true },
    );
    const parsed = extractJson<ComidaPlan>(text);
    if (!parsed) return fallbackComida;
    const merged = normalizeComidaFromIa(
      {
        ...base,
        ...parsed,
        macrosObjetivo: input.comidaObjetivo ?? base.macrosObjetivo,
      },
      base,
    );
    return resolverComidaAlCatalogo(
      merged,
      input.catalog,
      input.comidaSeed ?? 0,
    );
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
