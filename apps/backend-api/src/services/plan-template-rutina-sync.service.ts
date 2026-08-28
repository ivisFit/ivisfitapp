import { PlanTemplate, Rutina } from "@ivisfit/database";
import { Types } from "mongoose";

type MediaAsset = {
  type: "image" | "video" | "gif";
  url: string;
  alt?: string;
  posterUrl?: string;
};

type ChallengeDay = {
  dayNumber: number;
  title?: string;
  tags?: string[];
  media?: MediaAsset;
  farewellMedia?: MediaAsset;
  thumbnail?: MediaAsset;
};

type ChallengeWeek = {
  weekNumber: number;
  media?: MediaAsset;
  farewellMedia?: MediaAsset;
};

export type Challenge28 = {
  title?: string;
  subtitle?: string;
  accentLabel?: string;
  days?: ChallengeDay[];
  weeks?: ChallengeWeek[];
};

type RutinaTemplateLink = {
  planTemplateId?:
    | Types.ObjectId
    | string
    | { _id?: Types.ObjectId | string; toString?: () => string }
    | null;
  planTemplateSnapshot?: { nombre?: string } | null;
  nombrePlan?: string;
};

function templateNombreCandidates(rutina: RutinaTemplateLink): string[] {
  const names = [
    rutina.planTemplateSnapshot?.nombre,
    rutina.nombrePlan,
  ]
    .map((name) => name?.trim())
    .filter((name): name is string => Boolean(name));

  return [...new Set(names)];
}

async function fetchTemplateByNombre(
  nombre: string,
): Promise<Challenge28 | undefined> {
  const template = await PlanTemplate.findOne({ nombre }).select(
    "blueprint.challenge28",
  );
  return toPlainChallenge28(
    template?.blueprint?.challenge28 as Challenge28 | undefined,
  );
}

export async function fetchTemplateChallenge28ForRutina(
  rutina: RutinaTemplateLink,
): Promise<Challenge28 | undefined> {
  const templateId = resolvePlanTemplateId(rutina.planTemplateId);
  if (templateId) {
    const template = await PlanTemplate.findById(templateId).select(
      "blueprint.challenge28 nombre",
    );
    const challenge28 = toPlainChallenge28(
      template?.blueprint?.challenge28 as Challenge28 | undefined,
    );
    if (challenge28) return challenge28;
  }

  for (const nombre of templateNombreCandidates(rutina)) {
    const challenge28 = await fetchTemplateByNombre(nombre);
    if (challenge28) return challenge28;
  }

  return undefined;
}

function resolvePlanTemplateId(
  planTemplateId: RutinaTemplateLink["planTemplateId"],
): string | null {
  if (!planTemplateId) return null;
  if (typeof planTemplateId === "string") return planTemplateId;
  if (planTemplateId instanceof Types.ObjectId) {
    return planTemplateId.toString();
  }
  if (typeof planTemplateId === "object") {
    const id = planTemplateId._id;
    if (id instanceof Types.ObjectId) return id.toString();
    if (typeof id === "string") return id;
    return planTemplateId.toString?.() ?? null;
  }
  return null;
}

function toPlainChallenge28(
  value: Challenge28 | null | undefined,
): Challenge28 | undefined {
  if (!value) return undefined;
  return JSON.parse(JSON.stringify(value)) as Challenge28;
}

function dayHasContent(day: ChallengeDay): boolean {
  return Boolean(
    day.title?.trim() ||
      day.tags?.length ||
      day.thumbnail ||
      day.media ||
      day.farewellMedia,
  );
}

function weekHasContent(week: ChallengeWeek): boolean {
  return Boolean(week.media || week.farewellMedia);
}

function pickVideoAsset(
  current?: MediaAsset,
  fallback?: MediaAsset,
): MediaAsset | undefined {
  if (current?.url?.trim()) return current;
  if (fallback) return fallback;
  return undefined;
}

function mediaPayloadEqual(
  a: MediaAsset | undefined,
  b: MediaAsset | undefined,
): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

