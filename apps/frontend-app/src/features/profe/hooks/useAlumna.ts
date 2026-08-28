"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  mapUsuarioDetailFromApi,
  type AlumnaDetail,
  type UsuarioApiDoc,
} from "@/types/usuario";

export function normalizeAlumnaRouteId(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0].trim();
  }
  return undefined;
}

export function useAlumna(id: string | undefined) {
  const { loading: authLoading } = useAuth();
  const [alumna, setAlumna] = useState<AlumnaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchAlumna = useCallback(async () => {
    if (!id || authLoading) {
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    setAlumna(null);

    try {
      const data = await apiFetch<UsuarioApiDoc>(`/api/usuarios/${id}`);

      if (requestId !== requestIdRef.current) return;

      setAlumna(mapUsuarioDetailFromApi(data));
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      setError(
        err instanceof Error ? err.message : "No se pudo cargar la alumna",
      );
      setAlumna(null);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [authLoading, id]);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      setError(null);
      return;
    }

    if (!id) {
      setAlumna(null);
      setError("Alumna no encontrada");
      setLoading(false);
      return;
    }

    void fetchAlumna();
  }, [authLoading, id, fetchAlumna]);

  const refetch = useCallback(() => {
    void fetchAlumna();
  }, [fetchAlumna]);

  const isLoading = authLoading || loading || (!error && !alumna && Boolean(id));

  return {
    alumna,
    loading: isLoading,
    error,
    refetch,
  };
}
