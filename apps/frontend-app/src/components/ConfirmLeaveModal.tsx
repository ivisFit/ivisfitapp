"use client";

import { useEffect } from "react";
import { Button } from "@/components/Button";
import "./ConfirmLeaveModal.css";

interface ConfirmLeaveModalProps {
  open: boolean;
  title?: string;
  message?: string;
  stayLabel?: string;
  leaveLabel?: string;
  onStay: () => void;
  onLeave: () => void;
}

export function ConfirmLeaveModal({
  open,
  title = "¿Salir sin guardar?",
  message = "Tenés cambios sin guardar. Si salís ahora, se van a perder.",
  stayLabel = "Seguir editando",
  leaveLabel = "Salir sin guardar",
  onStay,
  onLeave,
}: ConfirmLeaveModalProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onStay();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onStay]);

  if (!open) return null;

  return (
    <div className="confirm-leave-modal-backdrop" role="presentation">
      <div
        className="confirm-leave-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-leave-modal-title"
        aria-describedby="confirm-leave-modal-message"
      >
        <h2 id="confirm-leave-modal-title" className="confirm-leave-modal__title">
          {title}
        </h2>
        <p id="confirm-leave-modal-message" className="confirm-leave-modal__message">
          {message}
        </p>
        <div className="confirm-leave-modal__actions">
          <Button
            type="button"
            autoFocus
            className="confirm-leave-modal__stay"
            onClick={onStay}
          >
            {stayLabel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="confirm-leave-modal__leave"
            onClick={onLeave}
          >
            {leaveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
