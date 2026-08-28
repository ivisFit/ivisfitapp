import {
  resolveMetodoCalculo,
  type Medicion,
  type MedicionApiDoc,
} from "@/features/profe/types/medicion";

export function mapMedicionFromApi(doc: MedicionApiDoc): Medicion {
  return {
    id: doc._id,
    alumnaId: doc.alumnaId,
    metodoCalculo: resolveMetodoCalculo(doc.metodoCalculo),
    fecha: new Date(doc.fecha),
    pliegues: doc.pliegues,
    circunferencias: doc.circunferencias,
    metricas: doc.metricas,
    notas: doc.notas,
    pesoCorporalKg: doc.pesoCorporalKg,
  };
}
