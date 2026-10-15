import type { FotosProgreso, FotosProgresoSlot } from "@/features/profe/types/medicion";

export const PLIEGUES_FOTOS_SLOT_LABELS: Record<FotosProgresoSlot, string> = {
  frente: "Frente",
  espalda: "Espalda",
  perfilIzquierdo: "Perfil izquierdo",
  perfilDerecho: "Perfil derecho",
};

export const PLIEGUES_FOTOS_SLOT_ORDER: FotosProgresoSlot[] = [
  "frente",
  "espalda",
  "perfilIzquierdo",
  "perfilDerecho",
];

export function countFotosProgreso(fotos?: FotosProgreso): number {
  if (!fotos) return 0;
  return PLIEGUES_FOTOS_SLOT_ORDER.filter((key) => fotos[key]?.url).length;
}
