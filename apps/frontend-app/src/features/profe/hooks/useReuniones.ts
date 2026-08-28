"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  formatDateParam,
  getMonthRange,
  mapReunionFromApi,
  type Reunion,
  type ReunionPayload,
  type ReunionUpdatePayload,
} from "@/features/profe/types/reunion";

type ReunionApiDoc = Parameters<typeof mapReunionFromApi>[0];

export function useReuniones(year: number, month: number, enabled = true) {
  const [reuniones, setReuniones] = useState<Reunion[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchReuniones = useCallback(
    async (signal?: AbortSignal) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);

      const { desde, hasta } = getMonthRange(year, month);
      const params = new URLSearchParams({
        desde: formatDateParam(desde),
        hasta: formatDateParam(hasta),
      });

      try {
        const data = await apiFetch<ReunionApiDoc[]>(
          `/api/reuniones?${params.toString()}`,
          { signal },
        );

        if (requestId !== requestIdRef.current) return;

        setReuniones(data.map(mapReunionFromApi));
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        if (err instanceof Error && err.name === "AbortError") return;
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las reuniones",
        );
        setReuniones([]);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [month, year],
  );

  useEffect(() => {
    if (!enabled) {
      requestIdRef.current += 1;
      setLoading(false);
      setReuniones([]);
      setError(null);
      setActionId(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    void fetchReuniones(controller.signal);
    return () => controller.abort();
  }, [enabled, fetchReuniones]);

  const refetch = useCallback(() => {
    void fetchReuniones();
  }, [fetchReuniones]);

  const createReunion = useCallback(
    async (payload: ReunionPayload) => {
      setActionId("create");
      setError(null);

      try {
        const created = await apiFetch<ReunionApiDoc>("/api/reuniones", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        await fetchReuniones();
        return mapReunionFromApi(created);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo crear la reunión",
        );
        return null;
      } finally {
        setActionId(null);
      }
    },
    [fetchReuniones],
  );

  const updateReunion = useCallback(
    async (id: string, payload: ReunionUpdatePayload) => {
      setActionId(id);
      setError(null);

      try {
        await apiFetch<ReunionApiDoc>(`/api/reuniones/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        await fetchReuniones();
        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo actualizar la reunión",
        );
        return false;
      } finally {
        setActionId(null);
      }
    },
    [fetchReuniones],
  );

  const deleteReunion = useCallback(
    async (id: string) => {
      setActionId(id);
      setError(null);

      try {
        await apiFetch<void>(`/api/reuniones/${id}`, {
          method: "DELETE",
        });
        await fetchReuniones();
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo eliminar la reunión",
        );
        return false;
      } finally {
        setActionId(null);
      }
    },
    [fetchReuniones],
  );

  return {
    reuniones,
    loading,
    error,
    actionId,
    refetch,
    createReunion,
    updateReunion,
    deleteReunion,
  };
}
