import type { IngredientePlan } from "@/features/alumna/types/plan-nutricional";

export type SugerenciaIngredienteKind = "update" | "replace" | "add" | "remove";

export type SugerenciaIngrediente = {
  id: string;
  kind: SugerenciaIngredienteKind;
  currentIndex?: number;
  before?: IngredientePlan;
  after?: IngredientePlan;
};

function normalizeNombre(nombre: string) {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function macroIgual(a?: number, b?: number) {
  return (a ?? null) === (b ?? null);
}

function mismosDatos(a: IngredientePlan, b: IngredientePlan) {
  return (
    normalizeNombre(a.nombre) === normalizeNombre(b.nombre) &&
    a.unidad === b.unidad &&
    Number(a.cantidad) === Number(b.cantidad) &&
    (a.alimentoId ?? "") === (b.alimentoId ?? "") &&
    macroIgual(a.kcal, b.kcal) &&
    macroIgual(a.proteinaG, b.proteinaG) &&
    macroIgual(a.carbohidratosG, b.carbohidratosG) &&
    macroIgual(a.grasasG, b.grasasG)
  );
}

function mismaIdentidad(a: IngredientePlan, b: IngredientePlan) {
  const nombre = normalizeNombre(a.nombre);
  return nombre !== "" && nombre === normalizeNombre(b.nombre) && a.unidad === b.unidad;
}

export function diffIngredientesSugerencia(
  actuales: IngredientePlan[],
  propuestos: IngredientePlan[],
): SugerenciaIngrediente[] {
  const usedProposed = new Set<number>();
  const matchedCurrent = new Set<number>();
  const items: SugerenciaIngrediente[] = [];
  let seq = 0;

  function nextId(kind: SugerenciaIngredienteKind) {
    seq += 1;
    return `sug-${kind}-${seq}`;
  }

  actuales.forEach((actual, index) => {
    const proposedIndex = propuestos.findIndex(
      (propuesto, proposedIdx) =>
        !usedProposed.has(proposedIdx) && mismaIdentidad(actual, propuesto),
    );
    if (proposedIndex < 0) return;

    usedProposed.add(proposedIndex);
    matchedCurrent.add(index);
    const propuesto = propuestos[proposedIndex]!;
    if (mismosDatos(actual, propuesto)) return;

    items.push({
      id: nextId("update"),
      kind: "update",
      currentIndex: index,
      before: actual,
      after: propuesto,
    });
  });

  const leftoverCurrent = actuales
    .map((ingrediente, index) => ({ ingrediente, index }))
    .filter(({ index }) => !matchedCurrent.has(index));
  const leftoverProposed = propuestos
    .map((ingrediente, index) => ({ ingrediente, index }))
    .filter(({ index }) => !usedProposed.has(index));

  const pairCount = Math.min(leftoverCurrent.length, leftoverProposed.length);
  for (let offset = 0; offset < pairCount; offset += 1) {
    const current = leftoverCurrent[offset]!;
    const proposed = leftoverProposed[offset]!;
    if (mismosDatos(current.ingrediente, proposed.ingrediente)) continue;
    items.push({
      id: nextId("replace"),
      kind: "replace",
      currentIndex: current.index,
      before: current.ingrediente,
      after: proposed.ingrediente,
    });
  }

  for (let offset = pairCount; offset < leftoverCurrent.length; offset += 1) {
    const current = leftoverCurrent[offset]!;
    if (!current.ingrediente.nombre.trim()) continue;
    items.push({
      id: nextId("remove"),
      kind: "remove",
      currentIndex: current.index,
      before: current.ingrediente,
    });
  }

  for (let offset = pairCount; offset < leftoverProposed.length; offset += 1) {
    const proposed = leftoverProposed[offset]!;
    if (!proposed.ingrediente.nombre.trim()) continue;
    items.push({
      id: nextId("add"),
      kind: "add",
      after: proposed.ingrediente,
    });
  }

  return items;
}

export function quitarSugerencia(
  items: SugerenciaIngrediente[],
  item: SugerenciaIngrediente,
  accepted: boolean,
): SugerenciaIngrediente[] {
  const removedIndex =
    accepted && item.kind === "remove" ? item.currentIndex : undefined;

  return items
    .filter((entry) => entry.id !== item.id)
    .map((entry) => {
      if (
        removedIndex == null ||
        entry.currentIndex == null ||
        entry.currentIndex <= removedIndex
      ) {
        return entry;
      }
      return { ...entry, currentIndex: entry.currentIndex - 1 };
    });
}
