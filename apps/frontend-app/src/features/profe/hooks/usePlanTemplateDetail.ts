"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { invalidateCache } from "@/lib/apiCache";
import type { PlanTemplateBlueprint } from "@/features/profe/lib/rutina-draft";
import {
  mapPlanTemplateFromApi,
  type PlanTemplate,
  type PlanTemplateApiDoc,
} from "@/features/profe/hooks/usePlanTemplates";

export function usePlanTemplateDetail(planId: string | null) {
  const [plan, setPlan] = useState<PlanTemplate | null>(null);
  const [blueprint, setBlueprint] = useState<PlanTemplateBlueprint | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async (id: string, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const doc = await apiFetch<PlanTemplateApiDoc & { blueprint?: PlanTemplateBlueprint }>(
        `/api/plan-templates/${id}`,
        { signal },
      );
      setPlan(mapPlanTemplateFromApi(doc));
      setBlueprint(doc.blueprint);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "No se pudo cargar el plan");
      setPlan(null);
      setBlueprint(undefined);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!planId) {
      setPlan(null);
      setBlueprint(undefined);
      return;
    }

    const controller = new AbortController();
    void fetchPlan(planId, controller.signal);
    return () => controller.abort();
  }, [planId, fetchPlan]);

  const refetch = useCallback(() => {
    if (planId) void fetchPlan(planId);
  }, [planId, fetchPlan]);

  return { plan, blueprint, loading, error, refetch };
}

export async function savePlanTemplateBlueprint(
  planId: string,
  blueprint: PlanTemplateBlueprint,
) {
  const result = await apiFetch<PlanTemplateApiDoc & { syncedRutinasCount?: number }>(
    `/api/plan-templates/${planId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ blueprint }),
    },
  );
  invalidateCache("plan-templates");
  return result;
}
