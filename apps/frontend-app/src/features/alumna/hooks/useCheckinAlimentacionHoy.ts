"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useInvalidateGamificacion } from "@/features/gamificacion/hooks/useGamificacion";
import type {
  CheckinAlimentacion,
  CheckinAlimentacionEstado,
} from "@/features/alumna/types/checkin-alimentacion";

const ESTADO_OPTIONS: { value: CheckinAlimentacionEstado; label: string }[] = [
  { value: "cumpli", label: "Cumplí" },
  { value: "parcial", label: "Parcial" },
  { value: "no_pude", label: "No pude" },
];

export function useCheckinAlimentacionHoy() {
  const [checkin, setCheckin] = useState<CheckinAlimentacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const invalidateGamificacion = useInvalidateGamificacion();

  useEffect(() => {
    const controller = new AbortController();
    apiFetch<CheckinAlimentacion | null>("/api/checkins-alimentacion/hoy", {
      signal: controller.signal,
    })
      .then((data) => setCheckin(data))
      .catch((err) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "No se pudo cargar el check-in");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const save = useCallback(async (estado: CheckinAlimentacionEstado) => {
    setSaving(true);
    setError(null);
    try {
      const saved = await apiFetch<CheckinAlimentacion>("/api/checkins-alimentacion", {
        method: "PUT",
        body: JSON.stringify({ estado }),
      });
      setCheckin(saved);
      invalidateGamificacion();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }, [invalidateGamificacion]);

  return { checkin, loading, saving, error, save, options: ESTADO_OPTIONS };
}
