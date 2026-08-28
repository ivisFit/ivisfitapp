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

export type MediaType = PlanContentMediaType;

export type EjercicioRutinaDraft = {
  localId: string;
  ejercicioId: string;
  series: number;
  repeticiones: number;
  descansoSegundos: number;
  mediaType: MediaType;
  mediaUrl: string;
  mediaPosterUrl: string;
};

export type DiaPlanDraft = {
  localId: string;
  nombreDia: string;
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
      ejercicios: {
        ejercicioId: string;
        series: number;
        repeticiones: number;
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

export function createDiaPlanDraft(
  dayIndex: number,
  defaultEjercicioId = "",
): DiaPlanDraft {
  return {
    localId: createLocalId(),
    nombreDia: `Día ${dayIndex}`,
    drafts: [createDraftEjercicio(defaultEjercicioId)],
  };
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

function semanasFromBlueprint(
  blueprint: PlanTemplateBlueprint,
  defaultEjercicioId: string,
): SemanaPlanDraft[] {
  if (!blueprint.semanas?.length) return [];

  return blueprint.semanas.map((sem) => ({
    numeroSemana: sem.numeroSemana,
    dias: sem.dias.map((dia, index) => ({
      localId: createLocalId(),
      nombreDia: dia.nombreDia,
      drafts: dia.ejercicios.map((ej) => ({
        localId: createLocalId(),
        ejercicioId: resolveEjercicioId(ej.ejercicioId),
        series: ej.series,
        repeticiones: ej.repeticiones,
        descansoSegundos: ej.descansoSegundos,
        mediaType: ej.media?.type ?? "gif",
        mediaUrl: ej.media?.url ?? "",
        mediaPosterUrl: ej.media?.posterUrl ?? "",
      })),
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
        ejercicios: {
          id?: string;
          series: number;
          repeticiones: number;
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
  const semanasDraft: SemanaPlanDraft[] = rutina.semanas.map((sem) => ({
    numeroSemana: sem.numeroSemana,
    dias: sem.dias.map((dia, index) => ({
      localId: createLocalId(),
      nombreDia: dia.nombreDia,
      drafts: dia.ejercicios.map((ej) => ({
        localId: createLocalId(),
        ejercicioId: ej.id ?? defaultEjercicioId,
        series: ej.series,
        repeticiones: ej.repeticiones,
        descansoSegundos: ej.descansoSegundos,
        mediaType: ej.media?.type ?? "gif",
        mediaUrl: ej.media?.url ?? "",
        mediaPosterUrl: ej.media?.posterUrl ?? "",
      })),
    })),
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
    startDate: rutina.startDate?.slice(0, 10) ?? startDateFallback,
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
      return {
        ejercicioId: draft.ejercicioId,
        series: draft.series,
        repeticiones: draft.repeticiones,
        descansoSegundos: draft.descansoSegundos,
        ...(media ? { media } : {}),
      };
    });

  if (!nombreDia || ejercicios.length === 0) return undefined;
  return { nombreDia, ejercicios };
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
