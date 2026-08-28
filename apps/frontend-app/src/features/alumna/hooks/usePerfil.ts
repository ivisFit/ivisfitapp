"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { AlumnaDetail, HealthChangesRequestInput, ApproveHealthChangesInput } from "@/types/usuario";

const PERFIL_QUERY_KEY = ["perfil"] as const;

export function usePerfil() {
  return useQuery({
    queryKey: PERFIL_QUERY_KEY,
    queryFn: async () => {
      const data = await apiFetch<AlumnaDetail>("/api/me");
      return data;
    },
    staleTime: 30_000,
  });
}

export function useRequestHealthChanges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: HealthChangesRequestInput) => {
      return apiFetch<AlumnaDetail>("/api/me/health-changes", {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERFIL_QUERY_KEY });
    },
  });
}

export function useApproveHealthChanges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alumnaId, data }: { alumnaId: string; data: ApproveHealthChangesInput }) => {
      return apiFetch<AlumnaDetail>(`/api/usuarios/${alumnaId}/approve-health`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERFIL_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["alumna-detail"] });
    },
  });
}

export function useRejectHealthChanges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alumnaId, data }: { alumnaId: string; data: ApproveHealthChangesInput }) => {
      return apiFetch<AlumnaDetail>(`/api/usuarios/${alumnaId}/reject-health`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERFIL_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["alumna-detail"] });
    },
  });
}

export function useInvalidatePerfil() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: PERFIL_QUERY_KEY });
  };
}