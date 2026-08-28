"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { invalidateCache } from "@/lib/apiCache";

export type Tutorial = {
  id: string;
  titulo: string;
  videoUrl: string;
  descripcion: string;
  orden: number;
  activo: boolean;
};

type TutorialApiDoc = {
  _id?: string;
  id?: string;
  titulo: string;
  videoUrl: string;
  descripcion?: string;
  orden?: number;
  activo?: boolean;
};

export type TutorialPayload = {
  titulo: string;
  videoUrl: string;
  descripcion: string;
  activo: boolean;
};

function mapTutorialFromApi(doc: TutorialApiDoc): Tutorial {
  return {
    id: doc._id ?? doc.id ?? "",
    titulo: doc.titulo,
    videoUrl: doc.videoUrl,
    descripcion: doc.descripcion ?? "",
    orden: doc.orden ?? 0,
    activo: doc.activo !== false,
  };
}

function sortTutoriales(items: Tutorial[]) {
  return [...items].sort((a, b) => a.orden - b.orden);
}

function reorderByIds(items: Tutorial[], ids: string[]) {
  const byId = new Map(items.map((item) => [item.id, item]));
  return ids
    .map((id, index) => {
      const tutorial = byId.get(id);
      if (!tutorial) return null;
      return { ...tutorial, orden: index };
    })
    .filter((item): item is Tutorial => item !== null);
}

export function useTutoriales(enabled = true) {
  const [tutoriales, setTutoriales] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchTutoriales = useCallback(async (signal?: AbortSignal) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<TutorialApiDoc[]>("/api/tutoriales", {
        signal,
      });

      if (requestId !== requestIdRef.current) return;

      setTutoriales(sortTutoriales(data.map(mapTutorialFromApi)));
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los tutoriales",
      );
      setTutoriales([]);
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
      setTutoriales([]);
      setError(null);
      setActionId(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    void fetchTutoriales(controller.signal);
    return () => controller.abort();
  }, [enabled, fetchTutoriales]);

  const refetch = useCallback(() => {
    void fetchTutoriales();
  }, [fetchTutoriales]);

  const createTutorial = useCallback(async (payload: TutorialPayload) => {
    setActionId("create");
    setError(null);

    try {
      const created = await apiFetch<TutorialApiDoc>("/api/tutoriales", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setTutoriales((current) =>
        sortTutoriales([...current, mapTutorialFromApi(created)]),
      );
      invalidateCache("tutoriales");
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo crear el tutorial",
      );
      return false;
    } finally {
      setActionId(null);
    }
  }, []);

  const updateTutorial = useCallback(
    async (id: string, payload: TutorialPayload) => {
      setActionId(id);
      setError(null);

      try {
        const updated = await apiFetch<TutorialApiDoc>(`/api/tutoriales/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setTutoriales((current) =>
          sortTutoriales(
            current.map((tutorial) =>
              tutorial.id === id ? mapTutorialFromApi(updated) : tutorial,
            ),
          ),
        );
        invalidateCache("tutoriales");
        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo actualizar el tutorial",
        );
        return false;
      } finally {
        setActionId(null);
      }
    },
    [],
  );

  const deleteTutorial = useCallback(async (id: string) => {
    setActionId(id);
    setError(null);

    try {
      await apiFetch<void>(`/api/tutoriales/${id}`, {
        method: "DELETE",
      });
      setTutoriales((current) =>
        current.filter((tutorial) => tutorial.id !== id),
      );
      invalidateCache("tutoriales");
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el tutorial",
      );
      return false;
    } finally {
      setActionId(null);
    }
  }, []);

  const reorderTutoriales = useCallback(
    async (ids: string[]) => {
      const previous = tutoriales;
      setActionId("reorder");
      setError(null);
      setTutoriales(reorderByIds(tutoriales, ids));

      try {
        const data = await apiFetch<TutorialApiDoc[]>(
          "/api/tutoriales/reordenar",
          {
            method: "PATCH",
            body: JSON.stringify({ ids }),
          },
        );
        setTutoriales(sortTutoriales(data.map(mapTutorialFromApi)));
        invalidateCache("tutoriales");
        return true;
      } catch (err) {
        setTutoriales(previous);
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo guardar el nuevo orden",
        );
        void fetchTutoriales();
        return false;
      } finally {
        setActionId(null);
      }
    },
    [fetchTutoriales, tutoriales],
  );

  return {
    tutoriales,
    loading,
    error,
    actionId,
    isReordering: actionId === "reorder",
    refetch,
    createTutorial,
    updateTutorial,
    deleteTutorial,
    reorderTutoriales,
  };
}
