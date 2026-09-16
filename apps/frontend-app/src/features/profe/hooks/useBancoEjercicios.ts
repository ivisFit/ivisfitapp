"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { invalidateCache } from "@/lib/apiCache";
import { isMongoObjectId, mapDocId, removeFirstById } from "@/lib/map-doc-id";

export type BancoEjercicio = {
  id: string;
  nombre: string;
  videoUrl: string;
  descripcion: string;
};

type EjercicioApiDoc = {
  _id?: unknown;
  id?: unknown;
  nombre: string;
  videoUrl: string;
  descripcion?: string;
};

type EjercicioPayload = {
  nombre: string;
  videoUrl: string;
  descripcion: string;
};

function mapEjercicioFromApi(doc: EjercicioApiDoc | null | undefined): BancoEjercicio | null {
  if (!doc) return null;
  const id = mapDocId(doc);
  if (!id) return null;
  return {
    id,
    nombre: doc.nombre,
    videoUrl: doc.videoUrl,
    descripcion: doc.descripcion ?? "",
  };
}

export function useBancoEjercicios(enabled = true) {
  const [ejercicios, setEjercicios] = useState<BancoEjercicio[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchEjercicios = useCallback(async (signal?: AbortSignal, quiet = false) => {
    const requestId = ++requestIdRef.current;
    if (!quiet) {
      setLoading(true);
      setError(null);
    }

    try {
      const data = await apiFetch<EjercicioApiDoc[]>("/api/ejercicios", {
        signal,
      });

      if (requestId !== requestIdRef.current) return;

      setEjercicios(
        data
          .map(mapEjercicioFromApi)
          .filter((item): item is BancoEjercicio => item !== null),
      );
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los ejercicios",
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
      setEjercicios([]);
      setError(null);
      setActionId(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    void fetchEjercicios(controller.signal);
    return () => controller.abort();
  }, [enabled, fetchEjercicios]);

  const refetch = useCallback(() => {
    void fetchEjercicios();
  }, [fetchEjercicios]);

  const createEjercicio = useCallback(
    async (payload: EjercicioPayload) => {
      setActionId("create");
      setError(null);

      try {
        const created = await apiFetch<EjercicioApiDoc>("/api/ejercicios", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const mapped = mapEjercicioFromApi(created);
        if (mapped) {
          setEjercicios((current) =>
            [...current, mapped].sort((a, b) =>
              a.nombre.localeCompare(b.nombre, "es"),
            ),
          );
        } else {
          void fetchEjercicios();
        }
        invalidateCache("ejercicios");
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo crear el ejercicio",
        );
        return false;
      } finally {
        setActionId(null);
      }
    },
    [fetchEjercicios],
  );

  const updateEjercicio = useCallback(
    async (id: string, payload: EjercicioPayload) => {
      if (!isMongoObjectId(id)) {
        setError("No se pudo actualizar el ejercicio");
        return false;
      }
      setActionId(id);
      setError(null);

      try {
        const updated = await apiFetch<EjercicioApiDoc>(`/api/ejercicios/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        const mapped = mapEjercicioFromApi(updated);
        if (mapped) {
          setEjercicios((current) =>
            current
              .map((ejercicio) => (ejercicio.id === id ? mapped : ejercicio))
              .sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
          );
        } else {
          void fetchEjercicios();
        }
        invalidateCache("ejercicios");
        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo actualizar el ejercicio",
        );
        return false;
      } finally {
        setActionId(null);
      }
    },
    [fetchEjercicios],
  );

  const deleteEjercicio = useCallback(async (id: string) => {
    if (!isMongoObjectId(id)) return false;
    setActionId(id);
    setError(null);

    try {
      await apiFetch<void>(`/api/ejercicios/${id}`, {
        method: "DELETE",
      });
      setEjercicios((current) => removeFirstById(current, id));
      invalidateCache("ejercicios");
      void fetchEjercicios(undefined, true);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el ejercicio",
      );
      return false;
    } finally {
      setActionId(null);
    }
  }, [fetchEjercicios]);

  return {
    ejercicios,
    loading,
    error,
    actionId,
    refetch,
    createEjercicio,
    updateEjercicio,
    deleteEjercicio,
  };
}
