/** Lee un valor anidado por path con notación de punto e índices (ej. `hero.title`, `items.0.q`). */
export function getByPath(obj: unknown, path: string): unknown {
  if (!path) return obj;
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current)) {
      const index = Number(part);
      if (!Number.isInteger(index)) return undefined;
      current = current[index];
      continue;
    }
    if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
      continue;
    }
    return undefined;
  }
  return current;
}

/** Escribe un valor anidado (inmutable) devolviendo un nuevo objeto raíz. */
export function setByPath<T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown,
): T {
  const parts = path.split('.');
  if (parts.length === 0) return obj;

  const clone = structuredClone(obj) as Record<string, unknown>;
  let current: Record<string, unknown> | unknown[] = clone;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!;
    const nextPart = parts[i + 1]!;
    const nextIsIndex = /^\d+$/.test(nextPart);

    if (Array.isArray(current)) {
      const index = Number(part);
      const existing = current[index];
      if (existing === undefined || existing === null) {
        current[index] = nextIsIndex ? [] : {};
      } else if (typeof existing === 'object') {
        current[index] = structuredClone(existing);
      }
      current = current[index] as Record<string, unknown> | unknown[];
      continue;
    }

    const record = current as Record<string, unknown>;
    const existing = record[part];
    if (existing === undefined || existing === null) {
      record[part] = nextIsIndex ? [] : {};
    } else if (typeof existing === 'object') {
      record[part] = structuredClone(existing);
    }
    current = record[part] as Record<string, unknown> | unknown[];
  }

  const last = parts[parts.length - 1]!;
  if (Array.isArray(current)) {
    current[Number(last)] = value;
  } else {
    (current as Record<string, unknown>)[last] = value;
  }

  return clone as T;
}
