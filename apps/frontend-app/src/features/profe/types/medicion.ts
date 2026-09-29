export type Sexo = "hombre" | "mujer";

export type MetodoCalculo = "jp3" | "jp7" | "us-navy";

export type PlieguesJP3 = {
  tricipital?: number;
  suprailiaco?: number;
  pectoral?: number;
  abdominal?: number;
  muslo?: number;
};

export type PlieguesJP7 = {
  biceps?: number;
  tricipital?: number;
  subescapular?: number;
  supraespinal?: number;
  abdominal?: number;
  cuadricipital?: number;
  peroneal?: number;
};

/** Valores guardados en Mongo (JP3, JP7 y claves legacy). */
export type PlieguesMedicion = PlieguesJP3 &
  PlieguesJP7 & {
    axilarMedia?: number;
  };

export type Circunferencias = {
  cuelloCm?: number;
  cinturaCm?: number;
  caderaCm?: number;
};

export type CreateMedicionPayload = {
  alumnaId?: string;
  metodoCalculo: MetodoCalculo;
  pliegues?: PlieguesMedicion;
  circunferencias?: Circunferencias;
  fecha?: string;
  notas?: string;
  pesoCorporalKg?: number;
};

export type MedicionMetricas = {
  porcentajeGrasaCorporal: number | null;
  masaMagra: number | null;
};

export type MedicionApiDoc = {
  _id: string;
  alumnaId: string;
  metodoCalculo?: MetodoCalculo | string;
  fecha: string;
  pliegues?: PlieguesMedicion;
  circunferencias?: Circunferencias;
  metricas: MedicionMetricas;
  notas?: string;
  pesoCorporalKg?: number;
  createdAt: string;
  updatedAt: string;
};

export type Medicion = {
  id: string;
  alumnaId: string;
  metodoCalculo: MetodoCalculo;
  fecha: Date;
  pliegues?: PlieguesMedicion;
  circunferencias?: Circunferencias;
  metricas: MedicionMetricas;
  notas?: string;
  pesoCorporalKg?: number;
};

export function resolveMetodoCalculo(
  metodo?: MetodoCalculo | string | null,
): MetodoCalculo {
  if (metodo === "jp7" || metodo === "us-navy") {
    return metodo;
  }
  return "jp3";
}
