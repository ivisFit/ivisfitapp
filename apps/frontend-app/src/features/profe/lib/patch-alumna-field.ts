import { apiFetch } from "@/lib/api";
import type { UsuarioApiDoc } from "@/types/usuario";

export async function patchAlumnaField(
  alumnaId: string,
  payload: Record<string, unknown>,
) {
  await apiFetch<UsuarioApiDoc>(`/api/usuarios/${alumnaId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
