export type PartesNombre = {
  nombre: string;
  apellido: string;
};

function limpiar(value: string | undefined | null): string {
  return (value ?? "").trim().replace(/\s+/g, " ");
}

/**
 * Separa el nombre de pila y el apellido.
 * Si hay apellido guardado, se respeta (aunque tenga más de una palabra).
 * Si no, la última palabra del nombre completo se toma como apellido.
 */
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

export function unirNombre(nombre: string, apellido: string): string {
  return [limpiar(nombre), limpiar(apellido)].filter(Boolean).join(" ");
}

export function aplicarNombreApellido(
  actual: { nombre?: string | null; apellido?: string | null },
  cambio: { nombre?: string; apellido?: string },
): { nombre: string; apellido?: string } | null {
  const partes = partirNombre(actual.nombre, actual.apellido);
  const nombre = cambio.nombre !== undefined ? limpiar(cambio.nombre) : partes.nombre;
  const apellido =
    cambio.apellido !== undefined ? limpiar(cambio.apellido) : partes.apellido;
  if (!nombre) return null;
  return {
    nombre: unirNombre(nombre, apellido),
    apellido: apellido || undefined,
  };
}
