"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { PenLine, TriangleAlert } from "lucide-react";import { Button } from "@/components/Button";
import "./AppDialog.css";

export type AppDialogTone = "danger" | "warning";

export type AppDialogConfirmRequest = {
  kind: "confirm";
  title: string;
  message?: string;
  tone: AppDialogTone;
  confirmLabel: string;
  cancelLabel: string;
};

export type AppDialogPromptRequest = {
  kind: "prompt";
  title: string;
  message?: string;
  defaultValue: string;
  inputLabel: string;
  placeholder?: string;
  confirmLabel: string;
  cancelLabel: string;
};

export type AppDialogRequest = AppDialogConfirmRequest | AppDialogPromptRequest;

type AppDialogProps = {
  request: AppDialogRequest;
  onCancel: () => void;
  onConfirm: (value?: string) => void;
};

export function AppDialog({ request, onCancel, onConfirm }: AppDialogProps) {
  const titleId = useId();
  const messageId = useId();
  const inputId = useId();
  const restoreFocusRef = useRef<HTMLElement | null>(
    typeof document !== "undefined" && document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null,
  );
  const [draft, setDraft] = useState(
    request.kind === "prompt" ? request.defaultValue : "",
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onCancel();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  const tone = request.kind === "prompt" ? "prompt" : request.tone;
  const trimmedDraft = draft.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (request.kind !== "prompt" || !trimmedDraft) return;
    onConfirm(trimmedDraft);
  }

  const panel = (
    <div className="app-dialog-backdrop" role="presentation">
      <div
        className="app-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={request.message ? messageId : undefined}
      >
        <div className={`app-dialog__icon app-dialog__icon--${tone}`} aria-hidden>
          {tone === "prompt" ? <PenLine size={28} /> : <TriangleAlert size={28} />}
        </div>
        <h2 id={titleId} className="app-dialog__title">
          {request.title}
        </h2>
        {request.message ? (
          <p id={messageId} className="app-dialog__message">
            {request.message}
          </p>
        ) : null}
        <form className="app-dialog__form" onSubmit={handleSubmit}>
          {request.kind === "prompt" ? (
            <label className="field app-dialog__field" htmlFor={inputId}>
              <span className="field__label-row">
                <span className="field__label">{request.inputLabel}</span>
              </span>
              <input
                id={inputId}
                className="field__input"
                autoFocus
                value={draft}
                placeholder={request.placeholder}
                onFocus={(event) => event.currentTarget.select()}
                onChange={(event) => setDraft(event.target.value)}
              />
            </label>
          ) : null}
          <div className="app-dialog__actions">
            <Button type="button" variant="ghost" autoFocus={request.kind !== "prompt"} onClick={onCancel}>
              {request.cancelLabel}
            </Button>
            <Button
              type={request.kind === "prompt" ? "submit" : "button"}
              className={
                request.kind === "confirm" && request.tone === "danger"
                  ? "app-dialog__confirm app-dialog__confirm--danger"
                  : "app-dialog__confirm"
              }
              disabled={request.kind === "prompt" && !trimmedDraft}
              onClick={request.kind === "prompt" ? undefined : () => onConfirm()}
            >
              {request.confirmLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(panel, document.body);
}