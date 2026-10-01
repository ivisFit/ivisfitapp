import type {
  AlimentoCategoria,
  AlimentoPayload,
  AlimentoUnidad,
} from "@/features/profe/types/alimento";

export type AlimentoFormState = {
  nombre: string;
  categoria: AlimentoCategoria;
  porcionCantidad: string;
  porcionUnidad: AlimentoUnidad;
  kcal: string;
  proteinaG: string;
  carbohidratosG: string;
  grasasG: string;
  notas: string;
};

export function getEmptyAlimentoFormState(
  overrides?: Partial<AlimentoFormState>,
): AlimentoFormState {
  return {
    nombre: "",
    categoria: "proteina",
    porcionCantidad: "100",
    porcionUnidad: "g",
    kcal: "",
    proteinaG: "",
    carbohidratosG: "",
    grasasG: "",
    notas: "",
    ...overrides,
  };
}

export function alimentoFormStateToPayload(form: AlimentoFormState): AlimentoPayload {
  return {
    nombre: form.nombre.trim(),
    categoria: form.categoria,
    porcionReferencia: {
      cantidad: Number(form.porcionCantidad) || 1,
      unidad: form.porcionUnidad,
    },
    macrosPorPorcion: {
      kcal: Number(form.kcal) || 0,
      proteinaG: Number(form.proteinaG) || 0,
      carbohidratosG: Number(form.carbohidratosG) || 0,
      grasasG: Number(form.grasasG) || 0,
    },
    notas: form.notas.trim() || undefined,
    activo: true,
  };
}
