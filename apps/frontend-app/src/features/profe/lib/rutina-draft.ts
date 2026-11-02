import type { RutinaChallenge28, RutinaStoryPreview } from "@/features/alumna/types/rutina";
import type { PlanTemplate } from "@/features/profe/hooks/usePlanTemplates";
import {
  buildChallenge28FromEditorState,
  challenge28ToPlanContentEditor,
  createEmptyPlanContentEditorState,
  defaultPlanContentEditorFromTemplate,
  type PlanContentEditorState,
  type PlanContentMediaType,
} from "@/features/profe/lib/plan-content";
import {
  isRepeticionesPorSerieActive,
  persistRepeticionesPorSerie,
} from "@/lib/rutina-reps";
import { addCalendarDays, profeCalendarDateKey } from "@ivisfit/database/calendar";

export type MediaType = PlanContentMediaType;

export type EjercicioRutinaDraft = {
  localId: string;
  ejercicioId: string;
  series: number;
  repeticiones: number;
  repeticionesPorSerie?: number[];
  descansoSegundos: number;
  mediaType: MediaType;
  mediaUrl: string;
  mediaPosterUrl: string;
};

export type DiaPlanDraft = {
  localId: string;
  nombreDia: string;
  comentario: string;
  /** YYYY-MM-DD. Vacía en plantillas, que no guardan una fecha absoluta. */
  fecha: string;
  /** La profe la eligió, o el día ya estaba guardado: cambiar Inicio no la mueve. */
  fechaManual: boolean;
  drafts: EjercicioRutinaDraft[];
};

export type SemanaPlanDraft = {
  numeroSemana: number;
  dias: DiaPlanDraft[];
};

export type PlanTemplateBlueprint = {
  diasPorSemana?: number;
  nombrePlan?: string;
  duracionSemanas?: number;
  storyPreview?: RutinaStoryPreview;
  challenge28?: RutinaChallenge28;
  planContentEnabled?: boolean;
  semanas?: {
    numeroSemana: number;
    dias: {
      nombreDia: string;
      comentario?: string;
      fecha?: string;
      ejercicios: {
        ejercicioId: string;
        series: number;
        repeticiones: number;
        repeticionesPorSerie?: number[];
        descansoSegundos: number;
        media?: {
          type: MediaType;
          url: string;
          posterUrl?: string;
        };
      }[];
    }[];
  }[];
};

export type RutinaBuilderFormState = {
  nombrePlan: string;
  duracionSemanas: number;
  diasPorSemana: number;
  startDate: string;
  storyMediaType: MediaType;
  storyBackgroundUrl: string;
  storyPosterUrl: string;
  storyTitle: string;
  storySubtitle: string;
  storyCtaLabel: string;
  planContent: PlanContentEditorState;
  semanasDraft: SemanaPlanDraft[];
};

function createLocalId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

export function createDraftEjercicio(ejercicioId = ""): EjercicioRutinaDraft {
  return {
    localId: createLocalId(),
    ejercicioId,
    series: 3,
    repeticiones: 10,
    descansoSegundos: 60,
    mediaType: "gif",
    mediaUrl: "",
    mediaPosterUrl: "",
  };
}

const DIA_FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isDiaFechaKey(value: string): boolean {
  return DIA_FECHA_RE.test(value);
}

export function createDiaPlanDraft(
  dayIndex: number,
  defaultEjercicioId = "",
): DiaPlanDraft {
  return {
    localId: createLocalId(),
    nombreDia: `Día ${dayIndex}`,
    comentario: "",
    fecha: "",
    fechaManual: false,
    drafts: [createDraftEjercicio(defaultEjercicioId)],
  };
}

function weekIndexByNumero(semanas: { numeroSemana: number }[]): Map<number, number> {
  return new Map(
    [...semanas]
      .sort((a, b) => a.numeroSemana - b.numeroSemana)
      .map((sem, index) => [sem.numeroSemana, index]),
  );
}

/** Fecha que hoy se calcula sola: inicio + semana × 7 + posición en la semana. */
export function positionalDiaFecha(
  startDate: string,
  weekIndex: number,
  dayIndex: number,
): string {
  if (!isDiaFechaKey(startDate) || weekIndex < 0 || dayIndex < 0) return "";
  return addCalendarDays(startDate, weekIndex * 7 + dayIndex);
}