/** Copia solo media y farewellMedia del template; conserva title, tags y thumbnail de la rutina. */
export function mergeChallenge28DayVideos(
  existingChallenge28: Challenge28 | null | undefined,
  templateChallenge28: Challenge28 | null | undefined,
): Challenge28 | undefined {
  const templateDays = templateChallenge28?.days ?? [];
  const templateWeeks = templateChallenge28?.weeks ?? [];
  if (templateDays.length === 0 && templateWeeks.length === 0) {
    return toPlainChallenge28(existingChallenge28);
  }

  const existing = toPlainChallenge28(existingChallenge28);
  const daysByNumber = new Map(
    (existing?.days ?? []).map((day) => [day.dayNumber, { ...day }]),
  );

  for (const templateDay of templateDays) {
    const current = daysByNumber.get(templateDay.dayNumber) ?? {
      dayNumber: templateDay.dayNumber,
    };

    const merged: ChallengeDay = {
      ...current,
      dayNumber: templateDay.dayNumber,
    };

    const media = pickVideoAsset(current.media, templateDay.media);
    if (media) merged.media = media;
    else delete merged.media;

    const farewellMedia = pickVideoAsset(
      current.farewellMedia,
      templateDay.farewellMedia,
    );
    if (farewellMedia) merged.farewellMedia = farewellMedia;
    else delete merged.farewellMedia;

    if (dayHasContent(merged)) {
      daysByNumber.set(templateDay.dayNumber, merged);
    } else {
      daysByNumber.delete(templateDay.dayNumber);
    }
  }

  const weeksByNumber = new Map(
    (existing?.weeks ?? []).map((week) => [week.weekNumber, { ...week }]),
  );

  for (const templateWeek of templateWeeks) {
    const current = weeksByNumber.get(templateWeek.weekNumber) ?? {
      weekNumber: templateWeek.weekNumber,
    };

    const merged: ChallengeWeek = {
      ...current,
      weekNumber: templateWeek.weekNumber,
    };

    const media = pickVideoAsset(current.media, templateWeek.media);
    if (media) merged.media = media;
    else delete merged.media;

    const farewellMedia = pickVideoAsset(
      current.farewellMedia,
      templateWeek.farewellMedia,
    );
    if (farewellMedia) merged.farewellMedia = farewellMedia;
    else delete merged.farewellMedia;

    if (weekHasContent(merged)) {
      weeksByNumber.set(templateWeek.weekNumber, merged);
    } else {
      weeksByNumber.delete(templateWeek.weekNumber);
    }
  }

  const days = [...daysByNumber.values()].sort(
    (a, b) => a.dayNumber - b.dayNumber,
  );
  const weeks = [...weeksByNumber.values()].sort(
    (a, b) => a.weekNumber - b.weekNumber,
  );

  const hasHeader =
    Boolean(existing?.title?.trim()) ||
    Boolean(existing?.subtitle?.trim()) ||
    Boolean(existing?.accentLabel?.trim());

  if (days.length === 0 && weeks.length === 0 && !hasHeader) {
    return undefined;
  }

  return {
    ...(existing?.title ? { title: existing.title } : {}),
    ...(existing?.subtitle ? { subtitle: existing.subtitle } : {}),
    ...(existing?.accentLabel ? { accentLabel: existing.accentLabel } : {}),
    ...(days.length > 0 ? { days } : {}),
    ...(weeks.length > 0 ? { weeks } : {}),
  };
}

function challenge28VideosEqual(
  a: Challenge28 | undefined,
  b: Challenge28 | undefined,
): boolean {
  const daysA = a?.days ?? [];
  const daysB = b?.days ?? [];
  const weeksA = a?.weeks ?? [];
  const weeksB = b?.weeks ?? [];

  if (daysA.length !== daysB.length || weeksA.length !== weeksB.length) {
    return false;
  }

  const daysMapB = new Map(daysB.map((day) => [day.dayNumber, day]));

  for (const dayA of daysA) {
    const dayB = daysMapB.get(dayA.dayNumber);
    if (!dayB) return false;
    if (
      !mediaPayloadEqual(dayA.media, dayB.media) ||
      !mediaPayloadEqual(dayA.farewellMedia, dayB.farewellMedia)
    ) {
      return false;
    }
  }

  const weeksMapB = new Map(weeksB.map((week) => [week.weekNumber, week]));

  for (const weekA of weeksA) {
    const weekB = weeksMapB.get(weekA.weekNumber);
    if (!weekB) return false;
    if (
      !mediaPayloadEqual(weekA.media, weekB.media) ||
      !mediaPayloadEqual(weekA.farewellMedia, weekB.farewellMedia)
    ) {
      return false;
    }
  }

  return true;
}

