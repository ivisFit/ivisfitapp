"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { invalidateCache } from "@/lib/apiCache";
import { useInvalidateGamificacion } from "@/features/gamificacion/hooks/useGamificacion";
import type { UpsertLogPesoPayload } from "../types/log-peso";

const DEBOUNCE_MS = 800;

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useSaveLogPeso() {
  const [statusByEjercicioId, setStatusByEjercicioId] = useState<
    Record<string, SaveStatus>
  >({});
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingRef = useRef<Record<string, UpsertLogPesoPayload>>({});
  const invalidateGamificacion = useInvalidateGamificacion();

  const setStatus = useCallback((ejercicioId: string, status: SaveStatus) => {
    setStatusByEjercicioId((current) => ({
      ...current,
      [ejercicioId]: status,
    }));
  }, []);

  const persistLog = useCallback(
    async (payload: UpsertLogPesoPayload) => {
      setStatus(payload.ejercicioId, "saving");

      try {
        await apiFetch("/api/logs-pesos/upsert", {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setStatus(payload.ejercicioId, "saved");
        invalidateCache("logs-pesos");
        invalidateCache("rutina-progreso");
        invalidateGamificacion();
      } catch {
        setStatus(payload.ejercicioId, "error");
      }
    },
    [invalidateGamificacion, setStatus],
  );

  const flushPending = useCallback(
    async (ejercicioId?: string) => {
      const entries = ejercicioId
        ? [[ejercicioId, pendingRef.current[ejercicioId]] as const]
        : Object.entries(pendingRef.current);

      for (const [id, payload] of entries) {
        if (!payload) continue;
        const timer = timersRef.current[id];
        if (timer) {
          clearTimeout(timer);
          delete timersRef.current[id];
        }
        delete pendingRef.current[id];
        await persistLog(payload);
      }
    },
    [persistLog],
  );

  const scheduleSave = useCallback(
    (payload: UpsertLogPesoPayload) => {
      const { ejercicioId } = payload;

      if (payload.pesosPorSerie.length === 0) {
        return;
      }

      pendingRef.current[ejercicioId] = payload;

      const existingTimer = timersRef.current[ejercicioId];
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      timersRef.current[ejercicioId] = setTimeout(() => {
        delete timersRef.current[ejercicioId];
        const pending = pendingRef.current[ejercicioId];
        delete pendingRef.current[ejercicioId];
        if (pending) {
          void persistLog(pending);
        }
      }, DEBOUNCE_MS);
    },
    [persistLog],
  );

  useEffect(() => {
    const timers = timersRef.current;

    return () => {
      Object.values(timers).forEach((timer) => clearTimeout(timer));
      const pendingEntries = Object.entries(pendingRef.current);
      pendingRef.current = {};
      timersRef.current = {};
      void Promise.all(
        pendingEntries.map(([, payload]) => persistLog(payload)),
      );
    };
  }, [persistLog]);

  const getStatus = useCallback(
    (ejercicioId: string): SaveStatus =>
      statusByEjercicioId[ejercicioId] ?? "idle",
    [statusByEjercicioId],
  );

  return {
    scheduleSave,
    flushPending,
    getStatus,
  };
}
