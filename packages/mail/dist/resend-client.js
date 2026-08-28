import { Resend } from "resend";
export function getResendClient() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error("RESEND_API_KEY no está definida en las variables de entorno");
    }
    return new Resend(apiKey);
}
export function getFromEmail(appName = "IVIS Fit") {
    const from = process.env.RESEND_FROM_EMAIL?.trim();
    if (!from) {
        throw new Error("RESEND_FROM_EMAIL no está definida en las variables de entorno");
    }
    if (from.includes("<") && from.includes(">")) {
        return from;
    }
    return `${appName} <${from}>`;
}
export function describeResendSendError(error, fallback) {
    const message = error && typeof error === "object" && "message" in error
        ? String(error.message)
        : "";
    if (/not verified/i.test(message) || /domain is not verified/i.test(message)) {
        return (`${fallback}: el dominio de RESEND_FROM_EMAIL no está verificado en Resend. ` +
            "Verificá el dominio en resend.com/domains y usá un from de ese dominio (ej. noreply@ivisfit.com).");
    }
    if (/only send testing emails to your own/i.test(message)) {
        return (`${fallback}: con onboarding@resend.dev solo podés enviar a tu propio email. ` +
            "Verificá tu dominio en Resend para enviar a otras cuentas.");
    }
    if (/api.?key|unauthorized|invalid api/i.test(message)) {
        return `${fallback}: revisá RESEND_API_KEY en el backend.`;
    }
    return message ? `${fallback}: ${message}` : fallback;
}
//# sourceMappingURL=resend-client.js.map