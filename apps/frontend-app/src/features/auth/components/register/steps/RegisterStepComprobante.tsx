"use client";

import { getProfeWhatsappUrl } from "@/features/auth/lib/register-form";

type RegisterStepComprobanteProps = {
  comprobante: File | null;
  onComprobanteChange: (file: File | null) => void;
};

export function RegisterStepComprobante({
  comprobante,
  onComprobanteChange,
}: RegisterStepComprobanteProps) {
  return (
    <div className="register-stepper__fields">
      <div className="auth-callout">
        <p>
          ¿Todavía no tenés plan o no sabés cómo pagar?{" "}
          <a
            className="auth-link"
            href={getProfeWhatsappUrl()}
            target="_blank"
            rel="noreferrer"
          >
            Escribile a la profesora por WhatsApp
          </a>
        </p>
      </div>

      <label className="register-stepper__upload" htmlFor="comprobante">
        <span className="register-stepper__upload-label">Comprobante de pago</span>
        <span className="register-stepper__upload-zone">
          <span className="register-stepper__upload-icon" aria-hidden="true">
            ↑
          </span>
          <span className="register-stepper__upload-text">
            {comprobante
              ? comprobante.name
              : "Tocá para elegir un archivo"}
          </span>
          <span className="register-stepper__upload-hint">
            PDF, JPG, PNG o WebP — máx. 5 MB
          </span>
        </span>
        <input
          id="comprobante"
          className="register-stepper__upload-input"
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          onChange={(event) =>
            onComprobanteChange(event.target.files?.[0] ?? null)
          }
        />
      </label>
    </div>
  );
}
