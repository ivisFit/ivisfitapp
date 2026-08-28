import { apiFetch } from "@/lib/api";
import type { GamificacionPerfil } from "./types";

export async function fetchGamificacionPerfil(): Promise<GamificacionPerfil> {
  return apiFetch<GamificacionPerfil>("/api/gamificacion");
}
