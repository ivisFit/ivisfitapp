"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { usePlanNutricionalWorkspaceContext } from "@/features/profe/context/PlanNutricionalWorkspaceProvider";
import type {
  PlanNutricionalApiDoc,
  PlanNutricionalProfeWorkspace,
} from "@/features/alumna/types/plan-nutricional";

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

function usePlanNutricionalProfeLocal(alumnaId?: string) {
  const [workspace, setWorkspace] = useState<PlanNutricionalProfeWorkspace>({
    editing: null,
    borrador: null,
    publicado: null,
  });
  const [loading, setLoading] = useState(Boolean(alumnaId));
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(
    async (signal?: AbortSignal) => {
      if (!alumnaId) {
        setWorkspace({ editing: null, borrador: null, publicado: null });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch<PlanNutricionalProfeWorkspace>(
          `/api/plan-nutricional/workspace?alumnaId=${encodeURIComponent(alumnaId)}`,
          { signal },
        );
        setWorkspace({
          editing: data.editing ?? null,
          borrador: data.borrador ?? null,
          publicado: data.publicado ?? null,
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (err instanceof ApiError && err.status === 404) {
          setWorkspace({ editing: null, borrador: null, publicado: null });
          return;
        }
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar el plan nutricional",
        );
        setWorkspace({ editing: null, borrador: null, publicado: null });
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

  const refetch = useCallback(async () => {
    await fetchPlan();
  }, [fetchPlan]);

  return {
    plan: workspace.editing,
    planBorrador: workspace.borrador,
    planPublicado: workspace.publicado,
    loading,
    error,
    refetch,
  };
}

export function usePlanNutricionalProfe(alumnaId?: string) {
  const shared = usePlanNutricionalWorkspaceContext();
  const local = usePlanNutricionalProfeLocal(
    shared && shared.alumnaId === alumnaId ? undefined : alumnaId,
  );

  if (shared && alumnaId && shared.alumnaId === alumnaId) {
    return {
      plan: shared.plan,
      planBorrador: shared.planBorrador,
      planPublicado: shared.planPublicado,
      loading: shared.loading,
      error: shared.error,
      refetch: shared.refetch,
    };
  }

  return local;
}