function templateHasChallengeVideos(challenge28?: Challenge28): boolean {
  return Boolean(
    challenge28?.days?.length || challenge28?.weeks?.length,
  );
}

export async function enrichRutinaChallenge28WithTemplate(
  rutina: RutinaTemplateLink & {
    _id?: Types.ObjectId;
    challenge28?: Challenge28 | null;
  },
  options: { persist?: boolean } = {},
): Promise<Challenge28 | undefined> {
  const templateChallenge28 = await fetchTemplateChallenge28ForRutina(rutina);
  if (!templateHasChallengeVideos(templateChallenge28)) {
    return toPlainChallenge28(rutina.challenge28 as Challenge28 | undefined);
  }

  const existing = toPlainChallenge28(rutina.challenge28 as Challenge28 | undefined);
  const merged = mergeChallenge28DayVideos(existing, templateChallenge28);

  if (
    options.persist &&
    rutina._id &&
    !challenge28VideosEqual(existing, merged)
  ) {
    if (merged) {
      await Rutina.updateOne({ _id: rutina._id }, { $set: { challenge28: merged } });
    } else {
      await Rutina.updateOne(
        { _id: rutina._id },
        { $unset: { challenge28: "" } },
      );
    }
  }

  return merged;
}

export async function mergeRutinaInputChallenge28WithTemplate<
  T extends RutinaTemplateLink & { challenge28?: Challenge28 },
>(data: T, existingChallenge28?: Challenge28 | null): Promise<T> {
  const templateChallenge28 = await fetchTemplateChallenge28ForRutina(data);
  if (!templateHasChallengeVideos(templateChallenge28)) {
    return data;
  }

  const merged = mergeChallenge28DayVideos(
    data.challenge28 ?? existingChallenge28 ?? undefined,
    templateChallenge28,
  );

  if (!merged) {
    const { challenge28: _removed, ...rest } = data;
    return rest as T;
  }

  return { ...data, challenge28: merged };
}

export async function syncTemplateDayVideosToLinkedRutinas(
  planTemplateId: string,
  templateChallenge28: Challenge28 | null | undefined,
): Promise<{ updatedCount: number }> {
  const template = await PlanTemplate.findById(planTemplateId).select("nombre");
  if (!template) {
    return { updatedCount: 0 };
  }

  const templateId = new Types.ObjectId(planTemplateId);
  const nombre = template.nombre?.trim();

  const rutinas = await Rutina.find({
    $or: [
      { planTemplateId: templateId },
      ...(nombre
        ? [{ nombrePlan: nombre }, { "planTemplateSnapshot.nombre": nombre }]
        : []),
    ],
  }).select("_id challenge28 planTemplateId planTemplateSnapshot nombrePlan");

  let updatedCount = 0;

  for (const rutina of rutinas) {
    const existing = toPlainChallenge28(
      rutina.challenge28 as Challenge28 | undefined,
    );
    const merged = mergeChallenge28DayVideos(existing, templateChallenge28);

    if (challenge28VideosEqual(existing, merged)) {
      continue;
    }

    if (merged) {
      await Rutina.updateOne({ _id: rutina._id }, { $set: { challenge28: merged } });
    } else {
      await Rutina.updateOne(
        { _id: rutina._id },
        { $unset: { challenge28: "" } },
      );
    }

    updatedCount += 1;
  }

  return { updatedCount };
}

export async function syncAllTemplateVideosToRutinas(): Promise<{
  templatesProcessed: number;
  rutinasUpdated: number;
}> {
  const templates = await PlanTemplate.find({
    $or: [
      { "blueprint.challenge28.days.0": { $exists: true } },
      { "blueprint.challenge28.weeks.0": { $exists: true } },
    ],
  }).select("_id blueprint.challenge28");

  let rutinasUpdated = 0;

  for (const template of templates) {
    const result = await syncTemplateDayVideosToLinkedRutinas(
      template._id.toString(),
      template.blueprint?.challenge28 as Challenge28 | undefined,
    );
    rutinasUpdated += result.updatedCount;
  }

  return {
    templatesProcessed: templates.length,
    rutinasUpdated,
  };
}
