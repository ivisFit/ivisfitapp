"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { CoachInsight } from "@/features/alumna/types/coach-insight";

export function useCoachInsights() {
  const [insight, setInsight] = useState<CoachInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    apiFetch<CoachInsight[]>("/api/coach-insights", {
      signal: controller.signal,
    })
      .then((insights) => {
        setInsight(insights.find((item) => !item.leido) ?? null);
      })
      .catch((err) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setInsight(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  async function dismiss() {
    if (!insight) return;
    setInsight(null);
    try {
      await apiFetch(`/api/coach-insights/${insight._id}/leido`, {
        method: "PATCH",
      });
    } catch {
      // La UI ya ocultó la tarjeta; si falla la persistencia, se vuelve a mostrar en el próximo ingreso.
    }
  }

  return { insight, loading, dismiss };
}
