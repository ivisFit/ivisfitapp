export function deepMerge(base: unknown, patch: unknown): unknown {
  if (patch === null || patch === undefined) return base;
  if (Array.isArray(base) && Array.isArray(patch)) {
    const max = Math.max(base.length, patch.length);
    const out: unknown[] = [];
    for (let i = 0; i < max; i++) {
      const b = base[i];
      const p = patch[i];
      if (p === null || p === undefined) {
        out[i] = b;
      } else if (
        typeof b === "object" &&
        b !== null &&
        typeof p === "object" &&
        p !== null &&
        !Array.isArray(p) &&
        !Array.isArray(b)
      ) {
        out[i] = deepMerge(b, p);
      } else {
        out[i] = p;
      }
    }
    return out;
  }
  if (
    typeof base === "object" &&
    base !== null &&
    typeof patch === "object" &&
    patch !== null &&
    !Array.isArray(base) &&
    !Array.isArray(patch)
  ) {
    const out: Record<string, unknown> = {
      ...(base as Record<string, unknown>),
    };
    for (const [key, value] of Object.entries(patch as Record<string, unknown>)) {
      out[key] = key in out ? deepMerge(out[key], value) : value;
    }
    return out;
  }
  return patch;
}
