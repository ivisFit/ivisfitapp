"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export type ColaPersona = {
  id: string;
  nombre: string;
  correo?: string;
  estado?: string;
  fechaVencimiento?: string | null;
};

export type ProfeColaDto = {
  counts: {
    admisionesPendientes: number;
    sinRutina: number;
    evalSinPlan: number;
    checkinsAtencion: number;
    adherenciaBaja: number;
    membresiasPorVencer: number;
    membresiasVencidas: number;
  };
  admisionesPendientes?: ColaPersona[];
  sinRutina?: ColaPersona[];
  evalSinPlan?: ColaPersona[];
  checkinsAtencion?: ColaPersona[];
  adherenciaBaja?: ColaPersona[];
  membresiasPorVencer?: ColaPersona[];
  membresiasVencidas?: ColaPersona[];
};

export function useProfeCola(enabled = true) {
  const { user } = useAuth();
  const isProfe = enabled && user?.role === "profe";
  const [cola, setCola] = useState<ProfeColaDto | null>(null);
  const [loading, setLoading] = useState(isProfe);

  const fetchCola = useCallback(async () => {
    if (!isProfe) {
      setCola(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<ProfeColaDto>("/api/panel/cola");
      setCola(data);
    } catch {
      setCola(null);
    } finally {
      setLoading(false);
    }
  }, [isProfe]);

  useEffect(() => {
    void fetchCola();
  }, [fetchCola]);

  return {
    cola,
    loading,
    refetch: fetchCola,
    admisionesCount: cola?.counts.admisionesPendientes ?? 0,
  };
}
