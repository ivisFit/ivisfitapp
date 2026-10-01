"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components";
import "@/components/AppDialog.css";

type IaAplicacionModalProps = {
  open: boolean;
  onCancel: () => void;
  onApplyAll: () => void;
  onReviewEach: () => void;
};

export function IaAplicacionModal({
  open,
  onCancel,
  onApplyAll,
  onReviewEach,
}: IaAplicacionModalProps) {
  const titleId = useId();
  const messageId = useId();
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="app-dialog-backdrop" role="presentation">
      <div
        className="app-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
      >
        <div className="app-dialog__icon app-dialog__icon--prompt" aria-hidden>
          <Sparkles size={28} />
        </div>
        <h2 id={titleId} className="app-dialog__title">
          ¿Cómo aplicamos la sugerencia?
        </h2>
        <p id={messageId} className="app-dialog__message">
          Podés reemplazar toda la comida o revisar cada alimento antes de cambiarlo.
        </p>
        <div className="app-dialog__actions">
          <Button type="button" autoFocus onClick={onApplyAll}>
            Aplicar a toda la comida
          </Button>
          <Button type="button" variant="ghost" onClick={onReviewEach}>
            Revisar alimento por alimento
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
