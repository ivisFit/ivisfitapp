"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/Button";
import type { InstallPlatform } from "@/lib/pwa-install";
import "./PwaInstallHelpSheet.css";

type PwaInstallHelpSheetProps = {
  open: boolean;
  platform: InstallPlatform;
  secure?: boolean;
  onClose: () => void;
};

function IosShareIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3v11" />
      <path d="M8 7l4-4 4 4" />
      <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
  );
}

type HelpCopy = {
  lead: string;
  steps: { icon?: boolean; content: ReactNode }[];
};

const COPY: Record<InstallPlatform, HelpCopy> = {
  ios: {
    lead: "En iPhone y iPad, desde Safari o Chrome:",
    steps: [
      {
        icon: true,
        content: (
          <>
            Tocá <strong>Compartir</strong> en la barra del navegador.
          </>
        ),
      },
      {
        content: (
          <>
            Elegí <strong>Agregar a pantalla de inicio</strong>.
          </>
        ),
      },
      {
        content: (
          <>
            Confirmá <strong>Agregar</strong>.
          </>
        ),
      },
    ],
  },
  android: {
    lead: "En Android, desde Chrome:",
    steps: [
      { content: <>Tocá el menú <strong>⋮</strong> arriba a la derecha.</> },
      {
        content: (
          <>
            Elegí <strong>Instalar app</strong> o{" "}
            <strong>Agregar a la pantalla de inicio</strong>.
          </>
        ),
      },
      {
        content: (
          <>
            Confirmá <strong>Instalar</strong>.
          </>
        ),
      },
    ],
  },
  chromium: {
    lead: "En Chrome o Edge:",
    steps: [
      { content: <>Buscá el ícono de instalar en la barra de direcciones.</> },
      {
        content: (
          <>
            O abrí el menú <strong>⋮</strong> y elegí{" "}
            <strong>Instalar IVIS Fit</strong>.
          </>
        ),
      },
      {
        content: (
          <>
            Confirmá <strong>Instalar</strong>.
          </>
        ),
      },
    ],
  },
  "safari-mac": {
    lead: "En Safari de Mac:",
    steps: [
      {
        content: (
          <>
            Abrí el menú <strong>Archivo</strong>.
          </>
        ),
      },
      {
        content: (
          <>
            Elegí <strong>Agregar a Dock</strong>.
          </>
        ),
      },
      { content: <>Confirmá.</> },
    ],
  },
  firefox: {
    lead: "En Firefox:",
    steps: [
      { content: <>Abrí el menú de la página.</> },
      {
        content: (
          <>
            Elegí <strong>Instalar</strong>.
          </>
        ),
      },
      {
        content: (
          <>
            Confirmá <strong>Instalar</strong>.
          </>
        ),
      },
    ],
  },
};

export function PwaInstallHelpSheet({
  open,
  platform,
  secure = true,
  onClose,
}: PwaInstallHelpSheetProps) {
  const titleId = useId();
  const descriptionId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const copy = COPY[platform];

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onClose();
    }

    window.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="pwa-install-help" role="presentation">
      <button
        type="button"
        className="pwa-install-help__backdrop"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        className="pwa-install-help__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <button
          ref={closeRef}
          type="button"
          className="pwa-install-help__close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 id={titleId} className="pwa-install-help__title">
          Instalar IVIS Fit
        </h2>
        <p id={descriptionId} className="pwa-install-help__lead">
          {copy.lead}
        </p>
        {secure ? null : (
          <p className="pwa-install-help__warn">
            Este origen no es HTTPS. En el celular usá el sitio publicado para
            instalar; Safari en iPhone también puede agregar la página a inicio.
          </p>
        )}
        <ol className="pwa-install-help__steps">
          {copy.steps.map((step, index) => (
            <li key={index}>
              <span
                className={
                  step.icon
                    ? "pwa-install-help__step-icon"
                    : "pwa-install-help__step-num"
                }
                aria-hidden
              >
                {step.icon ? <IosShareIcon /> : index + 1}
              </span>
              <span>{step.content}</span>
            </li>
          ))}
        </ol>
        <div className="pwa-install-help__actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
