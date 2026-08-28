"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCached } from "@/lib/apiCache";

type MeProfileApiDoc = {
  _id?: string;
  id?: string;
  nombre: string;
  email: string;
  rol: string;
  sexo?: "hombre" | "mujer";
  alturaCm?: number;
  circunferenciasHabilitadas?: boolean;
};

export type MeProfile = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  sexo?: "hombre" | "mujer";
  alturaCm?: number;
  circunferenciasHabilitadas?: boolean;
};

function mapMeProfile(doc: MeProfileApiDoc): MeProfile {
  return {
    id: doc._id ?? doc.id ?? "",
    nombre: doc.nombre,
    email: doc.email,
    rol: doc.rol,
    sexo: doc.sexo,
    alturaCm: doc.alturaCm,
    circunferenciasHabilitadas: doc.circunferenciasHabilitadas,
  };
}

export function useMeProfile() {
  const [profile, setProfile] = useState<MeProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchCached<MeProfileApiDoc>(
        "/api/me",
        (sig) =>
          import("@/lib/api").then(({ apiFetch }) =>
            apiFetch<MeProfileApiDoc>("/api/me", { signal: sig }),
          ),
        60_000,
        signal,
      );
      setProfile(mapMeProfile(data));
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "No se pudo cargar el perfil");
      setProfile(null);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchProfile(controller.signal);
    return () => controller.abort();
  }, [fetchProfile]);

  const refetch = useCallback(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch };
}
