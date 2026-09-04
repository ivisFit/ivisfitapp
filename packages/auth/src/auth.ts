import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { twoFactor } from "better-auth/plugins";
import { sendOtpEmail, sendPasswordResetEmail } from "@ivisfit/mail";
import { getDb, getMongoClient } from "./mongo.js";
import { syncUsuarioAfterCreate } from "./hooks/sync-usuario.js";

const APP_NAME = "IVIS Fit";

function parseOriginList(value: string | undefined): string[] {
  if (!value) return [];

  return value
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

function collectTrustedOrigins(
  frontendUrl: string | undefined,
  baseURL: string,
): string[] {
  const candidates = [
    ...parseOriginList(frontendUrl),
    ...parseOriginList(baseURL),
    ...parseOriginList(process.env.TRUSTED_ORIGINS),
    ...parseOriginList(process.env.CORS_ALLOWED_ORIGINS),
  ];

  return [...new Set(candidates)];
}

export function getTrustedOrigins(): string[] {
  const baseURL = process.env.BETTER_AUTH_URL;
  if (!baseURL) {
    return collectTrustedOrigins(process.env.FRONTEND_URL, "");
  }
  return collectTrustedOrigins(process.env.FRONTEND_URL, baseURL);
}

function getAuthConfig() {
  const secret = process.env.BETTER_AUTH_SECRET;
  const baseURL = process.env.BETTER_AUTH_URL;
  const frontendUrl = process.env.FRONTEND_URL;

  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET no está definida en las variables de entorno",
    );
  }

  if (!baseURL) {
    throw new Error(
      "BETTER_AUTH_URL no está definida en las variables de entorno",
    );
  }

  return {
    appName: APP_NAME,
    database: mongodbAdapter(getDb(), {
      client: getMongoClient(),
      // MongoDB local (sin replica set) no soporta transacciones
      transaction: false,
    }),
    baseURL,
    secret,
    trustedOrigins: getTrustedOrigins(),
    advanced: {
      useSecureCookies: baseURL.startsWith("https://"),
    },
    emailAndPassword: {
      enabled: true,
      autoSignIn: false,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({
        user,
        url,
      }: {
        user: { email: string };
        url: string;
      }) => {
        void sendPasswordResetEmail({
          to: user.email,
          resetUrl: url,
          appName: APP_NAME,
        });
      },
    },
    plugins: [
      twoFactor({
        issuer: APP_NAME,
        skipVerificationOnEnable: true,
        otpOptions: {
          async sendOTP({ user, otp }) {
            await sendOtpEmail({
              to: user.email,
              code: otp,
              appName: APP_NAME,
            });
          },
        },
      }),
    ],
    user: {
      additionalFields: {
        rol: {
          type: "string" as const,
          required: true,
        },
        telefono: {
          type: "string" as const,
          required: false,
        },
        mutualista: {
          type: "string" as const,
          required: false,
        },
        sexo: {
          type: "string" as const,
          required: false,
        },
        alturaCm: {
          type: "string" as const,
          required: false,
        },
        fechaNacimiento: {
          type: "string" as const,
          required: false,
        },
        coberturaEmergenciaMedica: {
          type: "string" as const,
          required: false,
        },
        lesionesPatologias: {
          type: "string" as const,
          required: false,
        },
        alergias: {
          type: "string" as const,
          required: false,
        },
        cedula: {
          type: "string" as const,
          required: false,
        },
        metodoComprobante: {
          type: "string" as const,
          required: false,
        },
        comprobantePagoUrl: {
          type: "string" as const,
          required: false,
        },
        comprobantePagoPublicId: {
          type: "string" as const,
          required: false,
        },
        comprobantePagoNombreArchivo: {
          type: "string" as const,
          required: false,
        },
        comprobantePagoFormato: {
          type: "string" as const,
          required: false,
        },
        comprobantePagoBytes: {
          type: "string" as const,
          required: false,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user: Parameters<typeof syncUsuarioAfterCreate>[0]) => {
            await syncUsuarioAfterCreate(user);
          },
        },
      },
    },
  };
}

export const auth = betterAuth(getAuthConfig());
