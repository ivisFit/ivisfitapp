"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCached } from "@/lib/apiCache";

export type PlanTemplatePresentation = {
  nombre: string;
  bio: string;
  especialidades: string;
  filosofia: string;
  lema: string;
  contacto: {
    instagram?: string;
    email?: string;
    telefono?: string;
    web?: string;
  };
};

export type PlanTemplate = {
  id: string;
  slug: string;
  orden: number;
  nombre: string;
  resumen: string;
  descripcion: string;
  duracionSemanas: number;
  duracionLabel: string;
  formato: string;
  enfoque: string;
  metodologia?: string;
  beneficios?: string[];
  extras?: string[];
  inversion: string;
  precio?: number;
  moneda?: string;
  presentacion: PlanTemplatePresentation;
  isActive: boolean;
};

export type PlanTemplateApiDoc = Omit<PlanTemplate, "id"> & {
  _id?: string;
  id?: string;
};

export function mapPlanTemplateFromApi(doc: PlanTemplateApiDoc): PlanTemplate {
  return {
    id: doc._id ?? doc.id ?? "",
    slug: doc.slug,
    orden: doc.orden,
    nombre: doc.nombre,
    resumen: doc.resumen,
    descripcion: doc.descripcion,
    duracionSemanas: doc.duracionSemanas,
    duracionLabel: doc.duracionLabel,
    formato: doc.formato,
    enfoque: doc.enfoque,
    metodologia: doc.metodologia,
    beneficios: doc.beneficios,
    extras: doc.extras,
    inversion: doc.inversion,
    precio: doc.precio,
    moneda: doc.moneda,
    presentacion: doc.presentacion,
    isActive: doc.isActive,
  };
}

export function usePlanTemplates() {
  const [planTemplates, setPlanTemplates] = useState<PlanTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanTemplates = useCallback(
    async (signal?: AbortSignal, options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await fetchCached<PlanTemplateApiDoc[]>(
          "/api/plan-templates",
          (sig) =>
            import("@/lib/api").then(({ apiFetch }) =>
              apiFetch<PlanTemplateApiDoc[]>("/api/plan-templates", {
                signal: sig,
              }),
            ),
          60_000,
          signal,
        );
        setPlanTemplates(data.map(mapPlanTemplateFromApi));
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "No se pudieron cargar los planes",
        );
        if (!options?.silent) {
          setPlanTemplates([]);
        }
      } finally {
        if (!signal?.aborted && !options?.silent) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchPlanTemplates(controller.signal);
    return () => controller.abort();
  }, [fetchPlanTemplates]);

  const refetch = useCallback(() => {
    void fetchPlanTemplates();
  }, [fetchPlanTemplates]);

  return { planTemplates, loading, error, refetch };
}