import { getTrustedOrigins } from "@ivisfit/auth";

function parseOriginList(value: string | undefined): string[] {
  if (!value) return [];

  return [
    ...new Set(
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  ];
}

/**
 * Orígenes permitidos para el middleware CORS de Express.
 *
 * - Si `CORS_ALLOWED_ORIGINS` está definida, solo esos orígenes son válidos.
 * - Si no, usa `FRONTEND_URL`, `BETTER_AUTH_URL` y `TRUSTED_ORIGINS`.
 */
export function getCorsAllowedOrigins(): string[] {
  const explicitOrigins = parseOriginList(process.env.CORS_ALLOWED_ORIGINS);

  if (explicitOrigins.length > 0) {
    return explicitOrigins;
  }

  return getTrustedOrigins();
}
