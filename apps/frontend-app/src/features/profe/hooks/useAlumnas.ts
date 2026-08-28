"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { mapUsuarioFromApi, type AlumnaListItem, type UsuarioApiDoc } from "@/types/usuario";

const ALUMNAS_URL = "/api/usuarios?rol=alumna";

export function useAlumnas(enabled = true) {
  const [alumnas, setAlumnas] = useState<AlumnaListItem[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchAlumnas = useCallback(async (signal?: AbortSignal) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<UsuarioApiDoc[]>(ALUMNAS_URL, { signal });

      if (requestId !== requestIdRef.current) return;

      if (!Array.isArray(data)) {
        throw new Error("Respuesta inválida al cargar alumnas");
      }

      setAlumnas(data.map(mapUsuarioFromApi));
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      if (err instanceof Error && err.name === "AbortError") return;

      setError(
        err instanceof Error ? err.message : "No se pudieron cargar las alumnas",
      );
      setAlumnas([]);
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
      setAlumnas([]);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    void fetchAlumnas(controller.signal);
    return () => controller.abort();
  }, [enabled, fetchAlumnas]);

  const refetch = useCallback(() => {
    void fetchAlumnas();
  }, [fetchAlumnas]);

  return { alumnas, loading, error, refetch };
}
