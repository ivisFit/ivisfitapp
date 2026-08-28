import type {
  RutinaChallengeDayAsset,
  RutinaDetail,
  RutinaDia,
  RutinaMediaAsset,
  RutinaSemana,
} from "../types/rutina";

const TIME_ZONE = "America/Montevideo";

type DateParts = {
  year: number;
  month: number;
  day: number;
};

function getDatePartsInTimeZone(date: Date, timeZone: string): DateParts {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const lookup = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
  };
}

function toDateKey(parts: DateParts): string {
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  return `${parts.year}-${month}-${day}`;
}

function toDateKeyFromDate(date: Date, timeZone: string): string {
  return toDateKey(getDatePartsInTimeZone(date, timeZone));
}

function toDateKeyFromValue(
  value: string | Date | undefined,
  timeZone: string,
): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return toDateKeyFromDate(parsed, timeZone);
  }

  return toDateKeyFromDate(value, timeZone);
}

function diffDays(startKey: string, endKey: string): number {
  const start = new Date(`${startKey}T00:00:00Z`);
  const end = new Date(`${endKey}T00:00:00Z`);
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function sortWeeks(weeks: RutinaSemana[]): RutinaSemana[] {
  return [...weeks].sort((a, b) => a.numeroSemana - b.numeroSemana);
}

export type RutinaDay = {
  semana: RutinaSemana;
  dia: RutinaDia;
  numeroSemana: number;
  nombreDia: string;
  ejercicios: RutinaDia["ejercicios"];
  startDateKey: string;
  todayKey: string;
  dayIndex: number;
  weekIndex: number;
};

export type ChallengeDayState = "completed" | "unlocked" | "locked";

export type ChallengeDay = {
  dayNumber: number;
  dateKey: string;
  title: string;
  tags: string[];
  state: ChallengeDayState;
  isToday: boolean;
  nombreDia?: string;
  numeroSemana?: number;
  ejercicios: RutinaDia["ejercicios"];
  media?: RutinaMediaAsset;
  thumbnail?: RutinaMediaAsset;
  farewellMedia?: RutinaMediaAsset;
  weekIntroMedia?: RutinaMediaAsset;
  weekFarewellMedia?: RutinaMediaAsset;
};

export type DayStoryStepKind =
  | "weekIntro"
  | "dayIntro"
  | "exercise"
  | "dayOutro"
  | "weekOutro";

export type DayStoryStep =
  | { kind: "weekIntro"; media: RutinaMediaAsset }
  | { kind: "dayIntro"; media: RutinaMediaAsset }
  | { kind: "exercise"; index: number; ejercicio: RutinaDia["ejercicios"][number] }
  | { kind: "dayOutro"; media: RutinaMediaAsset }
  | { kind: "weekOutro"; media: RutinaMediaAsset };

/** Vista previa del laboratorio: todos los días clicables. */
export function unlockAllPlanDays(days: ChallengeDay[]): ChallengeDay[] {
  return days.map((day) => ({
    ...day,
    state: "unlocked",
  }));
}

export function resolveRutinaDay(
  rutina: RutinaDetail,
  now: Date = new Date(),
  timeZone: string = TIME_ZONE,
): RutinaDay | null {
  const startKey =
    toDateKeyFromValue(rutina.startDate, timeZone) ||
    toDateKeyFromValue(rutina.createdAt, timeZone) ||
    toDateKeyFromDate(now, timeZone);
  const todayKey = toDateKeyFromDate(now, timeZone);

  let daysSince = diffDays(startKey, todayKey);
  if (daysSince < 0) daysSince = 0;

  const weeks = sortWeeks(rutina.semanas ?? []);
  if (weeks.length === 0) return null;

  const weekIndex = Math.min(Math.floor(daysSince / 7), weeks.length - 1);
  const week = weeks[weekIndex];
  if (!week || week.dias.length === 0) return null;

  const dayIndex = Math.min(daysSince % 7, week.dias.length - 1);
  const dia = week.dias[dayIndex];

  return {
    semana: week,
    dia,
    numeroSemana: week.numeroSemana,
    nombreDia: dia.nombreDia,
    ejercicios: dia.ejercicios,
    startDateKey: startKey,
    todayKey,
    dayIndex,
    weekIndex,
  };
}

function addDaysToDateKey(dateKey: string, daysToAdd: number): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + daysToAdd);
  return date.toISOString().slice(0, 10);
}

