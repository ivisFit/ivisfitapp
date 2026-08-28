import { CheckinAlimentacion, type UpsertCheckinAlimentacionInput } from "@ivisfit/database";

const TIME_ZONE = "America/Montevideo";

export function getTodayDateKey(timeZone = TIME_ZONE): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const lookup = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
}

function dateKeyDaysAgo(days: number): string {
  const hoy = new Date(`${getTodayDateKey()}T12:00:00`);
  hoy.setDate(hoy.getDate() - days);
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, "0");
  const d = String(hoy.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const checkinsAlimentacionService = {
  async getHoy(alumnaId: string) {
    return CheckinAlimentacion.findOne({
      alumnaId,
      dateKey: getTodayDateKey(),
    });
  },

  async list(alumnaId: string, from?: string, to?: string) {
    const fromKey = from ?? dateKeyDaysAgo(6);
    const toKey = to ?? getTodayDateKey();
    return CheckinAlimentacion.find({
      alumnaId,
      dateKey: { $gte: fromKey, $lte: toKey },
    }).sort({ dateKey: -1 });
  },

  async upsert(alumnaId: string, data: UpsertCheckinAlimentacionInput) {
    const dateKey = data.dateKey ?? getTodayDateKey();
    return CheckinAlimentacion.findOneAndUpdate(
      { alumnaId, dateKey },
      { $set: { estado: data.estado } },
      { upsert: true, new: true, runValidators: true },
    );
  },
};
