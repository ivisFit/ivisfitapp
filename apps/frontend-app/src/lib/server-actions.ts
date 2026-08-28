"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      ...headers,
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function getUserProfile() {
  return apiFetch("/api/users/profile");
}

export async function updateUserProfile(data: Record<string, unknown>) {
  const result = await apiFetch("/api/users/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  revalidateTag("user-profile");
  return result;
}

export async function getRutinas(alumnaId?: string) {
  const path = alumnaId ? `/api/rutinas?alumnaId=${alumnaId}` : "/api/rutinas";
  return apiFetch(path);
}

export async function createRutina(data: Record<string, unknown>) {
  const result = await apiFetch("/api/rutinas", {
    method: "POST",
    body: JSON.stringify(data),
  });
  revalidateTag("rutinas");
  return result;
}

export async function updateRutina(id: string, data: Record<string, unknown>) {
  const result = await apiFetch(`/api/rutinas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  revalidateTag("rutinas");
  return result;
}

export async function deleteRutina(id: string) {
  const result = await apiFetch(`/api/rutinas/${id}`, {
    method: "DELETE",
  });
  revalidateTag("rutinas");
  return result;
}

export async function getEjercicios() {
  return apiFetch("/api/ejercicios");
}

export async function createEjercicio(data: Record<string, unknown>) {
  const result = await apiFetch("/api/ejercicios", {
    method: "POST",
    body: JSON.stringify(data),
  });
  revalidateTag("ejercicios");
  return result;
}

export async function getPlanTemplates() {
  return apiFetch("/api/plan-templates");
}

export async function getMediciones(alumnaId: string) {
  return apiFetch(`/api/mediciones?alumnaId=${alumnaId}`);
}

export async function createMedicion(data: Record<string, unknown>) {
  const result = await apiFetch("/api/mediciones", {
    method: "POST",
    body: JSON.stringify(data),
  });
  revalidateTag("mediciones");
  return result;
}

export async function getEvaluacionesNutricionales(alumnaId: string) {
  return apiFetch(`/api/evaluaciones-nutricionales?alumnaId=${alumnaId}`);
}

export async function createEvaluacionNutricional(data: Record<string, unknown>) {
  const result = await apiFetch("/api/evaluaciones-nutricionales", {
    method: "POST",
    body: JSON.stringify(data),
  });
  revalidateTag("evaluaciones-nutricionales");
  return result;
}

export async function getPlanesNutricionales(alumnaId: string) {
  return apiFetch(`/api/planes-nutricionales?alumnaId=${alumnaId}`);
}

export async function createPlanNutricional(data: Record<string, unknown>) {
  const result = await apiFetch("/api/planes-nutricionales", {
    method: "POST",
    body: JSON.stringify(data),
  });
  revalidateTag("planes-nutricionales");
  return result;
}

export async function getAlumnas() {
  return apiFetch("/api/alumnas");
}

export async function getAlumna(id: string) {
  return apiFetch(`/api/alumnas/${id}`);
}

export async function getDashboardStats() {
  return apiFetch("/api/dashboard/stats");
}

export async function getLeads() {
  return apiFetch("/api/leads");
}