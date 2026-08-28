"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

export type TutorialAlumna = {
  id: string;
  titulo: string;
  videoUrl: string;
  descripcion: string;
};

type TutorialApiDoc = {
  _id?: string;
  id?: string;
  titulo: string;
  videoUrl: string;
  descripcion?: string;
};

function mapTutorialFromApi(doc: TutorialApiDoc): TutorialAlumna {
  return {
    id: doc._id ?? doc.id ?? "",
    titulo: doc.titulo,
    videoUrl: doc.videoUrl,
    descripcion: doc.descripcion ?? "",
  };
}

export function useTutorialesActivos() {
  const [tutoriales, setTutoriales] = useState<TutorialAlumna[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

      setTutoriales(data.map(mapTutorialFromApi));
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los tutoriales",
      );
      setTutoriales([]);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchTutoriales(controller.signal);
    return () => controller.abort();
  }, [fetchTutoriales]);

  const refetch = useCallback(() => {
    void fetchTutoriales();
  }, [fetchTutoriales]);

  return { tutoriales, loading, error, refetch };
}
