"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type {
  CreateEvaluacionNutricionalPayload,
  EvaluacionNutricionalApiDoc,
} from "@/features/alumna/types/evaluacion-nutricional";

export function useEvaluacionNutricional(enabled = true) {
  const [evaluacion, setEvaluacion] = useState<EvaluacionNutricionalApiDoc | null>(
    null,
  );
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchEvaluacion = useCallback(async (signal?: AbortSignal) => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<EvaluacionNutricionalApiDoc>(
        "/api/evaluacion-nutricional/mia",
        { signal },
      );
      setEvaluacion(data);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      if (err instanceof ApiError && err.status === 404) {
        setEvaluacion(null);
        return;
      }
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar la evaluación nutricional",
      );
      setEvaluacion(null);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    void fetchEvaluacion(controller.signal);
    return () => controller.abort();
  }, [enabled, fetchEvaluacion]);

  const submitEvaluacion = useCallback(
    async (payload: CreateEvaluacionNutricionalPayload) => {
      const data = await apiFetch<EvaluacionNutricionalApiDoc>(
        "/api/evaluacion-nutricional",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      setEvaluacion(data);
      return data;
    },
    [],
  );

  const refetch = useCallback(() => {
    void fetchEvaluacion();
  }, [fetchEvaluacion]);

  return {
    evaluacion,
    loading,
    error,
    refetch,
    submitEvaluacion,
  };
}