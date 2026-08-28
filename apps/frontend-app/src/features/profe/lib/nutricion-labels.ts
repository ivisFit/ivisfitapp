import type { EvaluacionNutricionalApiDoc } from "@/features/alumna/types/evaluacion-nutricional";
import {
  NIVEL_ACTIVIDAD_OPTIONS,
  OBJETIVO_OPTIONS,
  OCUPACION_OPTIONS,
  PREFERENCIA_OPTIONS,
  RESTRICCION_OPTIONS,
  HORARIO_OPTIONS,
} from "@/features/alumna/lib/nutricion-wizard";

function labelFromOptions<T extends string>(
  value: T | undefined,
  options: { value: T; label: string }[],
) {
  if (!value) return "Sin dato";
  return options.find((option) => option.value === value)?.label ?? value;
}

function labelsFromOptions<T extends string>(
  values: T[] | undefined,
  options: { value: T; label: string }[],
) {
  if (!values?.length) return "Ninguna";
  return values
    .map((value) => labelFromOptions(value, options))
    .join(", ");
}

export type EvaluacionResumenField = { label: string; value: string };

export type EvaluacionResumenGroup = {
  title: string;
  fields: EvaluacionResumenField[];
};

export function formatEvaluacionResumen(
  evaluacion: EvaluacionNutricionalApiDoc,
): EvaluacionResumenField[] {
  return [
    { label: "Edad", value: `${evaluacion.edad} años` },
    { label: "Sexo", value: evaluacion.sexo === "mujer" ? "Mujer" : "Hombre" },
    { label: "Estatura", value: `${evaluacion.estaturaCm} cm` },
    { label: "Peso actual", value: `${evaluacion.pesoActualKg} kg` },
    { label: "Peso objetivo", value: `${evaluacion.pesoObjetivoKg} kg` },
    {
      label: "Fecha objetivo",
      value: new Date(evaluacion.fechaObjetivo).toLocaleDateString("es-UY"),
    },
    {
      label: "Nivel de actividad",
      value: labelFromOptions(evaluacion.nivelActividad, NIVEL_ACTIVIDAD_OPTIONS),
    },
    {
      label: "Ocupación",
      value: labelFromOptions(evaluacion.ocupacion, OCUPACION_OPTIONS),
    },
    {
      label: "Objetivo",
      value: labelFromOptions(evaluacion.objetivo, OBJETIVO_OPTIONS),
    },
    {
      label: "Preferencias",
      value: labelsFromOptions(
        evaluacion.preferenciasAlimentarias,
        PREFERENCIA_OPTIONS,
      ),
    },
    {
      label: "Restricciones",
      value: labelsFromOptions(evaluacion.restricciones, RESTRICCION_OPTIONS),
    },
    {
      label: "Alergias",
      value: evaluacion.alergias?.length
        ? evaluacion.alergias.join(", ")
        : "Ninguna",
    },
    {
      label: "Alimentos favoritos",
      value: evaluacion.alimentosFavoritos?.length
        ? evaluacion.alimentosFavoritos.join(", ")
        : "Sin datos",
    },
    {
      label: "Alimentos evitados",
      value: evaluacion.alimentosEvitados?.length
        ? evaluacion.alimentosEvitados.join(", ")
        : "Ninguno",
    },
    {
      label: "Horarios disponibles",
      value: labelsFromOptions(evaluacion.horariosDisponibles, HORARIO_OPTIONS),
    },
    {
      label: "Comidas por día",
      value: String(evaluacion.cantidadComidas),
    },
    {
      label: "Tiempo de cocina",
      value: `${evaluacion.tiempoCocinaMinutos} min`,
    },
  ];
}

const EVALUACION_GROUP_LABELS: { title: string; labels: string[] }[] = [
  { title: "Perfil", labels: ["Edad", "Sexo", "Estatura", "Peso actual"] },
  {
    title: "Objetivo",
    labels: [
      "Peso objetivo",
      "Fecha objetivo",
      "Objetivo",
      "Nivel de actividad",
      "Ocupación",
    ],
  },
  {
    title: "Preferencias",
    labels: [
      "Preferencias",
      "Restricciones",
      "Alergias",
      "Alimentos favoritos",
      "Alimentos evitados",
    ],
  },
  {
    title: "Rutina diaria",
    labels: ["Horarios disponibles", "Comidas por día", "Tiempo de cocina"],
  },
];

export function formatEvaluacionResumenGroups(
  evaluacion: EvaluacionNutricionalApiDoc,
): EvaluacionResumenGroup[] {
  const byLabel = new Map(
    formatEvaluacionResumen(evaluacion).map((field) => [field.label, field]),
  );

  return EVALUACION_GROUP_LABELS.map((group) => ({
    title: group.title,
    fields: group.labels
      .map((label) => byLabel.get(label))
      .filter((field): field is EvaluacionResumenField => Boolean(field)),
  }));
}

export function getObjetivoLabel(evaluacion: EvaluacionNutricionalApiDoc) {
  return labelFromOptions(evaluacion.objetivo, OBJETIVO_OPTIONS);
}

function meaningfulItems(values?: string[]) {
  return (values ?? []).filter(
    (value) => value.trim() && !/^(ninguna|ninguno)$/i.test(value.trim()),
  );
}

export function getEvaluacionAlertas(evaluacion: EvaluacionNutricionalApiDoc) {
  const alertas: string[] = [];
  const alergias = meaningfulItems(evaluacion.alergias);
  const evitados = meaningfulItems(evaluacion.alimentosEvitados);

  if (alergias.length) {
    alertas.push(`Alergias: ${alergias.join(", ")}`);
  }
  if (evaluacion.restricciones?.includes("embarazo")) {
    alertas.push("Embarazo: revisar plan con cuidado extra");
  }
  if (evaluacion.restricciones?.length) {
    alertas.push(
      `Restricciones: ${labelsFromOptions(evaluacion.restricciones, RESTRICCION_OPTIONS)}`,
    );
  }
  if (evitados.length) {
    alertas.push(`Evita: ${evitados.join(", ")}`);
  }

  return alertas;
}

export function buildListaCompras(
  dias: {
    comidas: {
      ingredientes: { nombre: string; cantidad: number; unidad: string }[];
    }[];
  }[],
) {
  const items = new Map<string, string[]>();

  for (const dia of dias) {
    for (const comida of dia.comidas) {
      for (const ingrediente of comida.ingredientes) {
        const key = ingrediente.nombre.trim().toLowerCase();
        const existing = items.get(key) ?? [];
        existing.push(`${ingrediente.cantidad}${ingrediente.unidad}`);
        items.set(key, existing);
      }
    }
  }

  return Array.from(items.entries())
    .map(([nombre, cantidades]) => ({
      nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1),
      cantidades: [...new Set(cantidades)],
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}
