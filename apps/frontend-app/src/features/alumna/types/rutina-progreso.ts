export type RutinaProgresoRecord = {
  id: string;
  rutinaId: string;
  dateKey: string;
  numeroSemana: number;
  nombreDia: string;
  ejerciciosCompletados: string[];
  diaCompletado: boolean;
  fechaCompletado?: string;
  updatedAt?: string;
};

export type UpsertRutinaProgresoPayload = {
  rutinaId: string;
  dateKey: string;
  numeroSemana: number;
  nombreDia: string;
  ejerciciosCompletados: string[];
  diaCompletado: boolean;
};

export type RutinaProgresoApiDoc = {
  _id?: string;
  id?: string;
  rutinaId?: string;
  dateKey: string;
  numeroSemana: number;
  nombreDia: string;
  ejerciciosCompletados?: string[];
  diaCompletado?: boolean;
  fechaCompletado?: string;
  updatedAt?: string | Date;
};

export function mapRutinaProgresoRecord(
  doc: RutinaProgresoApiDoc,
): RutinaProgresoRecord {
  return {
    id: doc._id ?? doc.id ?? "",
    rutinaId: typeof doc.rutinaId === "string" ? doc.rutinaId : "",
    dateKey: doc.dateKey,
    numeroSemana: doc.numeroSemana,
    nombreDia: doc.nombreDia,
    ejerciciosCompletados: doc.ejerciciosCompletados ?? [],
    diaCompletado: doc.diaCompletado ?? false,
    fechaCompletado: doc.fechaCompletado,
    updatedAt:
      doc.updatedAt instanceof Date
        ? doc.updatedAt.toISOString()
        : doc.updatedAt,
  };
}

export function buildProgresoByDateKey(
  records: RutinaProgresoRecord[],
): Record<string, RutinaProgresoRecord> {
  return records.reduce<Record<string, RutinaProgresoRecord>>((acc, record) => {
    acc[record.dateKey] = record;
    return acc;
  }, {});
}
