"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { ComposicionCorporal } from "@/features/alumna/types/plan-nutricional";

export function useComposicionResumen() {
  const [composicion, setComposicion] = useState<ComposicionCorporal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    apiFetch<ComposicionCorporal>("/api/mediciones/mi-resumen", {
      signal: controller.signal,
    })
      .then((data) => setComposicion(data.pesoKg || data.imc || data.porcentajeGrasaCorporal ? data : null))
      .catch((err) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setComposicion(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { composicion, loading };
}