export function nextFreeDiaFecha(start: string, taken: ReadonlySet<string>): string {
  if (!isDiaFechaKey(start)) return "";
  let cursor = start;
  const guard = taken.size + 370;
  for (let step = 0; step < guard && taken.has(cursor); step += 1) {
    cursor = addCalendarDays(cursor, 1);
  }
  return cursor;
}

function collectDiaFechas(
  semanas: SemanaPlanDraft[],
  predicate: (dia: DiaPlanDraft) => boolean = () => true,
): Set<string> {
  const taken = new Set<string>();
  for (const sem of semanas) {
    for (const dia of sem.dias) {
      if (predicate(dia) && isDiaFechaKey(dia.fecha)) taken.add(dia.fecha);
    }
  }
  return taken;
}

/** Recalcula las fechas que la profe todavía no tocó. Las manuales quedan. */
export function rescheduleAutoDiaFechas(
  semanas: SemanaPlanDraft[],
  startDate: string,
): SemanaPlanDraft[] {
  const taken = collectDiaFechas(semanas, (dia) => dia.fechaManual);
  const weekIndexes = weekIndexByNumero(semanas);
  const fechaByLocalId = new Map<string, string>();

  for (const sem of [...semanas].sort((a, b) => a.numeroSemana - b.numeroSemana)) {
    sem.dias.forEach((dia, dayIndex) => {
      if (dia.fechaManual) return;
      const fecha = nextFreeDiaFecha(
        positionalDiaFecha(
          startDate,
          weekIndexes.get(sem.numeroSemana) ?? 0,
          dayIndex,
        ),
        taken,
      );
      if (fecha) taken.add(fecha);
      fechaByLocalId.set(dia.localId, fecha);
    });
  }

  return semanas.map((sem) => ({
    ...sem,
    dias: sem.dias.map((dia) => {
      const fecha = fechaByLocalId.get(dia.localId);
      if (fecha === undefined) return dia;
      return { ...dia, fecha, fechaManual: false };
    }),
  }));
}

/** Completa días nuevos sin fecha. No mueve las que ya tienen. */
export function fillMissingDiaFechas(
  semanas: SemanaPlanDraft[],
  startDate: string,
  fechaManual = false,
): SemanaPlanDraft[] {
  const taken = collectDiaFechas(semanas);
  const weekIndexes = weekIndexByNumero(semanas);
  const fechaByLocalId = new Map<string, string>();

  for (const sem of [...semanas].sort((a, b) => a.numeroSemana - b.numeroSemana)) {
    sem.dias.forEach((dia, dayIndex) => {
      if (isDiaFechaKey(dia.fecha)) return;
      const fecha = nextFreeDiaFecha(
        positionalDiaFecha(
          startDate,
          weekIndexes.get(sem.numeroSemana) ?? 0,
          dayIndex,
        ),
        taken,
      );
      if (fecha) taken.add(fecha);
      fechaByLocalId.set(dia.localId, fecha);
    });
  }

  return semanas.map((sem) => ({
    ...sem,
    dias: sem.dias.map((dia) => {
      const fecha = fechaByLocalId.get(dia.localId);
      if (!fecha) return dia;
      return { ...dia, fecha, fechaManual };
    }),
  }));
}

export function suggestNewDiaFecha(
  semanas: SemanaPlanDraft[],
  weekNumber: number,
  dayIndex: number,
  startDate: string,
): string {
  const weekIndex = weekIndexByNumero(semanas).get(weekNumber) ?? 0;
  return nextFreeDiaFecha(
    positionalDiaFecha(startDate, weekIndex, dayIndex),
    collectDiaFechas(semanas),
  );
}

export function findDiaFechaIssues(semanas: SemanaPlanDraft[]): string | null {
  const seen = new Map<string, string>();
  for (const sem of semanas) {
    for (const [dayIndex, dia] of sem.dias.entries()) {
      const label = `Semana ${sem.numeroSemana}, ${dia.nombreDia.trim() || `día ${dayIndex + 1}`}`;
      if (!isDiaFechaKey(dia.fecha.trim())) {
        return "Cada día necesita una fecha.";
      }
      const previous = seen.get(dia.fecha);
      if (previous) {
        return `${label} tiene la misma fecha que ${previous}. Elegí una fecha distinta para cada día.`;
      }
      seen.set(dia.fecha, label);
    }
  }
  return null;
}