/** Offset calendario: semana * 7 + slot dentro de la semana de entrenamiento. */
export function getCalendarOffsetForPlanDayIndex(
  rutina: RutinaDetail,
  planIndex: number,
): number {
  const weeks = sortWeeks(rutina.semanas ?? []);
  const flatDays = getFlatRoutineDays(rutina);
  if (weeks.length === 0) return planIndex;

  if (planIndex >= 0 && planIndex < flatDays.length) {
    const entry = flatDays[planIndex];
    const weekIndex = weeks.findIndex(
      (week) => week.numeroSemana === entry.numeroSemana,
    );
    if (weekIndex >= 0) {
      const dayIndexInWeek = weeks[weekIndex].dias.findIndex(
        (day) => day.nombreDia === entry.dia.nombreDia,
      );
      if (dayIndexInWeek >= 0) {
        return weekIndex * 7 + dayIndexInWeek;
      }
    }
  }

  let remaining = planIndex;
  let calendarWeekIndex = 0;
  const maxWeeks = Math.max(planIndex + 1, weeks.length);

  while (remaining >= 0 && calendarWeekIndex < maxWeeks) {
    const week = weeks[calendarWeekIndex % weeks.length];
    const daysInWeek = week.dias.length;
    if (daysInWeek === 0) {
      calendarWeekIndex += 1;
      continue;
    }
    if (remaining < daysInWeek) {
      return calendarWeekIndex * 7 + remaining;
    }
    remaining -= daysInWeek;
    calendarWeekIndex += 1;
  }

  return planIndex;
}

export function getRoutineDayCalendarOffset(
  rutina: RutinaDetail,
  flatIndex: number,
): number {
  return getCalendarOffsetForPlanDayIndex(rutina, flatIndex);
}

export function getDateKeyForPlanDayIndex(
  rutina: RutinaDetail,
  startDateKey: string,
  planIndex: number,
): string {
  return addDaysToDateKey(
    startDateKey,
    getCalendarOffsetForPlanDayIndex(rutina, planIndex),
  );
}

export function getDateKeyForFlatRoutineDay(
  rutina: RutinaDetail,
  startDateKey: string,
  flatIndex: number,
): string {
  return getDateKeyForPlanDayIndex(rutina, startDateKey, flatIndex);
}

export function getCurrentPlanDayNumber(
  rutina: RutinaDetail,
  startDateKey: string,
  todayKey: string,
): number {
  const flatDays = getFlatRoutineDays(rutina);
  const totalDays = flatDays.length;
  if (totalDays === 0) return 1;

  let daysSince = diffDays(startDateKey, todayKey);
  if (daysSince < 0) daysSince = 0;

  const weeks = sortWeeks(rutina.semanas ?? []);
  if (weeks.length === 0) return 1;

  const calendarWeekIndex = Math.min(
    Math.floor(daysSince / 7),
    weeks.length - 1,
  );

  let dayNumber = 0;
  for (let w = 0; w < calendarWeekIndex; w++) {
    dayNumber += weeks[w]?.dias.length ?? 0;
  }

  const currentWeek = weeks[calendarWeekIndex];
  if (currentWeek && currentWeek.dias.length > 0) {
    const daySlot = Math.min(daysSince % 7, currentWeek.dias.length - 1);
    dayNumber += daySlot + 1;
  }

  return Math.min(totalDays, Math.max(1, dayNumber));
}

export function getFlatRoutineDays(rutina: RutinaDetail): {
  dia: RutinaDia;
  numeroSemana: number;
}[] {
  return sortWeeks(rutina.semanas ?? []).flatMap((semana) =>
    semana.dias.map((dia) => ({
      dia,
      numeroSemana: semana.numeroSemana,
    })),
  );
}

