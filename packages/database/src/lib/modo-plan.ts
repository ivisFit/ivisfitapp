import type { ModoPlan } from "../schemas/shared";

export function resolveModoPlan(input?: object | null): ModoPlan {
  if (!input) return "ambos";

  const record = input as {
    modoPlan?: unknown;
    soloAlimentacion?: unknown;
  };

  if (
    record.modoPlan === "ambos" ||
    record.modoPlan === "rutina" ||
    record.modoPlan === "alimentacion"
  ) {
    return record.modoPlan;
  }

  return record.soloAlimentacion === true ? "alimentacion" : "ambos";
}
