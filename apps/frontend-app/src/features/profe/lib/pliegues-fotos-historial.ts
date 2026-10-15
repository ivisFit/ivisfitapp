import { countFotosProgreso } from "@/features/profe/components/pliegues/pliegues-fotos-slots";
import type { Medicion } from "@/features/profe/types/medicion";
import {
  filterMedicionesByPeriod,
  type PlieguesPeriod,
} from "@/features/profe/utils/pliegues-period";

export function getMedicionesConFotosProgreso(
  mediciones: Medicion[],
  period: PlieguesPeriod,
  referenceDate = new Date(),
): Medicion[] {
  return filterMedicionesByPeriod(mediciones, period, referenceDate).filter(
    (medicion) => countFotosProgreso(medicion.fotosProgreso) > 0,
  );
}

export function countMedicionesConFotosProgreso(mediciones: Medicion[]): number {
  return mediciones.filter(
    (medicion) => countFotosProgreso(medicion.fotosProgreso) > 0,
  ).length;
}
