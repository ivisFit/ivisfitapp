"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type {
  PlanNutricionalApiDoc,
  PlanNutricionalProfeWorkspace,
} from "@/features/alumna/types/plan-nutricional";

type PlanNutricionalWorkspaceContextValue = {
  alumnaId: string;
  plan: PlanNutricionalApiDoc | null;
  planBorrador: PlanNutricionalApiDoc | null;
  planPublicado: PlanNutricionalApiDoc | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const PlanNutricionalWorkspaceContext =
  createContext<PlanNutricionalWorkspaceContextValue | null>(null);

type PlanNutricionalWorkspaceProviderProps = {
  alumnaId: string;
  children: ReactNode;
};

export function PlanNutricionalWorkspaceProvider({
  alumnaId,
  children,
}: PlanNutricionalWorkspaceProviderProps) {
  const [workspace, setWorkspace] = useState<PlanNutricionalProfeWorkspace>({
    editing: null,
    borrador: null,
    publicado: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(
    async (signal?: AbortSignal) => {
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

  const value = useMemo(
    () => ({
      alumnaId,
      plan: workspace.editing,
      planBorrador: workspace.borrador,
      planPublicado: workspace.publicado,
      loading,
      error,
      refetch,
    }),
    [alumnaId, workspace, loading, error, refetch],
  );

  return (
    <PlanNutricionalWorkspaceContext.Provider value={value}>
      {children}
    </PlanNutricionalWorkspaceContext.Provider>
  );
}

export function usePlanNutricionalWorkspaceContext() {
  return useContext(PlanNutricionalWorkspaceContext);
}
