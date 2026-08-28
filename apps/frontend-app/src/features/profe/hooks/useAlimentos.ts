"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { invalidateCache } from "@/lib/apiCache";
import type {
  Alimento,
  AlimentoApiDoc,
  AlimentoPayload,
} from "@/features/profe/types/alimento";

function mapAlimentoFromApi(doc: AlimentoApiDoc): Alimento {
  return {
    id: doc._id ?? doc.id ?? "",
    nombre: doc.nombre,
    categoria: doc.categoria,
    porcionReferencia: doc.porcionReferencia,
    macrosPorPorcion: doc.macrosPorPorcion,
    notas: doc.notas ?? "",
    activo: doc.activo,
  };
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

      setAlimentos(data.map(mapAlimentoFromApi));
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los alimentos",
      );
      setAlimentos([]);
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
      setAlimentos((current) =>
        [...current, mapAlimentoFromApi(created)].sort((a, b) =>
          a.nombre.localeCompare(b.nombre, "es"),
        ),
      );
      invalidateCache("alimentos");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el alimento");
      return false;
    } finally {
      setActionId(null);
    }
  }, []);

  const updateAlimento = useCallback(
    async (id: string, payload: AlimentoPayload) => {
      setActionId(id);
      setError(null);

      try {
        const updated = await apiFetch<AlimentoApiDoc>(`/api/alimentos/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setAlimentos((current) =>
          current
            .map((alimento) => (alimento.id === id ? mapAlimentoFromApi(updated) : alimento))
            .sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
        );
        invalidateCache("alimentos");
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
    [],
  );

  const deleteAlimento = useCallback(async (id: string) => {
    setActionId(id);
    setError(null);

    try {
      await apiFetch<void>(`/api/alimentos/${id}`, { method: "DELETE" });
      setAlimentos((current) => current.filter((alimento) => alimento.id !== id));
      invalidateCache("alimentos");
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

export function useAlimentosBusqueda(query: string) {
  const [resultados, setResultados] = useState<Alimento[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResultados([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setLoading(true);
      apiFetch<AlimentoApiDoc[]>(
        `/api/alimentos?q=${encodeURIComponent(trimmed)}&soloActivos=true`,
        { signal: controller.signal },
      )
        .then((data) => setResultados(data.map(mapAlimentoFromApi)))
        .catch((err) => {
          if (err instanceof Error && err.name === "AbortError") return;
          setResultados([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  return { resultados, loading };
}