export function resolveDayInfoForPlanDayNumber(
  rutina: RutinaDetail,
  dayNumber: number,
): RutinaDay | null {
  const weeks = sortWeeks(rutina.semanas ?? []);
  const flatDays = getFlatRoutineDays(rutina);
  const entry = flatDays[dayNumber - 1];
  if (!entry) return null;

  const weekIndex = weeks.findIndex(
    (week) => week.numeroSemana === entry.numeroSemana,
  );
  const week = weekIndex >= 0 ? weeks[weekIndex] : weeks[0];
  if (!week) return null;

  const dayIndex = week.dias.findIndex(
    (dia) => dia.nombreDia === entry.dia.nombreDia,
  );

  return {
    semana: week,
    dia: entry.dia,
    numeroSemana: entry.numeroSemana,
    nombreDia: entry.dia.nombreDia,
    ejercicios: entry.dia.ejercicios,
    startDateKey: "",
    todayKey: "",
    dayIndex: dayIndex >= 0 ? dayIndex : 0,
    weekIndex: weekIndex >= 0 ? weekIndex : 0,
  };
}

export function isCurrentRoutineDay(
  dayInfo: RutinaDay,
  numeroSemana: number,
  nombreDia: string,
): boolean {
  return (
    dayInfo.numeroSemana === numeroSemana && dayInfo.nombreDia === nombreDia
  );
}

function getRoutineDayForChallenge(
  flatDays: ReturnType<typeof getFlatRoutineDays>,
  dayNumber: number,
) {
  if (flatDays.length === 0) return null;
  return flatDays[dayNumber - 1] ?? flatDays[(dayNumber - 1) % flatDays.length];
}

function getFirstRoutineMedia(dia?: RutinaDia): RutinaMediaAsset | undefined {
  return dia?.ejercicios.find((ejercicio) => ejercicio.media)?.media;
}

export function hasCustomPlanContent(rutina: RutinaDetail): boolean {
  const challenge = rutina.challenge28;
  return (
    Boolean(challenge?.days?.length) ||
    Boolean(challenge?.weeks?.length) ||
    Boolean(challenge?.title?.trim()) ||
    Boolean(challenge?.subtitle?.trim()) ||
    Boolean(challenge?.accentLabel?.trim())
  );
}

function getConfiguredChallengeDay(
  rutina: RutinaDetail,
  dayInfo: RutinaDay,
): RutinaChallengeDayAsset | undefined {
  const flatDays = getFlatRoutineDays(rutina);
  if (flatDays.length === 0) return undefined;

  const planIndex = flatDays.findIndex(
    (entry) =>
      entry.numeroSemana === dayInfo.numeroSemana &&
      entry.dia.nombreDia === dayInfo.nombreDia,
  );
  const dayNumber = planIndex >= 0 ? planIndex + 1 : 1;

  return rutina.challenge28?.days?.find((day) => day.dayNumber === dayNumber);
}

export function resolveDayIntroMedia(
  rutina: RutinaDetail,
  dayInfo: RutinaDay,
): RutinaMediaAsset | undefined {
  return getConfiguredChallengeDay(rutina, dayInfo)?.media;
}

export function resolveDayFarewellMedia(
  rutina: RutinaDetail,
  dayInfo: RutinaDay,
): RutinaMediaAsset | undefined {
  return getConfiguredChallengeDay(rutina, dayInfo)?.farewellMedia;
}

export function isFirstTrainingDayOfWeek(dayInfo: RutinaDay): boolean {
  return dayInfo.dayIndex === 0;
}

export function isLastTrainingDayOfWeek(dayInfo: RutinaDay): boolean {
  return (
    dayInfo.semana.dias.length > 0 &&
    dayInfo.dayIndex === dayInfo.semana.dias.length - 1
  );
}

function getConfiguredChallengeWeek(
  rutina: RutinaDetail,
  weekNumber: number,
) {
  return rutina.challenge28?.weeks?.find(
    (week) => week.weekNumber === weekNumber,
  );
}

