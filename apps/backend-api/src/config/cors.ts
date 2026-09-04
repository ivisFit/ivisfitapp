import { getTrustedOrigins } from "@ivisfit/auth";

function parseOriginList(value: string | undefined): string[] {
  if (!value) return [];

  return [
    ...new Set(
      value
        .split(",")
        .map((origin) => origin.trim().replace(/\/$/, ""))
        .filter(Boolean),
    ),
  ];
}

/**
 * Orígenes permitidos para el middleware CORS de Express.
 * Une la lista explícita con FRONTEND_URL / BETTER_AUTH_URL / TRUSTED_ORIGINS.
 */
export function getCorsAllowedOrigins(): string[] {
  return [
    ...new Set([
      ...parseOriginList(process.env.CORS_ALLOWED_ORIGINS),
      ...getTrustedOrigins(),
    ]),
  ];
}