export function buildSemanasDraftForPlan(
  duracionSemanas: number,
  diasPorSemana: number,
  defaultEjercicioId = "",
): SemanaPlanDraft[] {
  return Array.from({ length: duracionSemanas }, (_, weekIdx) => ({
    numeroSemana: weekIdx + 1,
    dias: Array.from({ length: diasPorSemana }, (_, dayIdx) =>
      createDiaPlanDraft(dayIdx + 1, defaultEjercicioId),
    ),
  }));
}

function resolveEjercicioId(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "_id" in value) {
    const id = (value as { _id?: unknown })._id;
    return typeof id === "string" ? id : String(id);
  }
  return String(value ?? "");
}

type PlanContentDefaults = {
  title: string;
  subtitle: string;
  accentLabel: string;
};

export function planContentDefaultsFromTemplate(
  plan: Pick<PlanTemplate, "nombre" | "formato" | "inversion">,
): PlanContentDefaults {
  return {
    title: plan.nombre,
    subtitle: plan.formato,
    accentLabel: plan.inversion,
  };
}

export { mergePlanContentEditorWithDefaults } from "@/features/profe/lib/plan-content";

function repeticionesPorSerieFromSource(
  series: number,
  repeticionesPorSerie?: number[],
): number[] | undefined {
  if (!isRepeticionesPorSerieActive(series, repeticionesPorSerie)) {
    return undefined;
  }
  return [...repeticionesPorSerie];
}

function withPersistedRepeticionesPorSerie<T extends {
  series: number;
  repeticiones: number;
}>(
  ejercicio: T,
  repeticionesPorSerie?: number[],
): T & { repeticionesPorSerie?: number[] } {
  const persisted = persistRepeticionesPorSerie(
    ejercicio.series,
    ejercicio.repeticiones,
    repeticionesPorSerie,
  );
  return persisted
    ? { ...ejercicio, repeticionesPorSerie: persisted }
    : ejercicio;
}

function semanasFromBlueprint(
  blueprint: PlanTemplateBlueprint,
  defaultEjercicioId: string,
): SemanaPlanDraft[] {
  if (!blueprint.semanas?.length) return [];

  return blueprint.semanas.map((sem) => ({
    numeroSemana: sem.numeroSemana,
    dias: sem.dias.map((dia) => ({
      localId: createLocalId(),
      nombreDia: dia.nombreDia,
      comentario: dia.comentario ?? "",
      fecha: "",
      fechaManual: false,
      drafts: dia.ejercicios.map((ej) => {
        const repeticionesPorSerie = repeticionesPorSerieFromSource(
          ej.series,
          ej.repeticionesPorSerie,
        );
        return {
          localId: createLocalId(),
          ejercicioId: resolveEjercicioId(ej.ejercicioId),
          series: ej.series,
          repeticiones: ej.repeticiones,
          descansoSegundos: ej.descansoSegundos,
          mediaType: ej.media?.type ?? "gif",
          mediaUrl: ej.media?.url ?? "",
          mediaPosterUrl: ej.media?.posterUrl ?? "",
          ...(repeticionesPorSerie ? { repeticionesPorSerie } : {}),
        };
      }),
    })),
  }));
}

