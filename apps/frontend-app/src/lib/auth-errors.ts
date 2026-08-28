export function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function mapSignInErrorMessage(message?: string | null): string {
  const normalized = message?.trim().toLowerCase() ?? "";

  if (
    normalized.includes("invalid email or password") ||
    normalized.includes("invalid password")
  ) {
    return "Email o contraseña incorrectos. Si olvidaste la contraseña, usá «¿Olvidaste tu contraseña?». Si tenés 2FA activo, después de la contraseña correcta te pedirá el código por email.";
  }

  if (normalized.includes("email not verified")) {
    return "Tu email todavía no está verificado. Revisá tu bandeja de entrada.";
  }

  if (normalized.includes("missing or null origin")) {
    return "No se pudo validar el origen de la solicitud. Recargá la página e intentá de nuevo.";
  }

  return message?.trim() || "No se pudo iniciar sesión";
}

export function mapTwoFactorErrorMessage(message?: string | null): string {
  const normalized = message?.trim().toLowerCase() ?? "";

  if (normalized.includes("invalid two factor cookie")) {
    return "La verificación expiró o la sesión de 2FA no es válida. Volvé a iniciar sesión con tu email y contraseña.";
  }

  if (
    normalized.includes("otp has expired") ||
    normalized.includes("too many attempts")
  ) {
    return "El código expiró o hubo demasiados intentos. Pedí un código nuevo.";
  }

  if (normalized.includes("invalid code")) {
    return "Código incorrecto. Revisá el email e intentá de nuevo.";
  }

  return message?.trim() || "No se pudo verificar el código";
}
