"use client";

import { apiFetch } from "@/lib/api";
import type { ComidaPlan, PlanNutricionalApiDoc } from "@/features/alumna/types/plan-nutricional";

const POLL_MS = 2_500;
const MAX_MS = 4 * 60 * 1000;

type DraftStatus = {
  status: "processing" | "done" | "error";
  plan?: PlanNutricionalApiDoc;
  error?: string;
};

type ComidaStatus = {
  status: "processing" | "done" | "error";
  comida?: ComidaPlan;
  error?: string;
};

async function pollDraft(jobId: string): Promise<PlanNutricionalApiDoc> {
  const started = Date.now();
  for (;;) {
    if (Date.now() - started > MAX_MS) {
      throw new Error("La generación tardó demasiado");
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
    const data = await apiFetch<DraftStatus>(
      `/api/plan-nutricional/generar-borrador/estado/${jobId}`,
    );
    if (data.status === "done" && data.plan) return data.plan;
    if (data.status === "error") {
      throw new Error(data.error ?? "Error en generación IA");
    }
  }
}

async function pollComida(jobId: string): Promise<ComidaPlan> {
  const started = Date.now();
  for (;;) {
    if (Date.now() - started > MAX_MS) {
      throw new Error("La generación tardó demasiado");
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
    const data = await apiFetch<ComidaStatus>(
      `/api/plan-nutricional/generar-comida/estado/${jobId}`,
    );
    if (data.status === "done" && data.comida) return data.comida;
    if (data.status === "error") {
      throw new Error(data.error ?? "Error en generación IA");
    }
  }
}

export async function generarBorradorSemana(payload: Record<string, unknown>) {
  const { jobId } = await apiFetch<{ jobId: string }>(
    "/api/plan-nutricional/generar-borrador",
    { method: "POST", body: JSON.stringify(payload) },
  );
  return pollDraft(jobId);
}

export async function generarComidaIa(payload: Record<string, unknown>) {
  const { jobId } = await apiFetch<{ jobId: string }>(
    "/api/plan-nutricional/generar-comida",
    { method: "POST", body: JSON.stringify(payload) },
  );
  return pollComida(jobId);
}