export function blueprintToFormState(
  blueprint: PlanTemplateBlueprint | undefined,
  plan: PlanTemplate,
  defaultEjercicioId: string,
  startDate: string,
): RutinaBuilderFormState {
  const diasPorSemana =
    blueprint?.diasPorSemana ??
    (blueprint?.semanas?.[0]?.dias.length || 3);
  const duracionSemanas =
    blueprint?.duracionSemanas ?? plan.duracionSemanas;
  const semanasDraft =
    blueprint?.semanas?.length
      ? semanasFromBlueprint(blueprint, defaultEjercicioId)
      : buildSemanasDraftForPlan(
          duracionSemanas,
          diasPorSemana,
          defaultEjercicioId,
        );

  const story = blueprint?.storyPreview;
  const planContentDefaults = planContentDefaultsFromTemplate(plan);
  const planContent = blueprint?.challenge28
    ? challenge28ToPlanContentEditor(blueprint.challenge28, planContentDefaults)
    : defaultPlanContentEditorFromTemplate(plan);

  return {
    nombrePlan: blueprint?.nombrePlan ?? plan.nombre,
    duracionSemanas,
    diasPorSemana,
    startDate,
    storyMediaType: story?.background?.type ?? "image",
    storyBackgroundUrl: story?.background?.url ?? "",
    storyPosterUrl: story?.background?.posterUrl ?? "",
    storyTitle: story?.title?.trim() || plan.nombre,
    storySubtitle: story?.subtitle?.trim() || plan.enfoque,
    storyCtaLabel: story?.ctaLabel ?? "",
    planContent,
    semanasDraft,
  };
}

export function rutinaDocToFormState(
  rutina: {
    nombrePlan: string;
    duracionSemanas: number;
    startDate?: string;
    planTemplateSnapshot?: {
      nombre?: string;
      formato?: string;
      inversion?: string;
    };
    storyPreview?: RutinaStoryPreview;
    challenge28?: RutinaChallenge28;
    semanas: {
      numeroSemana: number;
      dias: {
        nombreDia: string;
        comentario?: string;
        fecha?: string;
        ejercicios: {
          id?: string;
          series: number;
          repeticiones: number;
          repeticionesPorSerie?: number[];
          descansoSegundos: number;
          media?: { type: MediaType; url: string; posterUrl?: string };
        }[];
      }[];
    }[];
  },
  defaultEjercicioId: string,
  startDateFallback: string,
): RutinaBuilderFormState {
  const diasPorSemana = Math.max(
    ...rutina.semanas.map((s) => s.dias.length),
    1,
  );
  const start = profeCalendarDateKey(rutina.startDate) ?? startDateFallback;
  const weekIndexes = weekIndexByNumero(rutina.semanas);
  const semanasDraft: SemanaPlanDraft[] = rutina.semanas.map((sem) => ({
    numeroSemana: sem.numeroSemana,
    dias: sem.dias.map((dia, index) => {
      const stored = profeCalendarDateKey(dia.fecha);
      const fecha =
        stored ??
        positionalDiaFecha(start, weekIndexes.get(sem.numeroSemana) ?? 0, index);
      return {
        localId: createLocalId(),
        nombreDia: dia.nombreDia,
        comentario: dia.comentario ?? "",
        fecha,
        fechaManual: true,
        drafts: dia.ejercicios.map((ej) => {
        const repeticionesPorSerie = repeticionesPorSerieFromSource(
          ej.series,
          ej.repeticionesPorSerie,
        );
        return {
          localId: createLocalId(),
          ejercicioId: ej.id ?? defaultEjercicioId,
          series: ej.series,
          repeticiones: ej.repeticiones,
          descansoSegundos: ej.descansoSegundos,
          mediaType: ej.media?.type ?? "gif",
          mediaUrl: ej.media?.url ?? "",
          mediaPosterUrl: ej.media?.posterUrl ?? "",
          ...(repeticionesPorSerie ? { repeticionesPorSerie } : {}),
        };
      }),
      };
    }),
  }));

  const story = rutina.storyPreview;
  const planContentDefaults: PlanContentDefaults = {
    title: rutina.planTemplateSnapshot?.nombre ?? rutina.nombrePlan,
    subtitle:
      rutina.planTemplateSnapshot?.formato ??
      rutina.challenge28?.subtitle ??
      "",
    accentLabel:
      rutina.planTemplateSnapshot?.inversion ??
      rutina.challenge28?.accentLabel ??
      "",
  };
  const planContent = rutina.challenge28
    ? challenge28ToPlanContentEditor(rutina.challenge28, planContentDefaults)
    : defaultPlanContentEditorFromTemplate({
        nombre: planContentDefaults.title,
        formato: planContentDefaults.subtitle,
        inversion: planContentDefaults.accentLabel,
      });

  return {
    nombrePlan: rutina.nombrePlan,
    duracionSemanas: rutina.duracionSemanas,
    diasPorSemana,
    startDate: profeCalendarDateKey(rutina.startDate) ?? startDateFallback,
    storyMediaType: story?.background?.type ?? "image",
    storyBackgroundUrl: story?.background?.url ?? "",
    storyPosterUrl: story?.background?.posterUrl ?? "",
    storyTitle: story?.title?.trim() || rutina.nombrePlan,
    storySubtitle: story?.subtitle?.trim() || "",
    storyCtaLabel: story?.ctaLabel ?? "",
    planContent,
    semanasDraft,
  };
}

function trimToUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildMediaAsset(
  type: MediaType,
  url: string,
  alt?: string,
  posterUrl?: string,
) {
  const mediaUrl = trimToUndefined(url);
  if (!mediaUrl) return undefined;
  return {
    type,
    url: mediaUrl,
    ...(trimToUndefined(alt ?? "") ? { alt: trimToUndefined(alt ?? "") } : {}),
    ...(trimToUndefined(posterUrl ?? "")
      ? { posterUrl: trimToUndefined(posterUrl ?? "") }
      : {}),
  };
}

/** Solo incluye días con al menos un ejercicio (evita rechazo del API). */
export function sanitizeBlueprintSemanas(
  semanas: NonNullable<PlanTemplateBlueprint["semanas"]>,
): PlanTemplateBlueprint["semanas"] | undefined {
  const sanitized = semanas
    .map((sem) => ({
      numeroSemana: sem.numeroSemana,
      dias: sem.dias.filter(
        (dia) => dia.nombreDia.length > 0 && dia.ejercicios.length > 0,
      ),
    }))
    .filter((sem) => sem.dias.length > 0);

  return sanitized.length > 0 ? sanitized : undefined;
}

export function isSemanaDraftComplete(semana: SemanaPlanDraft): boolean {
  return (
    semana.dias.length > 0 &&
    semana.dias.every(
      (dia) =>
        dia.nombreDia.trim() &&
        dia.drafts.length > 0 &&
        dia.drafts.every((draft) => draft.ejercicioId),
    )
  );
}

export function isDiaDraftComplete(dia: DiaPlanDraft): boolean {
  return (
    Boolean(dia.nombreDia.trim()) &&
    dia.drafts.length > 0 &&
    dia.drafts.every((draft) => draft.ejercicioId)
  );
}

type BlueprintSemana = NonNullable<PlanTemplateBlueprint["semanas"]>[number];
type BlueprintDia = BlueprintSemana["dias"][number];

function diaDraftToBlueprint(dia: DiaPlanDraft): BlueprintDia | undefined {
  const nombreDia = dia.nombreDia.trim();
  const ejercicios = dia.drafts
    .filter((draft) => draft.ejercicioId)
    .map((draft) => {
      const media = buildMediaAsset(
        draft.mediaType,
        draft.mediaUrl,
        undefined,
        draft.mediaPosterUrl,
      );
      return withPersistedRepeticionesPorSerie(
        {
          ejercicioId: draft.ejercicioId,
          series: draft.series,
          repeticiones: draft.repeticiones,
          descansoSegundos: draft.descansoSegundos,
          ...(media ? { media } : {}),
        },
        draft.repeticionesPorSerie,
      );
    });

  if (!nombreDia || ejercicios.length === 0) return undefined;
  const comentario = trimToUndefined(dia.comentario ?? "");
  const fecha = isDiaFechaKey(dia.fecha.trim()) ? dia.fecha.trim() : undefined;
  return {
    nombreDia,
    ...(comentario ? { comentario } : {}),
    ...(fecha ? { fecha } : {}),
    ejercicios,
  };
}

function resolveBlueprintDia(
  semana: BlueprintSemana | undefined,
  draftDia: DiaPlanDraft,
  dayIndex: number,
): BlueprintDia | undefined {
  if (!semana?.dias?.length) return undefined;

  const byIndex = semana.dias[dayIndex];
  const trimmedName = draftDia.nombreDia.trim();
  if (byIndex && (!trimmedName || byIndex.nombreDia === trimmedName)) {
    return byIndex;
  }

  if (trimmedName) {
    const byName = semana.dias.find((dia) => dia.nombreDia === trimmedName);
    if (byName) return byName;
  }

  return byIndex;
}

