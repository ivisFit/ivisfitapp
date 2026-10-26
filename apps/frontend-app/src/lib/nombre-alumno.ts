export type PartesNombre = {
  nombre: string;
  apellido: string;
};

function limpiar(value: string | undefined | null): string {
  return (value ?? "").trim().replace(/\s+/g, " ");
}

/** Misma regla que el backend: apellido guardado, o la última palabra si todavía no hay uno. */
export function partirNombre(
  nombreCompleto: string | undefined | null,
  apellidoGuardado?: string | null,
): PartesNombre {
  const full = limpiar(nombreCompleto);
  const apellido = limpiar(apellidoGuardado);
  if (!full) return { nombre: "", apellido };

  if (apellido) {
    const sufijo = ` ${apellido}`.toLowerCase();
    if (full.toLowerCase().endsWith(sufijo) && full.length > apellido.length) {
      return {
        nombre: full.slice(0, full.length - apellido.length).trim(),
        apellido,
      };
    }
    return { nombre: full, apellido };
  }

  const corte = full.lastIndexOf(" ");
  if (corte <= 0) return { nombre: full, apellido: "" };
  return {
    nombre: full.slice(0, corte).trim(),
    apellido: full.slice(corte + 1).trim(),
  };
}
