import { Usuario } from "@ivisfit/database";

export type AppRole = "profe" | "alumna";

/** Si cualquier fuente marca profe, tratamos al usuario como profe. */
export function resolveAppRole(
  ...roles: Array<string | null | undefined>
): AppRole {
  return roles.some((rol) => rol === "profe") ? "profe" : "alumna";
}

export async function resolveAppRoleForEmail(
  email: string,
  sessionRol?: string | null,
): Promise<AppRole> {
  const usuario = await Usuario.findOne({ correo: email })
    .select("rol")
    .lean<{ rol?: string } | null>();
  return resolveAppRole(usuario?.rol, sessionRol);
}
