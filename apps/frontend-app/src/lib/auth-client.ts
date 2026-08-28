import { inferAdditionalFields } from "better-auth/client/plugins";
import { twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { notifyTwoFactorRedirect } from "./two-factor-redirect";

/** Rutas relativas → mismo origen; el proxy en app/api/[...path] reenvía al backend. */
export const authClient = createAuthClient({
  baseURL: "",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    inferAdditionalFields({
      user: {
        rol: { type: "string", required: true },
        telefono: { type: "string", required: false },
        mutualista: { type: "string", required: false },
        sexo: { type: "string", required: false },
        alturaCm: { type: "string", required: false },
        fechaNacimiento: { type: "string", required: false },
        coberturaEmergenciaMedica: { type: "string", required: false },
        lesionesPatologias: { type: "string", required: false },
        alergias: { type: "string", required: false },
        cedula: { type: "string", required: false },
        metodoComprobante: { type: "string", required: false },
        comprobantePagoUrl: { type: "string", required: false },
        comprobantePagoPublicId: { type: "string", required: false },
        comprobantePagoNombreArchivo: { type: "string", required: false },
        comprobantePagoFormato: { type: "string", required: false },
        comprobantePagoBytes: { type: "string", required: false },
      },
    }),
    twoFactorClient({
      onTwoFactorRedirect() {
        notifyTwoFactorRedirect();
      },
    }),
  ],
});

export type Session = typeof authClient.$Infer.Session;
export type AuthUser = Session["user"];