export function resolveWeekIntroMedia(
  rutina: RutinaDetail,
  dayInfo: RutinaDay,
): RutinaMediaAsset | undefined {
  if (!isFirstTrainingDayOfWeek(dayInfo)) return undefined;
  return getConfiguredChallengeWeek(rutina, dayInfo.numeroSemana)?.media;
}

export function resolveWeekFarewellMedia(
  rutina: RutinaDetail,
  dayInfo: RutinaDay,
): RutinaMediaAsset | undefined {
  if (!isLastTrainingDayOfWeek(dayInfo)) return undefined;
  return getConfiguredChallengeWeek(rutina, dayInfo.numeroSemana)?.farewellMedia;
}

export function buildDayStorySequence(
  rutina: RutinaDetail,
  dayInfo: RutinaDay,
): DayStoryStep[] {
  const steps: DayStoryStep[] = [];
  const weekIntro = resolveWeekIntroMedia(rutina, dayInfo);
  if (weekIntro) {
    steps.push({ kind: "weekIntro", media: weekIntro });
  }

  const dayIntro = resolveDayIntroMedia(rutina, dayInfo);
  if (dayIntro) {
    steps.push({ kind: "dayIntro", media: dayIntro });
  }

  dayInfo.ejercicios.forEach((ejercicio, index) => {
    steps.push({ kind: "exercise", index, ejercicio });
  });

  const dayOutro = resolveDayFarewellMedia(rutina, dayInfo);
  if (dayOutro) {
    steps.push({ kind: "dayOutro", media: dayOutro });
  }

  const weekOutro = resolveWeekFarewellMedia(rutina, dayInfo);
  if (weekOutro) {
    steps.push({ kind: "weekOutro", media: weekOutro });
  }

  return steps;
}

function attachStoryMedia(
  rutina: RutinaDetail,
  dayNumber: number,
  day: ChallengeDay,
): ChallengeDay {
  const dayInfo = resolveDayInfoForPlanDayNumber(rutina, dayNumber);
  if (!dayInfo) return day;

  return {
    ...day,
    farewellMedia: resolveDayFarewellMedia(rutina, dayInfo),
    weekIntroMedia: resolveWeekIntroMedia(rutina, dayInfo),
    weekFarewellMedia: resolveWeekFarewellMedia(rutina, dayInfo),
  };
}

function buildFallbackTags(dia: RutinaDia | undefined): string[] {
  if (!dia) return ["energía", "constancia"];
  const exerciseCount = dia.ejercicios.length;
  return [
    `${exerciseCount} ${exerciseCount === 1 ? "ejercicio" : "ejercicios"}`,
    "rutina del día",
  ];
}

function buildDayTags(
  dia: RutinaDia | undefined,
  configuredTags?: string[],
): string[] {
  const fallback = buildFallbackTags(dia);
  const extra = (configuredTags ?? []).filter(
    (tag) => !/\d+\s+ejercicios?/i.test(tag),
  );
  return extra.length > 0 ? [...fallback, ...extra] : fallback;
}

export function buildPlanDays(
  rutina: RutinaDetail,
  dayInfo: RutinaDay | null,
): ChallengeDay[] {
  const flatDays = getFlatRoutineDays(rutina);
  if (flatDays.length === 0) return [];

  const startDateKey =
    dayInfo?.startDateKey ??
    toDateKeyFromValue(rutina.startDate, TIME_ZONE) ??
    toDateKeyFromValue(rutina.createdAt, TIME_ZONE) ??
    toDateKeyFromDate(new Date(), TIME_ZONE);
  const todayKey = dayInfo?.todayKey ?? toDateKeyFromDate(new Date(), TIME_ZONE);
  const totalDays = flatDays.length;
  const currentDayNumber = getCurrentPlanDayNumber(
    rutina,
    startDateKey,
    todayKey,
  );

  return flatDays.map((routineDay, index) => {
    const dayNumber = index + 1;
    const dateKey = getDateKeyForPlanDayIndex(rutina, startDateKey, index);
    const media = getFirstRoutineMedia(routineDay.dia);
    const state: ChallengeDayState =
      dayNumber < currentDayNumber
        ? "completed"
        : dayNumber === currentDayNumber
          ? "unlocked"
          : "locked";

    return attachStoryMedia(rutina, dayNumber, {
      dayNumber,
      dateKey,
      title: routineDay.dia.nombreDia,
      tags: buildDayTags(routineDay.dia),
      state,
      isToday: dayNumber === currentDayNumber,
      nombreDia: routineDay.dia.nombreDia,
      numeroSemana: routineDay.numeroSemana,
      ejercicios: routineDay.dia.ejercicios,
      media,
      thumbnail: media,
    });
  });
}

