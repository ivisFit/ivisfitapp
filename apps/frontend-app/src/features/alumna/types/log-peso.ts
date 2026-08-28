export type LogPesoRecord = {
  id: string;
  ejercicioId: string;
  semana: number;
  dia: string;
  pesosPorSerie: number[];
  fecha?: string;
};

export type UpsertLogPesoPayload = {
  rutinaId: string;
  ejercicioId: string;
  semana: number;
  dia: string;
  pesosPorSerie: number[];
};

export type LogPesoApiDoc = {
  _id?: string;
  id?: string;
  ejercicioId?:
    | string
    | { _id?: string; id?: string; nombre?: string };
  semana: number;
  dia: string;
  pesosPorSerie: number[];
  fecha?: string;
};

export type LogPesoRecordWithNombre = LogPesoRecord & {
  ejercicioNombre?: string;
};

export function mapLogPesoRecord(doc: LogPesoApiDoc): LogPesoRecord {
  const ejercicioRef = doc.ejercicioId;
  const ejercicioId =
    typeof ejercicioRef === "string"
      ? ejercicioRef
      : (ejercicioRef?._id ?? ejercicioRef?.id ?? "");

  return {
    id: doc._id ?? doc.id ?? "",
    ejercicioId,
    semana: doc.semana,
    dia: doc.dia,
    pesosPorSerie: doc.pesosPorSerie,
    fecha: doc.fecha,
  };
}

export function mapLogPesoRecordWithNombre(
  doc: LogPesoApiDoc,
): LogPesoRecordWithNombre {
  const base = mapLogPesoRecord(doc);
  const ejercicioRef = doc.ejercicioId;
  const ejercicioNombre =
    typeof ejercicioRef === "object" && ejercicioRef !== null
      ? ejercicioRef.nombre
      : undefined;

  return {
    ...base,
    ejercicioNombre,
  };
}

export function buildLogsByEjercicioId(
  logs: LogPesoRecord[],
): Record<string, number[]> {
  return logs.reduce<Record<string, number[]>>((acc, log) => {
    if (log.ejercicioId && !acc[log.ejercicioId]) {
      acc[log.ejercicioId] = log.pesosPorSerie;
    }
    return acc;
  }, {});
}
