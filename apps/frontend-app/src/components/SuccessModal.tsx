"use client";

import { Button } from "@/components/Button";
import "./SuccessModal.css";

interface SuccessModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

function CheckIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12.5 10.5 15 16 9" />
    </svg>
  );
}

export function SuccessModal({
  open,
  title,
  message,
  confirmLabel = "Aceptar",
  onConfirm,
}: SuccessModalProps) {
  if (!open) return null;

  const backdrop = "success-modal-backdrop";
  const panel = "success-modal";

  return (
    <div className={backdrop} role="presentation">
      <div
        className={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        aria-describedby="success-modal-message"
      >
        <div className="success-modal__icon">
          <CheckIcon />
        </div>
        <h2 id="success-modal-title" className="success-modal__title">
          {title}
        </h2>
        <p id="success-modal-message" className="success-modal__message">
          {message}
        </p>
        <Button
          type="button"
          autoFocus
          className="success-modal__confirm"
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}


