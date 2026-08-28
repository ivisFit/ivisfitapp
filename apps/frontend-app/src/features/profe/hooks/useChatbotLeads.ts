"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

export type ChatbotLeadApiDoc = {
  _id: string;
  sessionId: string;
  nombre?: string;
  genero?: string;
  email?: string;
  whatsapp?: string;
  fuente?: string;
  objetivo?: string;
  nivel?: string;
  motivoAbandono?: string;
  diasSemana?: string;
  tiempoSesion?: string;
  lugar?: string;
  materiales?: string[];
  alimentacion?: string;
  obstaculo?: string;
  confianza?: number;
  planRecomendadoSlug?: string;
  planRecomendadoTitulo?: string;
  resumenTexto?: string;
  status: "incomplete" | "completed";
  contactada?: boolean;
  fecha?: string;
  createdAt?: string;
};

type LeadFilters = {
  status?: string;
  fuente?: string;
  plan?: string;
  desde?: string;
  hasta?: string;
};

function buildQuery(filters: LeadFilters) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.fuente) params.set("fuente", filters.fuente);
  if (filters.plan) params.set("plan", filters.plan);
  if (filters.desde) params.set("desde", new Date(filters.desde).toISOString());
  if (filters.hasta) params.set("hasta", new Date(filters.hasta).toISOString());
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function useChatbotLeads(enabled = true) {
  const [leads, setLeads] = useState<ChatbotLeadApiDoc[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeadFilters>({});
  const requestIdRef = useRef(0);

  const refetch = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ChatbotLeadApiDoc[]>(
        `/api/chatbot/leads${buildQuery(filters)}`,
      );
      if (requestId !== requestIdRef.current) return;
      setLeads(data);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "No se pudieron cargar los leads");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    if (!enabled) {
      requestIdRef.current += 1;
      setLoading(false);
      setLeads([]);
      setError(null);
      return;
    }

    void refetch();
  }, [enabled, refetch]);

  const markContactada = useCallback(async (id: string, contactada: boolean) => {
    try {
      const updated = await apiFetch<ChatbotLeadApiDoc>(
        `/api/chatbot/leads/${id}/contactada`,
        {
          method: "PATCH",
          body: JSON.stringify({ contactada }),
        },
      );
      setLeads((current) =>
        current.map((lead) => (lead._id === id ? updated : lead)),
      );
    } catch {
      // el estado local no cambia si falla; el usuario puede reintentar
    }
  }, []);

  return {
    leads,
    loading,
    error,
    filters,
    setFilters,
    refetch,
    markContactada,
  };
}