function mergeSemanaDiasForSave(
  draftSemana: SemanaPlanDraft,
  nextSemana: BlueprintSemana | undefined,
  previousSemana: BlueprintSemana | undefined,
): BlueprintSemana | undefined {
  const mergedDias = draftSemana.dias
    .map((draftDia, dayIndex) => {
      const fromDraft = diaDraftToBlueprint(draftDia);
      if (fromDraft) return fromDraft;

      return (
        resolveBlueprintDia(previousSemana, draftDia, dayIndex) ??
        resolveBlueprintDia(nextSemana, draftDia, dayIndex)
      );
    })
    .filter(
      (dia): dia is BlueprintDia =>
        Boolean(dia?.nombreDia && dia.ejercicios?.length),
    );

  if (mergedDias.length === 0) {
    return previousSemana ?? nextSemana;
  }

  return {
    numeroSemana: draftSemana.numeroSemana,
    dias: mergedDias,
  };
}

function mergeChallenge28BlueprintForSave(
  next?: PlanTemplateBlueprint["challenge28"],
  previous?: PlanTemplateBlueprint["challenge28"],
): PlanTemplateBlueprint["challenge28"] | undefined {
  if (!previous?.days?.length && !previous?.weeks?.length) {
    return next;
  }

  if (!next?.days?.length && !next?.weeks?.length) {
    return previous;
  }

  const daysByNumber = new Map(
    (previous?.days ?? []).map((day) => [day.dayNumber, { ...day }]),
  );

  for (const day of next?.days ?? []) {
    const existing = daysByNumber.get(day.dayNumber);
    daysByNumber.set(day.dayNumber, {
      ...existing,
      ...day,
      dayNumber: day.dayNumber,
    });
  }

  const weeksByNumber = new Map(
    (previous?.weeks ?? []).map((week) => [week.weekNumber, { ...week }]),
  );

  for (const week of next?.weeks ?? []) {
    const existing = weeksByNumber.get(week.weekNumber);
    weeksByNumber.set(week.weekNumber, {
      ...existing,
      ...week,
      weekNumber: week.weekNumber,
    });
  }

  const days = [...daysByNumber.values()].sort(
    (a, b) => a.dayNumber - b.dayNumber,
  );
  const weeks = [...weeksByNumber.values()].sort(
    (a, b) => a.weekNumber - b.weekNumber,
  );

  return {
    ...(next?.title?.trim() || previous?.title?.trim()
      ? { title: next?.title?.trim() || previous?.title }
      : {}),
    ...(next?.subtitle?.trim() || previous?.subtitle?.trim()
      ? { subtitle: next?.subtitle?.trim() || previous?.subtitle }
      : {}),
    ...(next?.accentLabel?.trim() || previous?.accentLabel?.trim()
      ? { accentLabel: next?.accentLabel?.trim() || previous?.accentLabel }
      : {}),
    ...(days.length > 0 ? { days } : {}),
    ...(weeks.length > 0 ? { weeks } : {}),
  };
}

/** Conserva semanas ya guardadas si el borrador de esa semana aún no está completo. */
export function mergeTemplateBlueprintForSave(
  next: PlanTemplateBlueprint,
  previous?: PlanTemplateBlueprint,
  semanasDraft?: SemanaPlanDraft[],
): PlanTemplateBlueprint {
  const mergedChallenge28 = mergeChallenge28BlueprintForSave(
    next.challenge28,
    previous?.challenge28,
  );

  const withChallenge28 = {
    ...next,
    ...(mergedChallenge28
      ? { challenge28: mergedChallenge28, planContentEnabled: true }
      : {}),
  };

  if (!previous?.semanas?.length) {
    return withChallenge28;
  }

  if (!semanasDraft?.length) {
    if (withChallenge28.semanas?.length) return withChallenge28;
    return { ...withChallenge28, semanas: previous.semanas };
  }

  const nextSemanasByNumber = new Map(
    (withChallenge28.semanas ?? []).map((sem) => [sem.numeroSemana, sem] as const),
  );
  const previousSemanasByNumber = new Map(
    previous.semanas.map((sem) => [sem.numeroSemana, sem] as const),
  );

  const mergedSemanas = semanasDraft
    .map((draftSemana) => {
      if (isSemanaDraftComplete(draftSemana)) {
        return nextSemanasByNumber.get(draftSemana.numeroSemana);
      }

      return mergeSemanaDiasForSave(
        draftSemana,
        nextSemanasByNumber.get(draftSemana.numeroSemana),
        previousSemanasByNumber.get(draftSemana.numeroSemana),
      );
    })
    .filter((sem): sem is NonNullable<typeof sem> => Boolean(sem?.dias?.length));

  return {
    ...withChallenge28,
    ...(mergedSemanas.length > 0 ? { semanas: mergedSemanas } : {}),
  };
}

