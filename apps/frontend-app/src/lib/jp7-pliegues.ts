import type { PlieguesJP7 } from "@/features/profe/types/medicion";

export type PliegueJP7Key =
  | "biceps"
  | "tricipital"
  | "subescapular"
  | "supraespinal"
  | "abdominal"
  | "cuadricipital"
  | "peroneal";

/** Sitios JP7 en orden de UI (mm). Espejo cliente de @ivisfit/database (sin Mongoose). */
export const JP7_PLIEGUE_SITES: ReadonlyArray<{
  key: PliegueJP7Key;
  label: string;
}> = [
  { key: "biceps", label: "Bíceps" },
  { key: "tricipital", label: "Tríceps" },
  { key: "subescapular", label: "Subescapular" },
  { key: "supraespinal", label: "Supraespinal" },
  { key: "abdominal", label: "Abdominal" },
  { key: "cuadricipital", label: "Cuadricipital" },
  { key: "peroneal", label: "Peroneal" },
];

export const JP7_FIELDS = JP7_PLIEGUE_SITES.map((site) => site.key);

type PlieguesJP7Legacy = {
  pectoral?: number;
  axilarMedia?: number;
  tricipital?: number;
  subescapular?: number;
  abdominal?: number;
  suprailiaco?: number;
  muslo?: number;
};

function hasLegacyJP7Keys(pliegues: PlieguesJP7 & PlieguesJP7Legacy): boolean {
  const hasNewSite =
    pliegues.biceps !== undefined ||
    pliegues.supraespinal !== undefined ||
    pliegues.cuadricipital !== undefined ||
    pliegues.peroneal !== undefined;
  if (hasNewSite) {
    return false;
  }

  return (
    pliegues.axilarMedia !== undefined ||
    (pliegues.pectoral !== undefined &&
      pliegues.suprailiaco !== undefined &&
      pliegues.subescapular !== undefined)
  );
}

export function normalizePlieguesJP7(
  pliegues: PlieguesJP7 & PlieguesJP7Legacy,
): PlieguesJP7 {
  if (!hasLegacyJP7Keys(pliegues)) {
    return pliegues;
  }

  return {
    biceps: pliegues.biceps ?? pliegues.pectoral,
    tricipital: pliegues.tricipital,
    subescapular: pliegues.subescapular,
    supraespinal: pliegues.supraespinal ?? pliegues.axilarMedia,
    abdominal: pliegues.abdominal,
    cuadricipital: pliegues.cuadricipital ?? pliegues.muslo,
    peroneal: pliegues.peroneal ?? pliegues.suprailiaco,
  };
}
