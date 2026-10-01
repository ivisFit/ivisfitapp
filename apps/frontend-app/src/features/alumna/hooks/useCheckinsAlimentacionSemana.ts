"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { CheckinAlimentacion } from "@/features/alumna/types/checkin-alimentacion";

export function useCheckinsAlimentacionSemana() {
  const [checkins, setCheckins] = useState<Record<string, CheckinAlimentacion>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Obtener check-ins de los últimos 7 días
        const to = new Date().toISOString().split("T")[0];
        const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        const params = new URLSearchParams({ from, to });

        const data = await apiFetch<CheckinAlimentacion[]>(
          `/api/checkins-alimentacion?${params.toString()}`,
          { signal: controller.signal },
        );

        const map: Record<string, CheckinAlimentacion> = {};
        for (const c of data) {
          map[c.dateKey] = c;
        }
        setCheckins(map);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "No se pudieron cargar los check-ins");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const getCheckinForDate = useCallback(
    (dateKey: string) => checkins[dateKey] ?? null,
    [checkins],
  );

  return { checkins, loading, error, getCheckinForDate };
}