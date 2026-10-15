"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CircleCheck, CircleX } from "lucide-react";
import { Button } from "@/components/Button";
import "./AppDialog.css";

export type FeedbackTone = "error" | "success";

type FeedbackModalProps = {
  /** Mensaje a mostrar. Si es vacío/null el modal no se muestra. */
  message?: string | null;
  tone?: FeedbackTone;
  title?: string;
  confirmLabel?: string;
  /** Se llama al cerrar (útil para limpiar el estado que originó el mensaje). */
  onClose?: () => void;
};

const DEFAULT_TITLE: Record<FeedbackTone, string> = {
  error: "Ocurrió un error",
  success: "Listo",
};

/**
 * Modal estándar para mensajes de éxito/error de acciones.
 * Se abre cada vez que `message` cambia a un valor no vacío.
 */
export function FeedbackModal({
  message,
  tone = "error",
  title,
  confirmLabel = "Aceptar",
  onClose,
}: FeedbackModalProps) {
  const titleId = useId();
  const messageId = useId();
  const [dismissed, setDismissed] = useState<string | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const open = Boolean(message) && dismissed !== message;

  // Un mensaje nuevo (o repetido tras limpiarse) vuelve a abrir el modal.
  useEffect(() => {
    if (!message) setDismissed(null);
  }, [message]);

  const close = () => {
    setDismissed(message ?? null);
    onClose?.();
  };

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setDismissed(message ?? null);
      onClose?.();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      restoreFocusRef.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, message]);

  if (!open || typeof document === "undefined") return null;

  const isError = tone === "error";

  return createPortal(
    <div className="app-dialog-backdrop" role="presentation">
      <div
        className="app-dialog"
        role={isError ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
      >
        <div
          className={`app-dialog__icon app-dialog__icon--${isError ? "danger" : "success"}`}
          aria-hidden
        >
          {isError ? <CircleX size={28} /> : <CircleCheck size={28} />}
        </div>
        <h2 id={titleId} className="app-dialog__title">
          {title ?? DEFAULT_TITLE[tone]}
        </h2>
        <p id={messageId} className="app-dialog__message">
          {message}
        </p>
        <div className="app-dialog__actions">
          <Button type="button" autoFocus className="app-dialog__confirm" onClick={close}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
