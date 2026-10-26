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
import { normalizeAlimentoNombre } from "../lib/alimento-catalog-match.js";
import {
  extraerTerminosSin,
  filtrarDiasPlanPorCondiciones,
} from "../lib/plan-condiciones-semana.js";
import { isExcludedByEvaluacion } from "../lib/sustitucion-alimento.js";
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
  options?: { jsonMode?: boolean; temperature?: number },
): Promise<string> {
  return generateGeminiText({
    instruction,
    systemInstruction: NUTRITION_SYSTEM_PROMPT,
    fallback,
    maxOutputTokens: maxTokens,
    temperature: options?.temperature ?? 0.6,
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
Formato ingrediente: { "alimentoId": "opcional", "nombre": "del catálogo", "cantidad": number, "unidad": "g|ml|unidad" }
CANTIDADES (obligatorio):
- Usá la unidad de "porcion" del catálogo. Si dice "1 unidad", cantidad es el número de piezas (1, 2 o 3) y unidad es "unidad". Nunca pongas gramos en un alimento por unidad: 2 huevos es { "cantidad": 2, "unidad": "unidad" }, no 100 o 150.
- Si la porción es en g o ml, cantidad va en esa unidad y entre media y 3 porciones de referencia.
- No copies las kcal ni los gramos de proteína del objetivo como cantidad.
- La suma del día tiene que acercarse a los macros del día, sin superarlos en más de un 20%.`;
}

export type CondicionesSemana = {
  excluirIds: string[];
  excluirTerminos: string[];
  reglas: string[];
};

export type CondicionesDia = {
  texto: string;
  reglas: string[];
  /** Tokens normalizados de alimentos prohibidos (términos + nombres de catálogo excluidos). */
  tokensExcluidos: string[];
};

function nombresIngredientes(dia: DiaPlanNutricional) {
  return dia.comidas.flatMap((comida) =>
    comida.ingredientes.map((ing) => ({
      comida: comida.nombre,
      nombre: ing.nombre ?? "",
    })),
  );
}

function detectarAlimentosExcluidos(
  dia: DiaPlanNutricional,
  tokens: string[],
): string[] {
  if (tokens.length === 0) return [];
  const encontrados = new Set<string>();
  for (const { comida, nombre } of nombresIngredientes(dia)) {
    if (nombre.trim() && isExcludedByEvaluacion(nombre, tokens)) {
      encontrados.add(`"${nombre}" (${comida}) está prohibido por las condiciones`);
    }
  }
  return Array.from(encontrados);
}

function buildDayInstruction(
  evaluacion: EvaluacionContext,
  input: {
    diaNombre: string;
    macrosObjetivo: MacrosObjetivo;
    estructuraComidas: EstructuraComida[];
    comidasConObjetivo: ComidaPlan[];
    diasPreviosResumen: string[];
    catalog: CatalogAlimentoMacros[];
    condiciones?: CondicionesDia;
    variedad?: "exigir" | "evitar";
  },
  feedback: string[],
): string {
  const condiciones = input.condiciones;
  const bloqueCondiciones = condiciones?.texto.trim()
    ? `CONDICIONES OBLIGATORIAS DE LA PROFESIONAL (prioridad máxima, por encima de la variedad y de cualquier preferencia):
${condiciones.texto.trim()}
${condiciones.reglas.length ? `Reglas verificables: ${JSON.stringify(condiciones.reglas)}` : ""}
Cumplilas al pie de la letra en TODAS las comidas del día. Si una condición choca con otra preferencia, gana la condición. Una sola violación invalida el día.
${feedback.length ? `Tu intento anterior fue rechazado por: ${feedback.join("; ")}. Corregilo.` : ""}

`
    : "";

  const resumen = input.diasPreviosResumen.join(" | ");
  const bloqueVariedad =
    input.variedad === "evitar"
      ? "La profesional pidió repetir este menú en otros días. Armá un día completo y equilibrado."
      : input.variedad === "exigir"
        ? `Este día TIENE que ser distinto de los ya armados${resumen ? `: ${resumen}` : ""}. Cambiá la proteína principal y el carbohidrato de las comidas principales.`
        : resumen
          ? `Días ya armados (variá proteínas y carbos, no repitas menús): ${resumen}`
          : "";

  return `${bloqueCondiciones}Generá UN día del plan nutricional (${input.diaNombre}) en JSON:
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
Metas por comida (aproximá las cantidades, en la unidad de cada alimento, sin pasarte): ${JSON.stringify(
    input.comidasConObjetivo.map((c) => ({
      nombre: c.nombre,
      horario: c.horario,
      macrosObjetivo: c.macrosObjetivo,
    })),
  )}
${bloqueVariedad ? `${bloqueVariedad}\n` : ""}Tiempo máximo cocina: ${evaluacion.tiempoCocinaMinutos} min.
${catalogInstructionBlock(input.catalog)}
Devolvé SOLO JSON válido.`;
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

function mismosAlimentos(a: ComidaPlan, b: ComidaPlan): boolean {
  const key = (comida: ComidaPlan) =>
    comida.ingredientes
      .map((ing) => normalizeAlimentoNombre(ing.nombre ?? ""))
      .filter(Boolean)
      .sort()
      .join("|");
  const keyA = key(a);
  return keyA.length > 0 && keyA === key(b);
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
      condiciones?: CondicionesDia;
      variedad?: "exigir" | "evitar";
    },
  ): Promise<DiaPlanNutricional> {
    const fallback: DiaPlanNutricional = {
      nombre: input.diaNombre,
      comidas: input.comidasConObjetivo.map((slot, index) =>
        buildComidaFallbackDesdeCatalogo(slot, input.catalog, input.diaSeed * 10 + index),
      ),
    };

    const condiciones = input.condiciones;
    const MAX_INTENTOS = condiciones ? 3 : 1;
    let feedback: string[] = [];
    let mejor: DiaPlanNutricional | null = null;

    for (let intento = 1; intento <= MAX_INTENTOS; intento += 1) {
      const instruction = buildDayInstruction(evaluacion, input, feedback);
      const text = await generateNutritionText(
        instruction,
        JSON.stringify(fallback),
        4096,
        { jsonMode: true },
      );
      const parsed = extractJson<DiaPlanNutricional>(text);
      if (!parsed?.comidas?.length) break;

      const comidas = parsed.comidas.map((comida, index) =>
        normalizeComidaFromIa(comida, input.comidasConObjetivo[index]),
      );
      const candidato: DiaPlanNutricional = { nombre: input.diaNombre, comidas };
      mejor = candidato;

      if (!condiciones) break;

      const incumplimientos = [
        ...detectarAlimentosExcluidos(candidato, condiciones.tokensExcluidos),
        ...(await this.validarDiaConReglas(candidato, condiciones, input.diasPreviosResumen)),
      ];
      if (incumplimientos.length === 0) break;
      feedback = incumplimientos;
      if (intento === MAX_INTENTOS) {
        // Último intento con incumplimientos: se descartan los alimentos prohibidos
        // y el catálogo ya filtrado completa el resto.
        mejor = filtrarDiasPlanPorCondiciones(
          [candidato],
          condiciones.tokensExcluidos,
        )[0]!;
      }
    }

    if (!mejor) return fallback;

    return resolverDiasAlCatalogo([mejor], input.catalog)[0]!;
  },

  async interpretarCondiciones(
    instruccion: string,
    catalog: CatalogAlimentoMacros[],
  ): Promise<CondicionesSemana> {
    const texto = instruccion.trim();
    const terminosLiterales = extraerTerminosSin(texto);
    const base: CondicionesSemana = {
      excluirIds: [],
      excluirTerminos: Array.from(new Set(terminosLiterales)),
      reglas: [],
    };
    if (!texto) return base;

    const prompt = `Analizá las condiciones que pidió la profesional para un plan semanal y devolvé SOLO JSON:
{
  "excluirIds": ["_id de cada alimento del catálogo que viole una prohibición"],
  "excluirTerminos": ["palabras de alimentos prohibidos, en singular y minúscula"],
  "reglas": ["condiciones que NO son prohibiciones de alimentos, una por ítem, verificables sobre un día de comidas"]
}
Criterio:
- Si prohíbe un alimento o grupo (ej: "sin pescado", "sin lácteos", "nada de cerdo"), excluí TODOS los alimentos del catálogo que pertenezcan a ese grupo, incluidos derivados y variantes. Sé exhaustiva.
- No excluyas alimentos que no fueron prohibidos.
- Las demás condiciones (tiempo, meal prep, más proteína, variedad, presupuesto) van en "reglas", reformuladas de forma concreta.

Condiciones: ${texto}
Catálogo: ${JSON.stringify(formatCatalogoParaPrompt(catalog))}`;

    const text = await generateNutritionText(prompt, JSON.stringify(base), 4096, {
      jsonMode: true,
    });
    const parsed = extractJson<Partial<CondicionesSemana>>(text);
    if (!parsed) return base;

    const idsValidos = new Set(catalog.map((item) => String(item._id)));
    const excluirIds = (Array.isArray(parsed.excluirIds) ? parsed.excluirIds : [])
      .map(String)
      .filter((id) => idsValidos.has(id));
    const terminos = [
      ...terminosLiterales,
      ...(Array.isArray(parsed.excluirTerminos) ? parsed.excluirTerminos : []),
    ]
      .map((t) => normalizeAlimentoNombre(String(t)))
      .filter((t) => t.length >= 3);
    const reglas = (Array.isArray(parsed.reglas) ? parsed.reglas : [])
      .map((r) => String(r).trim())
      .filter(Boolean)
      .slice(0, 12);

    return {
      excluirIds: Array.from(new Set(excluirIds)),
      excluirTerminos: Array.from(new Set(terminos)),
      reglas,
    };
  },

  async validarDiaConReglas(
    dia: DiaPlanNutricional,
    condiciones: CondicionesDia,
    diasPreviosResumen: string[],
  ): Promise<string[]> {
    if (condiciones.reglas.length === 0) return [];
    const prompt = `Sos auditora estricta de planes nutricionales. Verificá si el día cumple TODAS las reglas. Devolvé SOLO JSON:
{ "cumple": boolean, "incumplimientos": ["qué regla se rompe y en qué comida, breve"] }
Solo marcá incumplimiento si es claramente verificable en este día; no inventes problemas.
Reglas: ${JSON.stringify(condiciones.reglas)}
Día: ${JSON.stringify(dia)}
${diasPreviosResumen.length ? `Días anteriores (para reglas de variedad): ${diasPreviosResumen.join(" | ")}` : ""}`;
    const text = await generateNutritionText(
      prompt,
      JSON.stringify({ cumple: true, incumplimientos: [] }),
      1024,
      { jsonMode: true },
    );
    const parsed = extractJson<{ cumple?: boolean; incumplimientos?: string[] }>(text);
    if (!parsed || parsed.cumple !== false) return [];
    return (parsed.incumplimientos ?? []).map(String).filter(Boolean).slice(0, 6);
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
    const seed = input.comidaSeed ?? 0;
    const buscaVariedad = input.modo !== "ajustar";
    const alimentosActuales = base.ingredientes
      .map((ing) => ing.nombre?.trim())
      .filter((nombre): nombre is string => Boolean(nombre));
    const idsActuales = new Set(
      base.ingredientes
        .map((ing) => ing.alimentoId)
        .filter((id): id is string => Boolean(id)),
    );
    const catalogSinActuales = input.catalog.filter(
      (item) => !idsActuales.has(String(item._id)),
    );
    const fallbackCatalog =
      buscaVariedad && catalogSinActuales.length >= 3
        ? catalogSinActuales
        : input.catalog;
    const fallbackComida = resolverComidaAlCatalogo(
      buildComidaFallbackDesdeCatalogo(base, fallbackCatalog, seed),
      fallbackCatalog,
      seed,
    );

    const modoLabel =
      input.modo === "sugerir"
        ? "Sugerí una comida completa nueva"
        : input.modo === "alternativa"
          ? "Proponé una alternativa distinta"
          : `Ajustá la comida para acercarte a ${input.proteinaObjetivoG ?? "la"} g de proteína`;

    const variedadBlock =
      buscaVariedad && alimentosActuales.length > 0
        ? `VARIEDAD OBLIGATORIA: la propuesta tiene que ser claramente distinta a la comida actual. Cambiá al menos la fuente principal de proteína y la de carbohidrato; no repitas estos alimentos salvo que sea imprescindible: ${alimentosActuales.join(", ")}.`
        : buscaVariedad
          ? "Elegí una combinación variada y poco obvia dentro del catálogo."
          : "";

    const buildInstruction = (extra: string) => `${modoLabel} en JSON con esta estructura:
{
  "nombre": "string",
  "horario": "opcional",
  "ingredientes": [{ "nombre": "string", "cantidad": number, "unidad": "g|ml|unidad" }],
  "notas": "opcional",
  "preparacion": "breve"
}
Evaluación: ${JSON.stringify(evaluacion)}
Comida actual: ${JSON.stringify(base)}
${variedadBlock}
${extra}
${buscaVariedad ? `Variante solicitada #${seed} (cada pedido debe dar una opción diferente).` : ""}
${input.instruccion ? `Instrucción extra: ${input.instruccion}` : ""}
${input.comidaObjetivo ? `Meta de la comida: ${JSON.stringify(input.comidaObjetivo)}` : ""}
La suma de esta comida tiene que acercarse a su meta, sin superarla en más de un 20%.
${catalogInstructionBlock(input.catalog)}
Devolvé SOLO JSON.`;

    const generar = async (extra: string): Promise<ComidaPlan | null> => {
      const text = await generateNutritionText(
        buildInstruction(extra),
        JSON.stringify(fallbackComida),
        2048,
        { jsonMode: true, temperature: buscaVariedad ? 0.95 : 0.6 },
      );
      const parsed = extractJson<ComidaPlan>(text);
      if (!parsed) return null;
      const merged = normalizeComidaFromIa(
        {
          ...base,
          ...parsed,
          macrosObjetivo: input.comidaObjetivo ?? base.macrosObjetivo,
        },
        base,
      );
      return resolverComidaAlCatalogo(merged, input.catalog, seed);
    };

    const primera = await generar("");
    if (!primera) return fallbackComida;
    if (!buscaVariedad || !mismosAlimentos(primera, base)) return primera;

    const segunda = await generar(
      "Tu propuesta anterior repitió exactamente los mismos alimentos. Usá alimentos distintos.",
    );
    if (segunda && !mismosAlimentos(segunda, base)) return segunda;
    return fallbackComida;
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
