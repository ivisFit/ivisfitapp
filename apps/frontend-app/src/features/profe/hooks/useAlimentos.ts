"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { invalidateCache } from "@/lib/apiCache";
import { mapDocId } from "@/lib/map-doc-id";
import type {
  Alimento,
  AlimentoApiDoc,
  AlimentoPayload,
} from "@/features/profe/types/alimento";

function mapAlimentoFromApi(doc: AlimentoApiDoc | null | undefined): Alimento | null {
  if (!doc) return null;
  const id = mapDocId(doc);
  if (!id) return null;
  return {
    id,
    nombre: doc.nombre,
    categoria: doc.categoria,
    porcionReferencia: doc.porcionReferencia,
    macrosPorPorcion: doc.macrosPorPorcion,
    notas: doc.notas ?? "",
    activo: doc.activo,
  };
}

const CATALOG_SUGGESTION_LIMIT = 20;

let catalogCache: Alimento[] | null = null;
let catalogPromise: Promise<Alimento[]> | null = null;

export function invalidateAlimentosCatalogCache() {
  catalogCache = null;
  catalogPromise = null;
}

export async function loadAlimentosCatalog(
  signal?: AbortSignal,
): Promise<Alimento[]> {
  if (catalogCache) return catalogCache;

  if (!catalogPromise) {
    catalogPromise = apiFetch<AlimentoApiDoc[]>(
      "/api/alimentos?soloActivos=true",
      { signal },
    )
      .then((data) => {
        const mapped = data
          .map(mapAlimentoFromApi)
          .filter((item): item is Alimento => item !== null)
          .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
        catalogCache = mapped;
        return mapped;
      })
      .catch((error) => {
        catalogPromise = null;
        throw error;
      });
  }

  return catalogPromise;
}

function filterAlimentosCatalog(
  catalog: Alimento[],
  query: string,
  limit = CATALOG_SUGGESTION_LIMIT,
): Alimento[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return catalog.slice(0, limit);
  }
  return catalog
    .filter((alimento) => alimento.nombre.toLowerCase().includes(trimmed))
    .slice(0, limit);
}

function mergeAlimentosLists(...lists: Alimento[][]): Alimento[] {
  const byId = new Map<string, Alimento>();
  for (const list of lists) {
    for (const alimento of list) {
      byId.set(alimento.id, alimento);
    }
  }
  return [...byId.values()].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es"),
  );
}

export function useAlimentos(enabled = true) {
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchAlimentos = useCallback(async (signal?: AbortSignal) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<AlimentoApiDoc[]>("/api/alimentos", { signal });

      if (requestId !== requestIdRef.current) return;

      setAlimentos(
        data
          .map(mapAlimentoFromApi)
          .filter((item): item is Alimento => item !== null),
      );
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los alimentos",
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      requestIdRef.current += 1;
      setLoading(false);
      setAlimentos([]);
      setError(null);
      setActionId(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    void fetchAlimentos(controller.signal);
    return () => controller.abort();
  }, [enabled, fetchAlimentos]);

  const refetch = useCallback(() => {
    void fetchAlimentos();
  }, [fetchAlimentos]);

  const createAlimento = useCallback(async (payload: AlimentoPayload) => {
    setActionId("create");
    setError(null);

    try {
        const created = await apiFetch<AlimentoApiDoc>("/api/alimentos", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const mapped = mapAlimentoFromApi(created);
        if (mapped) {
          setAlimentos((current) =>
            [...current, mapped].sort((a, b) =>
              a.nombre.localeCompare(b.nombre, "es"),
            ),
          );
        } else {
          void fetchAlimentos();
        }
        invalidateCache("alimentos");
        invalidateAlimentosCatalogCache();
        return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el alimento");
      return false;
    } finally {
      setActionId(null);
    }
  }, [fetchAlimentos]);

  const updateAlimento = useCallback(
    async (id: string, payload: AlimentoPayload) => {
      if (!id) return false;
      setActionId(id);
      setError(null);

      try {
        const updated = await apiFetch<AlimentoApiDoc>(`/api/alimentos/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        const mapped = mapAlimentoFromApi(updated);
        if (mapped) {
          setAlimentos((current) =>
            current
              .map((alimento) => (alimento.id === id ? mapped : alimento))
              .sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
          );
        } else {
          void fetchAlimentos();
        }
        invalidateCache("alimentos");
        invalidateAlimentosCatalogCache();
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo actualizar el alimento",
        );
        return false;
      } finally {
        setActionId(null);
      }
    },
    [fetchAlimentos],
  );

  const deleteAlimento = useCallback(async (id: string) => {
    if (!id) return false;
    setActionId(id);
    setError(null);

    try {
      await apiFetch<void>(`/api/alimentos/${id}`, { method: "DELETE" });
      setAlimentos((current) => current.filter((alimento) => alimento.id !== id));
      invalidateCache("alimentos");
      invalidateAlimentosCatalogCache();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el alimento");
      return false;
    } finally {
      setActionId(null);
    }
  }, []);

  return {
    alimentos,
    loading,
    error,
    actionId,
    refetch,
    createAlimento,
    updateAlimento,
    deleteAlimento,
  };
}

export function useAlimentosBusqueda(
  query: string,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? true;
  const [catalog, setCatalog] = useState<Alimento[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [serverHits, setServerHits] = useState<Alimento[]>([]);
  const [serverLoading, setServerLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setCatalogLoading(false);
      return;
    }

    const controller = new AbortController();
    setCatalogLoading(true);
    setCatalogLoaded(false);

    void loadAlimentosCatalog(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setCatalog(data);
          setCatalogLoaded(true);
        }
      })
      .catch((err) => {
        if (err instanceof Error && err.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setCatalog([]);
          setCatalogLoaded(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCatalogLoading(false);
        }
      });

    return () => controller.abort();
  }, [enabled]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!enabled || trimmed.length < 2) {
      setServerHits([]);
      setServerLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setServerLoading(true);
      apiFetch<AlimentoApiDoc[]>(
        `/api/alimentos?q=${encodeURIComponent(trimmed)}&soloActivos=true`,
        { signal: controller.signal },
      )
        .then((data) => {
          if (controller.signal.aborted) return;
          setServerHits(
            data
              .map(mapAlimentoFromApi)
              .filter((item): item is Alimento => item !== null),
          );
        })
        .catch((err) => {
          if (err instanceof Error && err.name === "AbortError") return;
          setServerHits([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setServerLoading(false);
        });
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, enabled]);

  const localHits = useMemo(
    () => filterAlimentosCatalog(catalog, query),
    [catalog, query],
  );

  const resultados = useMemo(
    () =>
      mergeAlimentosLists(localHits, serverHits).slice(
        0,
        CATALOG_SUGGESTION_LIMIT,
      ),
    [localHits, serverHits],
  );

  const loading = catalogLoading || serverLoading;
  const catalogEmpty = catalogLoaded && catalog.length === 0;
  const noMatches =
    catalogLoaded &&
    !catalogEmpty &&
    resultados.length === 0 &&
    query.trim().length > 0;

  return {
    resultados,
    loading,
    catalogEmpty,
    noMatches,
    catalogLoaded,
  };
}
