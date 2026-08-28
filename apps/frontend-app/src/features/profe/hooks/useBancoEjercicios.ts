"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { invalidateCache } from "@/lib/apiCache";

export type BancoEjercicio = {
  id: string;
  nombre: string;
  videoUrl: string;
  descripcion: string;
};

type EjercicioApiDoc = {
  _id?: string;
  id?: string;
  nombre: string;
  videoUrl: string;
  descripcion?: string;
};

type EjercicioPayload = {
  nombre: string;
  videoUrl: string;
  descripcion: string;
};

function mapEjercicioFromApi(doc: EjercicioApiDoc): BancoEjercicio {
  return {
    id: doc._id ?? doc.id ?? "",
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

  const fetchEjercicios = useCallback(async (signal?: AbortSignal) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<EjercicioApiDoc[]>("/api/ejercicios", {
        signal,
      });

      if (requestId !== requestIdRef.current) return;

      setEjercicios(data.map(mapEjercicioFromApi));
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los ejercicios",
      );
      setEjercicios([]);
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
        setEjercicios((current) =>
          [...current, mapEjercicioFromApi(created)].sort((a, b) =>
            a.nombre.localeCompare(b.nombre, "es"),
          ),
        );
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
    [],
  );

  const updateEjercicio = useCallback(
    async (id: string, payload: EjercicioPayload) => {
      setActionId(id);
      setError(null);

      try {
        const updated = await apiFetch<EjercicioApiDoc>(`/api/ejercicios/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setEjercicios((current) =>
          current
            .map((ejercicio) =>
              ejercicio.id === id ? mapEjercicioFromApi(updated) : ejercicio,
            )
            .sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
        );
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
    [],
  );

  const deleteEjercicio = useCallback(async (id: string) => {
    setActionId(id);
    setError(null);

    try {
      await apiFetch<void>(`/api/ejercicios/${id}`, {
        method: "DELETE",
      });
      setEjercicios((current) =>
        current.filter((ejercicio) => ejercicio.id !== id),
      );
      invalidateCache("ejercicios");
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el ejercicio",
      );
      return false;
    } finally {
      setActionId(null);
    }
  }, []);

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
