import type {
  RutinaChallenge28,
  RutinaDetail,
  RutinaSemana,
} from "@/features/alumna/types/rutina";

type SemanaPlanDraftLike = {
  numeroSemana: number;
  dias: {
    nombreDia: string;
    drafts: {
      ejercicioId: string;
      series: number;
      repeticiones: number;
      descansoSegundos: number;
    }[];
  }[];
};

export type PlanContentMediaType = "image" | "video" | "gif";

/** Campos por día (guardados en challenge28.days). */
export type PlanContentDayDraft = {
  dayTitle: string;
  tags: string;
  presentationVideoUrl: string;
  farewellVideoUrl: string;
  thumbnailUrl: string;
};

/** Campos por semana (guardados en challenge28.weeks). */
export type PlanContentWeekDraft = {
  presentationVideoUrl: string;
  farewellVideoUrl: string;
};

/** Estado del editor: globales + mapa por número de día. */
export type PlanContentEditorState = {
  title: string;
  subtitle: string;
  accentLabel: string;
  selectedDayNumber: number;
  daysByNumber: Record<number, PlanContentDayDraft>;
  weeksByNumber: Record<number, PlanContentWeekDraft>;
};

/** Vista plana del día seleccionado (preview / compat). */
export type PlanContentDraft = {
  title: string;
  subtitle: string;
  accentLabel: string;
  dayNumber: number;
  dayTitle: string;
  tags: string;
  presentationVideoUrl: string;
  farewellVideoUrl: string;
  thumbnailUrl: string;
};

type MediaAssetPayload = {
  type: PlanContentMediaType;
  url: string;
  alt?: string;
  posterUrl?: string;
};

function trimToUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildMediaAsset(
  type: PlanContentMediaType,
  url: string,
  alt?: string,
  posterUrl?: string,
): MediaAssetPayload | undefined {
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

function splitTags(value: string): string[] | undefined {
  const tags = value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  return tags.length > 0 ? tags : undefined;
}

export function createEmptyPlanContentDayDraft(): PlanContentDayDraft {
  return {
    dayTitle: "",
    tags: "",
    presentationVideoUrl: "",
    farewellVideoUrl: "",
    thumbnailUrl: "",
  };
}

export function createEmptyPlanContentWeekDraft(): PlanContentWeekDraft {
  return {
    presentationVideoUrl: "",
    farewellVideoUrl: "",
  };
}

export function createEmptyPlanContentEditorState(): PlanContentEditorState {
  return {
    title: "",
    subtitle: "",
    accentLabel: "",
    selectedDayNumber: 1,
    daysByNumber: {},
    weeksByNumber: {},
  };
}

export function createEmptyPlanContentDraft(): PlanContentDraft {
  return planContentEditorToDraft(createEmptyPlanContentEditorState());
}

export function planContentEditorToDraft(
  editor: PlanContentEditorState,
): PlanContentDraft {
  const day =
    editor.daysByNumber[editor.selectedDayNumber] ??
    createEmptyPlanContentDayDraft();

  return {
    title: editor.title,
    subtitle: editor.subtitle,
    accentLabel: editor.accentLabel,
    dayNumber: editor.selectedDayNumber,
    dayTitle: day.dayTitle,
    tags: day.tags,
    presentationVideoUrl: day.presentationVideoUrl,
    farewellVideoUrl: day.farewellVideoUrl,
    thumbnailUrl: day.thumbnailUrl,
  };
}

export function challenge28ToPlanContentEditor(
  challenge28: RutinaChallenge28 | undefined,
  defaults: { title: string; subtitle: string; accentLabel: string },
): PlanContentEditorState {
  const daysByNumber: Record<number, PlanContentDayDraft> = {};
  const weeksByNumber: Record<number, PlanContentWeekDraft> = {};

  for (const day of challenge28?.days ?? []) {
    daysByNumber[day.dayNumber] = {
      dayTitle: day.title ?? "",
      tags: day.tags?.join(", ") ?? "",
      presentationVideoUrl: day.media?.url ?? "",
      farewellVideoUrl: day.farewellMedia?.url ?? "",
      thumbnailUrl: day.thumbnail?.url ?? "",
    };
  }

  for (const week of challenge28?.weeks ?? []) {
    weeksByNumber[week.weekNumber] = {
      presentationVideoUrl: week.media?.url ?? "",
      farewellVideoUrl: week.farewellMedia?.url ?? "",
    };
  }

  const selectedDayNumber =
    challenge28?.days?.[0]?.dayNumber ??
    (Object.keys(daysByNumber).length > 0
      ? Math.min(...Object.keys(daysByNumber).map(Number))
      : 1);

  return {
    title: challenge28?.title?.trim() || defaults.title,
    subtitle: challenge28?.subtitle?.trim() || defaults.subtitle,
    accentLabel: challenge28?.accentLabel?.trim() || defaults.accentLabel,
    selectedDayNumber,
    daysByNumber,
    weeksByNumber,
  };
}

export function defaultPlanContentEditorFromTemplate(plan: {
  nombre: string;
  formato: string;
  inversion: string;
}): PlanContentEditorState {
  return {
    title: plan.nombre,
    subtitle: plan.formato,
    accentLabel: plan.inversion,
    selectedDayNumber: 1,
    daysByNumber: {},
    weeksByNumber: {},
  };
}

export function mergePlanContentEditorWithDefaults(
  editor: PlanContentEditorState,
  defaults: { title: string; subtitle: string; accentLabel: string },
): PlanContentEditorState {
  return {
    ...editor,
    title: editor.title.trim() || defaults.title,
    subtitle: editor.subtitle.trim() || defaults.subtitle,
    accentLabel: editor.accentLabel.trim() || defaults.accentLabel,
    weeksByNumber: editor.weeksByNumber ?? {},
  };
}

export function hasPlanContentEditorData(
  editor: PlanContentEditorState,
): boolean {
  if (
    editor.title.trim() ||
    editor.subtitle.trim() ||
    editor.accentLabel.trim()
  ) {
    return true;
  }

  return (
    Object.values(editor.daysByNumber).some(
      (day) =>
        day.dayTitle.trim() ||
        day.tags.trim() ||
        day.presentationVideoUrl.trim() ||
        day.farewellVideoUrl.trim() ||
        day.thumbnailUrl.trim(),
    ) ||
    Object.values(editor.weeksByNumber ?? {}).some(
      (week) =>
        week.presentationVideoUrl.trim() || week.farewellVideoUrl.trim(),
    )
  );
}

function buildChallengeDayPayload(
  dayNumber: number,
  draft: PlanContentDayDraft,
  fallbackDayTitle: string,
) {
  const presentationMedia = buildMediaAsset(
    "video",
    draft.presentationVideoUrl,
    draft.dayTitle || fallbackDayTitle,
  );
  const farewellMedia = buildMediaAsset(
    "video",
    draft.farewellVideoUrl,
    draft.dayTitle || fallbackDayTitle,
  );
  const challengeThumbnail = buildMediaAsset(
    "image",
    draft.thumbnailUrl,
    draft.dayTitle || fallbackDayTitle,
  );

  if (
    !draft.dayTitle.trim() &&
    !draft.tags.trim() &&
    !presentationMedia &&
    !farewellMedia &&
    !challengeThumbnail
  ) {
    return undefined;
  }

  return {
    dayNumber,
    ...(trimToUndefined(draft.dayTitle)
      ? { title: trimToUndefined(draft.dayTitle) }
      : {}),
    ...(splitTags(draft.tags) ? { tags: splitTags(draft.tags) } : {}),
    ...(presentationMedia ? { media: presentationMedia } : {}),
    ...(farewellMedia ? { farewellMedia } : {}),
    ...(challengeThumbnail ? { thumbnail: challengeThumbnail } : {}),
  };
}

function buildChallengeWeekPayload(
  weekNumber: number,
  draft: PlanContentWeekDraft,
) {
  const presentationMedia = buildMediaAsset(
    "video",
    draft.presentationVideoUrl,
    `Presentación semana ${weekNumber}`,
  );
  const farewellMedia = buildMediaAsset(
    "video",
    draft.farewellVideoUrl,
    `Cierre semana ${weekNumber}`,
  );

  if (!presentationMedia && !farewellMedia) {
    return undefined;
  }

  return {
    weekNumber,
    ...(presentationMedia ? { media: presentationMedia } : {}),
    ...(farewellMedia ? { farewellMedia } : {}),
  };
}

export function buildChallenge28FromEditorState(
  editor: PlanContentEditorState,
  fallbackDayTitle = "Día",
): RutinaChallenge28 | undefined {
  const days = Object.entries(editor.daysByNumber)
    .map(([dayNumber, draft]) =>
      buildChallengeDayPayload(Number(dayNumber), draft, fallbackDayTitle),
    )
    .filter((day): day is NonNullable<typeof day> => Boolean(day))
    .sort((a, b) => a.dayNumber - b.dayNumber);

  const weeks = Object.entries(editor.weeksByNumber ?? {})
    .map(([weekNumber, draft]) =>
      buildChallengeWeekPayload(Number(weekNumber), draft),
    )
    .filter((week): week is NonNullable<typeof week> => Boolean(week))
    .sort((a, b) => a.weekNumber - b.weekNumber);

  if (
    !editor.title.trim() &&
    !editor.subtitle.trim() &&
    !editor.accentLabel.trim() &&
    days.length === 0 &&
    weeks.length === 0
  ) {
    return undefined;
  }

  return {
    ...(trimToUndefined(editor.title) ? { title: trimToUndefined(editor.title) } : {}),
    ...(trimToUndefined(editor.subtitle)
      ? { subtitle: trimToUndefined(editor.subtitle) }
      : {}),
    ...(trimToUndefined(editor.accentLabel)
      ? { accentLabel: trimToUndefined(editor.accentLabel) }
      : {}),
    ...(days.length > 0 ? { days } : {}),
    ...(weeks.length > 0 ? { weeks } : {}),
  };
}

/** @deprecated Usar buildChallenge28FromEditorState */
export function buildChallenge28Payload(
  draft: PlanContentDraft,
  fallbackDayTitle = "Día",
): RutinaChallenge28 | undefined {
  return buildChallenge28FromEditorState(
    {
      title: draft.title,
      subtitle: draft.subtitle,
      accentLabel: draft.accentLabel,
      selectedDayNumber: draft.dayNumber,
      daysByNumber: {
        [draft.dayNumber]: {
          dayTitle: draft.dayTitle,
          tags: draft.tags,
          presentationVideoUrl: draft.presentationVideoUrl,
          farewellVideoUrl: draft.farewellVideoUrl,
          thumbnailUrl: draft.thumbnailUrl,
        },
      },
      weeksByNumber: {},
    },
    fallbackDayTitle,
  );
}

export function draftSemanasToRutinaSemanas(
  semanasDraft: SemanaPlanDraftLike[],
  ejerciciosById: Map<string, { id: string; nombre: string; videoUrl: string }>,
): RutinaSemana[] {
  return semanasDraft.map((sem) => ({
    numeroSemana: sem.numeroSemana,
    dias: sem.dias.map((dia) => ({
      nombreDia: dia.nombreDia.trim() || "Día",
      ejercicios: dia.drafts
        .filter((draft) => draft.ejercicioId)
        .map((draft) => {
          const ejercicio = ejerciciosById.get(draft.ejercicioId);
          return {
            id: draft.ejercicioId,
            nombre: ejercicio?.nombre ?? "Ejercicio",
            videoUrl: ejercicio?.videoUrl ?? "",
            series: draft.series,
            repeticiones: draft.repeticiones,
            descansoSegundos: draft.descansoSegundos,
          };
        }),
    })),
  }));
}

export function buildPreviewRutina(input: {
  nombrePlan: string;
  duracionSemanas: number;
  startDate: string;
  planTemplateSnapshot?: RutinaDetail["planTemplateSnapshot"];
  challenge28?: RutinaChallenge28;
  semanas: RutinaSemana[];
}): RutinaDetail {
  return {
    id: "preview",
    nombrePlan: input.nombrePlan.trim() || "Plan",
    duracionSemanas: input.duracionSemanas,
    startDate: input.startDate,
    planTemplateSnapshot: input.planTemplateSnapshot,
    challenge28: input.challenge28,
    semanas: input.semanas,
  };
}

export function getPlanDayLabelFromSemanas(
  semanasDraft: SemanaPlanDraftLike[],
  dayNumber: number,
): string {
  let counter = 0;
  for (const semana of semanasDraft) {
    for (const dia of semana.dias) {
      counter += 1;
      if (counter === dayNumber) {
        return dia.nombreDia.trim() || `Día ${dayNumber}`;
      }
    }
  }
  return `Día ${dayNumber}`;
}

export function getPlanDayNumberFromSemanas(
  semanasDraft: SemanaPlanDraftLike[],
  semanaIndex: number,
  diaIndex: number,
): number {
  let counter = 0;
  for (let weekIndex = 0; weekIndex < semanasDraft.length; weekIndex += 1) {
    const semana = semanasDraft[weekIndex];
    for (let dayIndex = 0; dayIndex < semana.dias.length; dayIndex += 1) {
      if (weekIndex === semanaIndex && dayIndex === diaIndex) {
        return counter + 1;
      }
      counter += 1;
    }
  }
  return counter + 1;
}
