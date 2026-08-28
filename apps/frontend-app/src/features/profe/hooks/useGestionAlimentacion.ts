"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { PlanNutricionalApiDoc } from "@/features/alumna/types/plan-nutricional";

export function usePlanNutricionalAlumna() {
  const [plan, setPlan] = useState<PlanNutricionalApiDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<PlanNutricionalApiDoc>(
        "/api/plan-nutricional/mia",
        { signal },
      );
      setPlan(data);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      if (err instanceof ApiError && err.status === 404) {
        setPlan(null);
        return;
      }
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el plan nutricional",
      );
      setPlan(null);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchPlan(controller.signal);
    return () => controller.abort();
  }, [fetchPlan]);

  const refetch = useCallback(() => {
    void fetchPlan();
  }, [fetchPlan]);

  return { plan, loading, error, refetch };
}

export function usePlanNutricionalProfe(alumnaId?: string) {
  const [plan, setPlan] = useState<PlanNutricionalApiDoc | null>(null);
  const [loading, setLoading] = useState(Boolean(alumnaId));
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(
    async (signal?: AbortSignal) => {
      if (!alumnaId) {
        setPlan(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch<PlanNutricionalApiDoc>(
          `/api/plan-nutricional?alumnaId=${encodeURIComponent(alumnaId)}`,
          { signal },
        );
        setPlan(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (err instanceof ApiError && err.status === 404) {
          setPlan(null);
          return;
        }
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar el plan nutricional",
        );
        setPlan(null);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [alumnaId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchPlan(controller.signal);
    return () => controller.abort();
  }, [fetchPlan]);

  const refetch = useCallback(() => {
    void fetchPlan();
  }, [fetchPlan]);

  return { plan, loading, error, refetch };
}
