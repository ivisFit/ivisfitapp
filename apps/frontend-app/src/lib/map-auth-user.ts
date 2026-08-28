import type { AuthUser, UserRole } from "@/types/auth";
import type { AdmissionStatus, UsuarioApiDoc } from "@/types/usuario";

function resolveAdmissionStatus(
  role: UserRole,
  status?: AdmissionStatus | null,
): AdmissionStatus {
  if (role === "profe") return "admitida";
  return status ?? "pendiente";
}

function resolveUserRole(
  profileRol?: string | null,
  sessionRol?: string | null,
): UserRole {
  return profileRol === "profe" || sessionRol === "profe" ? "profe" : "alumna";
}

export function mapAuthUser(
  sessionUser: {
    id: string;
    email: string;
    name: string;
    rol?: string | null;
  } | null | undefined,
  profile?: UsuarioApiDoc | null,
): AuthUser | null {
  if (!sessionUser) return null;

  const role = resolveUserRole(profile?.rol, sessionUser.rol);

  return {
    id: profile?.id ?? profile?._id ?? sessionUser.id,
    email: profile?.correo ?? sessionUser.email,
    name: profile?.nombre ?? sessionUser.name,
    role,
    admissionStatus: resolveAdmissionStatus(role, profile?.estadoAdmision),
    photoUrl: profile?.fotoPerfil?.url ?? null,
    circunferenciasHabilitadas: profile?.circunferenciasHabilitadas === true,
    tutorialesVistos: profile?.tutorialesVistos === true,
    onboardingCompletado: profile?.onboardingCompletado === true,
    notificaciones: profile?.notificaciones,
    gamificacion: profile?.gamificacion,
  };
}
