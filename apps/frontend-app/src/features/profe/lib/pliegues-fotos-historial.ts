import {
  countFotosProgreso,
  PLIEGUES_FOTOS_SLOT_ORDER,
} from "@/features/profe/components/pliegues/pliegues-fotos-slots";
import type {
  FotosProgreso,
  FotosProgresoSlot,
  Medicion,
  MedicionImagen,
} from "@/features/profe/types/medicion";
import {
  filterMedicionesByPeriod,
  formatMedicionDate,
  type PlieguesPeriod,
} from "@/features/profe/utils/pliegues-period";

export type FotosAgrupacion = "mes" | "medicion";

export type FotoComparacionImagen = MedicionImagen & {
  fecha: Date;
};

export type FotoComparacionColumna = {
  id: string;
  fecha: Date;
  titulo: string;
  detalle?: string;
  pesoCorporalKg?: number;
  porcentajeGrasaCorporal: number | null;
  fotos: Partial<Record<FotosProgresoSlot, FotoComparacionImagen>>;
};

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

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMesCorto(date: Date) {
  return date
    .toLocaleDateString("es-UY", { month: "short" })
    .replace(/\./g, "")
    .trim();
}

export function formatMesComparacion(date: Date) {
  const label = `${formatMesCorto(date)} ${date.getFullYear()}`;
  return label.charAt(0).toLocaleUpperCase("es-UY") + label.slice(1);
}

function formatDiaMes(date: Date) {
  return `${date.getDate()} ${formatMesCorto(date).toLocaleLowerCase("es-UY")}`;
}

function fotosDeMedicion(
  medicion: Medicion,
): Partial<Record<FotosProgresoSlot, FotoComparacionImagen>> {
  const fotos: Partial<Record<FotosProgresoSlot, FotoComparacionImagen>> = {};
  for (const slot of PLIEGUES_FOTOS_SLOT_ORDER) {
    const imagen = medicion.fotosProgreso?.[slot];
    if (imagen?.url) {
      fotos[slot] = { ...imagen, fecha: medicion.fecha };
    }
  }
  return fotos;
}

function columnaDesdeMedicion(medicion: Medicion): FotoComparacionColumna {
  return {
    id: medicion.id,
    fecha: medicion.fecha,
    titulo: formatMedicionDate(medicion.fecha),
    pesoCorporalKg: medicion.pesoCorporalKg,
    porcentajeGrasaCorporal: medicion.metricas.porcentajeGrasaCorporal,
    fotos: fotosDeMedicion(medicion),
  };
}

/**
 * Una columna por mes. Si hubo varias mediciones, cada ángulo conserva
 * la foto más reciente de ese mes.
 */
export function columnasPorMes(mediciones: Medicion[]): FotoComparacionColumna[] {
  const groups = new Map<string, Medicion[]>();

  for (const medicion of mediciones) {
    if (countFotosProgreso(medicion.fotosProgreso) === 0) continue;
    const key = monthKey(medicion.fecha);
    const list = groups.get(key);
    if (list) list.push(medicion);
    else groups.set(key, [medicion]);
  }

  const columnas: FotoComparacionColumna[] = [];

  for (const [key, list] of groups) {
    const sorted = [...list].sort(
      (a, b) => a.fecha.getTime() - b.fecha.getTime(),
    );
    const fotos: FotosProgreso = {};
    const fechas: Partial<Record<FotosProgresoSlot, Date>> = {};

    for (const medicion of sorted) {
      for (const slot of PLIEGUES_FOTOS_SLOT_ORDER) {
        const imagen = medicion.fotosProgreso?.[slot];
        if (!imagen?.url) continue;
        fotos[slot] = imagen;
        fechas[slot] = medicion.fecha;
      }
    }

    const latest = sorted[sorted.length - 1];
    const fotosConFecha: FotoComparacionColumna["fotos"] = {};
    for (const slot of PLIEGUES_FOTOS_SLOT_ORDER) {
      const imagen = fotos[slot];
      const fecha = fechas[slot];
      if (imagen?.url && fecha) {
        fotosConFecha[slot] = { ...imagen, fecha };
      }
    }

    columnas.push({
      id: key,
      fecha: latest.fecha,
      titulo: formatMesComparacion(latest.fecha),
      detalle:
        sorted.length > 1
          ? `${sorted.length} mediciones`
          : formatDiaMes(latest.fecha),
      pesoCorporalKg: latest.pesoCorporalKg,
      porcentajeGrasaCorporal: latest.metricas.porcentajeGrasaCorporal,
      fotos: fotosConFecha,
    });
  }

  return columnas.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
}

export function columnasPorMedicion(
  mediciones: Medicion[],
): FotoComparacionColumna[] {
  return mediciones
    .filter((medicion) => countFotosProgreso(medicion.fotosProgreso) > 0)
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
    .map(columnaDesdeMedicion);
}

export function columnasFotosComparacion(
  mediciones: Medicion[],
  agrupacion: FotosAgrupacion,
): FotoComparacionColumna[] {
  return agrupacion === "mes"
    ? columnasPorMes(mediciones)
    : columnasPorMedicion(mediciones);
}
