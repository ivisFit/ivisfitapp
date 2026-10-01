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

  const list = Array.from(items.entries())
    .map(([nombre, cantidades]) => ({
      nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1),
      cantidades: [...new Set(cantidades)],
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  return list;
}

// Categorías para lista de compras
export type CategoriaCompras =
  | "Proteínas"
  | "Verduras y hortalizas"
  | "Frutas"
  | "Carbohidratos"
  | "Lácteos y huevos"
  | "Grasas y aceites"
  | "Condimentos y especias"
  | "Bebidas"
  | "Otros";

const CATEGORIAS_KEYWORDS: Record<Exclude<CategoriaCompras, "Otros">, string[]> = {
  "Proteínas": [
    "pollo", "carne", "res", "cerdo", "pescado", "salmón", "atún", "merluza", "huevo", "huevos",
    "tofu", "tempeh", "legumbres", "lentejas", "garbanzos", "porotos", "frijoles", "arvejas",
    "proteína", "proteina", "whey", "caseína", "caseina", "pechuga", "bife", "milanesas"
  ],
  "Verduras y hortalizas": [
    "lechuga", "tomate", "cebolla", "ajo", "pimiento", "morron", "zanahoria", "calabaza", "zapallo",
    "brocoli", "brócoli", "coliflor", "espinaca", "acelga", "kale", "rucula", "rúcula", "pepino",
    "apio", "puerro", "cebolla de verdeo", "berenjena", "calabacín", "calabacin", "choclo", "maíz",
    "maiz", "arvejas", "arveja", "vainita", "vainitas", "espárragos", "esparragos", "hongo", "hongos",
    "champiñon", "champiñón", "verdura", "verduras", "vegetal", "vegetales", "hoja", "hojas",
    "ensalada", "mix", "mix de", "verde", "verdes"
  ],
  "Frutas": [
    "manzana", "banana", "plátano", "platano", "naranja", "mandarina", "limon", "limón", "uva",
    "frutilla", "frutillas", "fresa", "fresas", "arandano", "arándano", "mora", "kiwi", "pera",
    "durazno", "melocoton", "melocotón", "ciruela", "higo", "granada", "mango", "piña", "anana",
    "sandia", "sandía", "melon", "melón", "fruta", "frutas"
  ],
  "Carbohidratos": [
    "arroz", "pasta", "fideo", "fideos", "tallarín", "tallarin", "spaghetti", "ñoqui", "ñoquis",
    "papa", "patata", "batata", "boniato", "camote", "pan", "tostada", "tostadas", "galletita",
    "galletas", "cereal", "cereales", "avena", "quinoa", "couscous", "mijo", "trigo", "centeno",
    "harina", "maicena", "almidon", "almidón", "tapioca", "mandioca", "yuca", "carbohidrato",
    "carbohidratos", "hidrato", "hidratos"
  ],
  "Lácteos y huevos": [
    "leche", "yogur", "yogurt", "queso", "ricota", "requeson", "requesón", "crema", "manteca",
    "mantequilla", "queso crema", "mozzarella", "parmesano", "gouda", "cheddar", "provolone",
    "dulce de leche", "flan", "postre", "lacteo", "lácteo", "lacteos", "lácteos", "huevo", "huevos"
  ],
  "Grasas y aceites": [
    "aceite", "oliva", "girasol", "coco", "palta", "avocado", "aguacate", "nuez", "nueces",
    "almendra", "almendras", "castaña", "castañas", "pistacho", "pistachos", "mani", "maní",
    "cacahuete", "semilla", "semillas", "chia", "chía", "lino", "girasol", "calabaza",
    "manteca de mani", "manteca de maní", "peanut butter", "grasa", "grasas", "aceite de"
  ],
  "Condimentos y especias": [
    "sal", "pimienta", "orégano", "oregano", "albahaca", "perejil", "cilantro", "romero", "tomillo",
    "laurel", "comino", "curry", "pimenton", "pimentón", "aji", "ají", "chile", "mostaza",
    "mayonesa", "ketchup", "soja", "salsa", "vinagre", "limon", "limón", "jugo de", "condimento",
    "especia", "hierba", "hierbas", "provenzal", "merken", "ahumado"
  ],
  "Bebidas": [
    "agua", "café", "cafe", "té", "te", "mate", "yerba", "jugo", "jugo de", "gaseosa", "refresco",
    "cerveza", "vino", "bebida", "bebidas", "infusión", "infusion", "leche", "leche vegetal",
    "leche de almendra", "leche de avena", "leche de soja"
  ],
};

export function categorizarListaCompras(
  items: { nombre: string; cantidades: string[] }[]
): { categoria: CategoriaCompras; items: { nombre: string; cantidades: string[] }[] }[] {
  const categorizados: Record<CategoriaCompras, { nombre: string; cantidades: string[] }[]> = {
    "Proteínas": [],
    "Verduras y hortalizas": [],
    "Frutas": [],
    "Carbohidratos": [],
    "Lácteos y huevos": [],
    "Grasas y aceites": [],
    "Condimentos y especias": [],
    "Bebidas": [],
    "Otros": [],
  };

  for (const item of items) {
    const nombreLower = item.nombre.toLowerCase();
    let categorizado = false;

    for (const [categoria, keywords] of Object.entries(CATEGORIAS_KEYWORDS)) {
      if (keywords.some((kw) => nombreLower.includes(kw))) {
        categorizados[categoria as CategoriaCompras].push(item);
        categorizado = true;
        break;
      }
    }

    if (!categorizado) {
      categorizados["Otros"].push(item);
    }
  }

  // Filtrar categorías vacías y ordenar
  return Object.entries(categorizados)
    .filter(([, items]) => items.length > 0)
    .map(([categoria, items]) => ({
      categoria: categoria as CategoriaCompras,
      items: items.sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
    }));
}
