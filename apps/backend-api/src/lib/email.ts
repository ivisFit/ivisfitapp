export function resolveAlumnaEmail(usuario: {
  correo?: string | null;
  email?: string | null;
}): string | null {
  const value = usuario.correo?.trim() || usuario.email?.trim() || "";
  return value || null;
}

export function getAppName() {
  return process.env.APP_NAME?.trim() || "IVIIS FIT";
}

export function getAppUrl() {
  return process.env.APP_URL?.trim() || process.env.FRONTEND_URL?.trim();
}
