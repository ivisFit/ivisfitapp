"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { RutinaDetail } from "@/features/alumna/types/rutina";
import { mapRutinaDetail } from "@/features/alumna/hooks/useRutinaDetail";

type RutinaSummaryApi = {
  _id?: string;
  id?: string;
  nombrePlan: string;
  duracionSemanas: number;
  startDate?: string;
  createdAt?: string;
};

export function useAlumnaRutinaEditor(alumnaId: string | undefined) {
  const [rutinaId, setRutinaId] = useState<string | null>(null);
  const [rutina, setRutina] = useState<RutinaDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRutina = useCallback(async (id: string, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const list = await apiFetch<RutinaSummaryApi[]>(
        `/api/rutinas?alumnaId=${encodeURIComponent(id)}`,
        { signal },
      );
      if (list.length === 0) {
        setRutinaId(null);
        setRutina(null);
        return;
      }

      const primary = [...list].sort((a, b) => {
        const aTime = new Date(a.createdAt ?? a.startDate ?? 0).getTime();
        const bTime = new Date(b.createdAt ?? b.startDate ?? 0).getTime();
        return bTime - aTime;
      })[0];

      const resolvedId = primary._id ?? primary.id ?? "";
      if (!resolvedId) {
        setRutinaId(null);
        setRutina(null);
        return;
      }

      const detail = await apiFetch(`/api/rutinas/${resolvedId}`, { signal });
      setRutinaId(resolvedId);
      setRutina(mapRutinaDetail(detail as Parameters<typeof mapRutinaDetail>[0]));
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof Error ? err.message : "No se pudo cargar la rutina de la alumna",
      );
      setRutinaId(null);
      setRutina(null);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!alumnaId) {
      setRutinaId(null);
      setRutina(null);
      return;
    }

    const controller = new AbortController();
    void fetchRutina(alumnaId, controller.signal);
    return () => controller.abort();
  }, [alumnaId, fetchRutina]);

  const refetch = useCallback(() => {
    if (alumnaId) void fetchRutina(alumnaId);
  }, [alumnaId, fetchRutina]);

  return { rutinaId, rutina, loading, error, refetch, setRutinaId };
}
