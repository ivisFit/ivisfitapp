export type AlimentoCategoria =
  | "proteina"
  | "carbohidrato"
  | "grasa"
  | "verdura"
  | "fruta"
  | "lacteo"
  | "legumbre"
  | "condimento"
  | "bebida"
  | "otro";

export type AlimentoUnidad = "g" | "ml" | "unidad";

export type MacrosPorPorcion = {
  kcal: number;
  proteinaG: number;
  carbohidratosG: number;
  grasasG: number;
};

export type Alimento = {
  id: string;
  nombre: string;
  categoria: AlimentoCategoria;
  porcionReferencia: { cantidad: number; unidad: AlimentoUnidad };
  macrosPorPorcion: MacrosPorPorcion;
  notas: string;
  activo: boolean;
};

export type AlimentoApiDoc = {
  _id?: string;
  id?: string;
  nombre: string;
  categoria: AlimentoCategoria;
  porcionReferencia: { cantidad: number; unidad: AlimentoUnidad };
  macrosPorPorcion: MacrosPorPorcion;
  notas?: string;
  activo: boolean;
};

export type AlimentoPayload = {
  nombre: string;
  categoria: AlimentoCategoria;
  porcionReferencia: { cantidad: number; unidad: AlimentoUnidad };
  macrosPorPorcion: MacrosPorPorcion;
  notas?: string;
  activo: boolean;
};

export const ALIMENTO_CATEGORIA_OPTIONS: { value: AlimentoCategoria; label: string }[] = [
  { value: "proteina", label: "Proteína" },
  { value: "carbohidrato", label: "Carbohidrato" },
  { value: "grasa", label: "Grasa" },
  { value: "verdura", label: "Verdura" },
  { value: "fruta", label: "Fruta" },
  { value: "lacteo", label: "Lácteo" },
  { value: "legumbre", label: "Legumbre" },
  { value: "condimento", label: "Condimento" },
  { value: "bebida", label: "Bebida" },
  { value: "otro", label: "Otro" },
];

export function getAlimentoCategoriaLabel(categoria: AlimentoCategoria): string {
  return (
    ALIMENTO_CATEGORIA_OPTIONS.find((option) => option.value === categoria)?.label ??
    categoria
  );
}

export function calcularMacrosPorCantidad(
  alimento: Pick<Alimento, "porcionReferencia" | "macrosPorPorcion">,
  cantidad: number,
): MacrosPorPorcion {
  const factor = cantidad / alimento.porcionReferencia.cantidad;
  return {
    kcal: Math.round(alimento.macrosPorPorcion.kcal * factor),
    proteinaG: Math.round(alimento.macrosPorPorcion.proteinaG * factor * 10) / 10,
    carbohidratosG:
      Math.round(alimento.macrosPorPorcion.carbohidratosG * factor * 10) / 10,
    grasasG: Math.round(alimento.macrosPorPorcion.grasasG * factor * 10) / 10,
  };
}
