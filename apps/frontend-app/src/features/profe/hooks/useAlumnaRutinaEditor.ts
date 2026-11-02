"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { RutinaDetail } from "@/features/alumna/types/rutina";
import { mapRutinaDetail } from "@/features/alumna/hooks/useRutinaDetail";
import { pickPrimaryRutina } from "@/features/alumna/lib/rutina-utils";

type RutinaSummaryApi = {
  _id?: string;
  id?: string;
  nombrePlan: string;
  duracionSemanas: number;
  startDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AlumnaRutinaListItem = {
  id: string;
  nombrePlan: string;
  duracionSemanas: number;
  startDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

function toListItem(doc: RutinaSummaryApi): AlumnaRutinaListItem | null {
  const id = doc._id ?? doc.id ?? "";
  if (!id) return null;
  return {
    id,
    nombrePlan: doc.nombrePlan,
    duracionSemanas: doc.duracionSemanas,
    startDate: doc.startDate,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function useAlumnaRutinaEditor(alumnaId: string | undefined) {
  const [rutinas, setRutinas] = useState<AlumnaRutinaListItem[]>([]);
  const [rutinaId, setRutinaId] = useState<string | null>(null);
  const [rutina, setRutina] = useState<RutinaDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const preferredIdRef = useRef<string | null>(null);

  const fetchRutina = useCallback(
    async (id: string, signal?: AbortSignal, preferredId?: string | null) => {
      setLoading(true);
      setError(null);

      try {
        const list = await apiFetch<RutinaSummaryApi[]>(
          `/api/rutinas?alumnaId=${encodeURIComponent(id)}`,
          { signal },
        );
        const summaries = list
          .map(toListItem)
          .filter((item): item is AlumnaRutinaListItem => item !== null);
        setRutinas(summaries);

        if (summaries.length === 0) {
          preferredIdRef.current = null;
          setRutinaId(null);
          setRutina(null);
          return;
        }

        const requested =
          preferredId !== undefined ? preferredId : preferredIdRef.current;
        const chosen =
          (requested
            ? summaries.find((item) => item.id === requested)
            : undefined) ?? pickPrimaryRutina(summaries);

        if (!chosen) {
          preferredIdRef.current = null;
          setRutinaId(null);
          setRutina(null);
          return;
        }

        preferredIdRef.current = chosen.id;
        const detail = await apiFetch(`/api/rutinas/${chosen.id}`, { signal });
        setRutinaId(chosen.id);
        setRutina(
          mapRutinaDetail(detail as Parameters<typeof mapRutinaDetail>[0]),
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar la rutina de la alumna",
        );
        setRutinaId(null);
        setRutina(null);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!alumnaId) {
      preferredIdRef.current = null;
      setRutinas([]);
      setRutinaId(null);
      setRutina(null);
      return;
    }

    preferredIdRef.current = null;
    const controller = new AbortController();
    void fetchRutina(alumnaId, controller.signal, null);
    return () => controller.abort();
  }, [alumnaId, fetchRutina]);

  const refetch = useCallback(
    (preferredId?: string) => {
      if (!alumnaId) return;
      void fetchRutina(
        alumnaId,
        undefined,
        preferredId !== undefined ? preferredId : preferredIdRef.current,
      );
    },
    [alumnaId, fetchRutina],
  );

  const selectRutina = useCallback(
    (id: string) => {
      if (!alumnaId) return;
      preferredIdRef.current = id;
      void fetchRutina(alumnaId, undefined, id);
    },
    [alumnaId, fetchRutina],
  );

  return {
    rutinas,
    rutinaId,
    rutina,
    loading,
    error,
    refetch,
    selectRutina,
  };
}