export function formStateToBlueprint(
  state: RutinaBuilderFormState,
  fallbackDayTitle: string,
): PlanTemplateBlueprint {
  const storyBackground = buildMediaAsset(
    state.storyMediaType,
    state.storyBackgroundUrl,
    state.storyTitle || state.nombrePlan,
    state.storyPosterUrl,
  );
  const storyPreview =
    storyBackground ||
    state.storyTitle.trim() ||
    state.storySubtitle.trim() ||
    state.storyCtaLabel.trim()
      ? {
          ...(storyBackground ? { background: storyBackground } : {}),
          ...(trimToUndefined(state.storyTitle)
            ? { title: trimToUndefined(state.storyTitle) }
            : {}),
          ...(trimToUndefined(state.storySubtitle)
            ? { subtitle: trimToUndefined(state.storySubtitle) }
            : {}),
          ...(trimToUndefined(state.storyCtaLabel)
            ? { ctaLabel: trimToUndefined(state.storyCtaLabel) }
            : {}),
        }
      : undefined;

  const challenge28 = buildChallenge28FromEditorState(
    state.planContent,
    fallbackDayTitle,
  );

  const semanas = sanitizeBlueprintSemanas(
    state.semanasDraft.map((sem) => ({
      numeroSemana: sem.numeroSemana,
      dias: sem.dias
        .map((dia) => diaDraftToBlueprint(dia))
        .filter((dia): dia is BlueprintDia => Boolean(dia)),
    })),
  );

  return {
    diasPorSemana: state.diasPorSemana,
    nombrePlan: trimToUndefined(state.nombrePlan),
    duracionSemanas: state.duracionSemanas,
    ...(storyPreview ? { storyPreview } : {}),
    ...(challenge28 ? { challenge28, planContentEnabled: true } : {}),
    ...(semanas ? { semanas } : {}),
  };
}

export function rutinaDetailToBlueprint(
  rutina: Parameters<typeof rutinaDocToFormState>[0],
  defaultEjercicioId: string,
  startDateFallback: string,
): PlanTemplateBlueprint {
  const state = rutinaDocToFormState(
    rutina,
    defaultEjercicioId,
    startDateFallback,
  );

  return formStateToBlueprint(
    state,
    state.semanasDraft[0]?.dias[0]?.nombreDia || "Día",
  );
}

export function formStateToRutinaPayload(
  state: RutinaBuilderFormState,
  alumnaId: string,
  plan: PlanTemplate | null,
  buildPlanTemplateSnapshot: (plan: PlanTemplate) => Record<string, unknown>,
  fallbackDayTitle: string,
  options?: {
    previousBlueprint?: PlanTemplateBlueprint;
  },
) {
  const nextBlueprint = formStateToBlueprint(state, fallbackDayTitle);
  const blueprint =
    options?.previousBlueprint
      ? mergeTemplateBlueprintForSave(
          nextBlueprint,
          options.previousBlueprint,
          state.semanasDraft,
        )
      : nextBlueprint;
  const storyPreview = blueprint.storyPreview;
  const challenge28 = blueprint.challenge28;

  return {
    alumnaId,
    ...(plan
      ? {
          planTemplateId: plan.id,
          planTemplateSnapshot: buildPlanTemplateSnapshot(plan),
        }
      : {}),
    nombrePlan: state.nombrePlan.trim(),
    duracionSemanas: state.duracionSemanas,
    startDate: state.startDate,
    ...(storyPreview ? { storyPreview } : {}),
    ...(challenge28 ? { challenge28 } : {}),
    semanas: blueprint.semanas ?? [],
  };
}