/** @deprecated Usar `buildPlanDays` — mantenido por compatibilidad. */
export function buildChallenge28Days(
  rutina: RutinaDetail,
  dayInfo: RutinaDay | null,
  totalDays = 28,
): ChallengeDay[] {
  const flatDays = getFlatRoutineDays(rutina);
  const startDateKey =
    dayInfo?.startDateKey ??
    toDateKeyFromValue(rutina.startDate, TIME_ZONE) ??
    toDateKeyFromValue(rutina.createdAt, TIME_ZONE) ??
    toDateKeyFromDate(new Date(), TIME_ZONE);
  const todayKey = dayInfo?.todayKey ?? toDateKeyFromDate(new Date(), TIME_ZONE);
  const currentDayNumber = Math.min(
    totalDays,
    getCurrentPlanDayNumber(rutina, startDateKey, todayKey),
  );

  return Array.from({ length: totalDays }, (_, index) => {
    const dayNumber = index + 1;
    const configuredDay = rutina.challenge28?.days?.find(
      (day) => day.dayNumber === dayNumber,
    );
    const routineDay = getRoutineDayForChallenge(flatDays, dayNumber);
    const dateKey = getDateKeyForPlanDayIndex(rutina, startDateKey, index);
    const media = configuredDay?.media ?? getFirstRoutineMedia(routineDay?.dia);
    const state: ChallengeDayState =
      dayNumber < currentDayNumber
        ? "completed"
        : dayNumber === currentDayNumber
          ? "unlocked"
          : "locked";

    return attachStoryMedia(rutina, dayNumber, {
      dayNumber,
      dateKey,
      title:
        configuredDay?.title ??
        routineDay?.dia.nombreDia ??
        `Día ${dayNumber}`,
      tags: buildDayTags(routineDay?.dia, configuredDay?.tags),
      state,
      isToday: dayNumber === currentDayNumber,
      nombreDia: routineDay?.dia.nombreDia,
      numeroSemana: routineDay?.numeroSemana,
      ejercicios: routineDay?.dia.ejercicios ?? [],
      media,
      thumbnail: configuredDay?.thumbnail ?? media,
    });
  });
}

export function formatTodayLabel(
  now: Date = new Date(),
  timeZone: string = TIME_ZONE,
): string {
  return new Intl.DateTimeFormat("es-UY", {
    timeZone,
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  }).format(now);
}

export function formatDescanso(segundos: number): string {
  if (segundos < 60) return `${segundos}s`;
  const minutos = Math.round(segundos / 60);
  return `${minutos} min`;
}

export function formatTimerSeconds(segundos: number): string {
  const safeSeconds = Math.max(0, Math.floor(segundos));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function getYoutubeEmbedUrl(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl);
    const hostname = url.hostname.replace(/^www\./, "");
    let videoId = "";

    if (hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? "";
    }

    if (hostname === "youtube.com" || hostname.endsWith(".youtube.com")) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v") ?? "";
      } else {
        const [kind, id] = url.pathname.split("/").filter(Boolean);
        if (kind === "embed" || kind === "shorts" || kind === "live") {
          videoId = id ?? "";
        }
      }
    }

    if (!videoId) return null;
    return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`;
  } catch {
    return null;
  }
}
