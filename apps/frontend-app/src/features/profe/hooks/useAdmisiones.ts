"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { invalidateCache } from "@/lib/apiCache";
import {
  mapAdmissionRequestFromApi,
  type AdmissionRequest,
  type UsuarioApiDoc,
} from "@/types/usuario";

export function useAdmisiones(enabled = true) {
  const [solicitudes, setSolicitudes] = useState<AdmissionRequest[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchSolicitudes = useCallback(async (signal?: AbortSignal) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<UsuarioApiDoc[]>(
        "/api/admisiones?estado=pendiente",
        { signal },
      );

      if (requestId !== requestIdRef.current) return;

      setSolicitudes(data.map(mapAdmissionRequestFromApi));
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      if (err instanceof Error && err.name === "AbortError") return;

      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las solicitudes",
      );
      setSolicitudes([]);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      requestIdRef.current += 1;
      setLoading(false);
      setSolicitudes([]);
      setError(null);
      setActionId(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    void fetchSolicitudes(controller.signal);
    return () => controller.abort();
  }, [enabled, fetchSolicitudes]);

  const refetch = useCallback(() => {
    void fetchSolicitudes();
  }, [fetchSolicitudes]);

  const decidir = useCallback(
    async (id: string, accion: "admitir" | "rechazar") => {
      setActionId(id);
      setError(null);

      try {
        await apiFetch(`/api/admisiones/${id}/${accion}`, {
          method: "PATCH",
        });
        invalidateCache("admisiones");
        invalidateCache("usuarios");
        await fetchSolicitudes();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo actualizar la solicitud",
        );
      } finally {
        setActionId(null);
      }
    },
    [fetchSolicitudes],
  );

  return { solicitudes, loading, actionId, error, refetch, decidir };
}
