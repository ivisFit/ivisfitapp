"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchGamificacionPerfil } from "../api";

export const GAMIFICACION_QUERY_KEY = ["gamificacion"] as const;

let lastMutationAt = 0;

export function markGamificationMutation() {
  lastMutationAt = Date.now();
}

export function wasRecentGamificationMutation(withinMs = 15000): boolean {
  return Date.now() - lastMutationAt < withinMs;
}

export function useGamificacion(enabled = true) {
  return useQuery({
    queryKey: GAMIFICACION_QUERY_KEY,
    queryFn: fetchGamificacionPerfil,
    enabled,
    staleTime: 30_000,
  });
}

export function useInvalidateGamificacion() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    markGamificationMutation();
    void queryClient.invalidateQueries({
      queryKey: GAMIFICACION_QUERY_KEY,
    });
  }, [queryClient]);
}
