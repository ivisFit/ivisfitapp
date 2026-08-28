"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { LandingPlanApiDoc } from "@/features/landing/lib/landing-plans-api";

export type LandingPlanGestion = {
  id: string;
  slug: string;
  orden: number;
  title: string;
  shortTitle: string;
  route: string;
  subtitle: string;
  duration: string;
  format: string;
  investment: string;
  badge: string;
  cardBullets: string[];
  intro: string;
  focus: string;
  methodology: string;
  extras: string[];
  benefits: string[];
  ctaLabel: string;
  cardImage: string;
  isActive: boolean;
};

export type LandingPlanPayload = {
  slug: string;
  orden: number;
  title: string;
  shortTitle: string;
  route: string;
  subtitle: string;
  duration: string;
  format: string;
  investment: string;
  badge: string;
  cardBullets: string[];
  intro: string;
  focus: string;
  methodology?: string;
  extras: string[];
  benefits?: string[];
  ctaLabel: string;
  cardImage?: string;
  isActive?: boolean;
};

function mapLandingPlanGestionFromApi(doc: LandingPlanApiDoc): LandingPlanGestion {
  return {
    id: doc._id ?? doc.id ?? "",
    slug: doc.slug,
    orden: doc.orden,
    title: doc.title,
    shortTitle: doc.shortTitle,
    route: doc.route,
    subtitle: doc.subtitle,
    duration: doc.duration,
    format: doc.format,
    investment: doc.investment,
    badge: doc.badge,
    cardBullets: doc.cardBullets,
    intro: doc.intro,
    focus: doc.focus,
    methodology: doc.methodology ?? "",
    extras: doc.extras,
    benefits: doc.benefits ?? [],
    ctaLabel: doc.ctaLabel,
    cardImage: doc.cardImage ?? "",
    isActive: doc.isActive ?? true,
  };
}

export function useLandingPlanesGestion() {
  const [planes, setPlanes] = useState<LandingPlanGestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchPlanes = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<LandingPlanApiDoc[]>(
        "/api/landing-planes/manage/list",
        { signal },
      );
      setPlanes(data.map(mapLandingPlanGestionFromApi));
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los planes",
      );
      setPlanes([]);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchPlanes(controller.signal);
    return () => controller.abort();
  }, [fetchPlanes]);

  const refetch = useCallback(() => {
    void fetchPlanes();
  }, [fetchPlanes]);

  const createPlan = useCallback(async (payload: LandingPlanPayload) => {
    setActionId("create");
    setError(null);

    try {
      const created = await apiFetch<LandingPlanApiDoc>("/api/landing-planes", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setPlanes((current) =>
        [...current, mapLandingPlanGestionFromApi(created)].sort(
          (a, b) => a.orden - b.orden,
        ),
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo crear el plan",
      );
      return false;
    } finally {
      setActionId(null);
    }
  }, []);

  const updatePlan = useCallback(
    async (id: string, payload: LandingPlanPayload) => {
      setActionId(id);
      setError(null);

      try {
        const updated = await apiFetch<LandingPlanApiDoc>(
          `/api/landing-planes/${id}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          },
        );
        setPlanes((current) =>
          current
            .map((plan) =>
              plan.id === id ? mapLandingPlanGestionFromApi(updated) : plan,
            )
            .sort((a, b) => a.orden - b.orden),
        );
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo actualizar el plan",
        );
        return false;
      } finally {
        setActionId(null);
      }
    },
    [],
  );

  const deletePlan = useCallback(async (id: string) => {
    setActionId(id);
    setError(null);

    try {
      await apiFetch<void>(`/api/landing-planes/${id}`, {
        method: "DELETE",
      });
      setPlanes((current) => current.filter((plan) => plan.id !== id));
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el plan",
      );
      return false;
    } finally {
      setActionId(null);
    }
  }, []);

  const togglePlanActive = useCallback(async (id: string, isActive: boolean) => {
    setActionId(id);
    setError(null);

    try {
      const updated = await apiFetch<LandingPlanApiDoc>(
        `/api/landing-planes/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ isActive }),
        },
      );
      setPlanes((current) =>
        current.map((plan) =>
          plan.id === id ? mapLandingPlanGestionFromApi(updated) : plan,
        ),
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el estado del plan",
      );
      return false;
    } finally {
      setActionId(null);
    }
  }, []);

  return {
    planes,
    loading,
    error,
    actionId,
    refetch,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanActive,
  };
}
