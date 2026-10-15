"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Copy } from "lucide-react";
import { Button } from "@/components";
import "@/components/AppDialog.css";

type CopiarComidaADiasModalProps = {
  open: boolean;
  dias: { nombre: string }[];
  fromDiaIndex: number;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: (targetDiaIndexes: number[]) => void;
};

export function CopiarComidaADiasModal({
  open,
  dias,
  fromDiaIndex,
  title,
  description,
  confirmLabel = "Copiar",
  onCancel,
  onConfirm,
}: CopiarComidaADiasModalProps) {
  const titleId = useId();
  const messageId = useId();
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const targetDayIndexes = useMemo(
    () => dias.map((_, index) => index).filter((index) => index !== fromDiaIndex),
    [dias, fromDiaIndex],
  );

  const [selected, setSelected] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    if (!open) return;
    setSelected(new Set());
  }, [open, fromDiaIndex, title]);

  const allSelected =
    targetDayIndexes.length > 0 &&
    targetDayIndexes.every((index) => selected.has(index));

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

  function toggleDay(index: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(targetDayIndexes));
  }

  function handleConfirm() {
    const ordered = targetDayIndexes.filter((index) => selected.has(index));
    if (ordered.length === 0) return;
    onConfirm(ordered);
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="app-dialog-backdrop" role="presentation">
      <div
        className="app-dialog app-dialog--wide copiar-comida-dias-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
      >
        <div className="app-dialog__icon app-dialog__icon--prompt" aria-hidden>
          <Copy size={28} />
        </div>
        <h2 id={titleId} className="app-dialog__title">
          {title}
        </h2>
        <p id={messageId} className="app-dialog__message">
          {description}
        </p>

        <div className="copiar-comida-dias-modal__body">
          <label className="copiar-comida-dias-modal__item copiar-comida-dias-modal__item--all">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
            />
            <span>Todos los días</span>
          </label>
          <ul className="copiar-comida-dias-modal__list">
            {targetDayIndexes.map((index) => (
              <li key={`copy-target-${index}`}>
                <label className="copiar-comida-dias-modal__item">
                  <input
                    type="checkbox"
                    checked={selected.has(index)}
                    onChange={() => toggleDay(index)}
                  />
                  <span>{dias[index]?.nombre ?? `Día ${index + 1}`}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="app-dialog__actions">
          <Button
            type="button"
            autoFocus
            disabled={selected.size === 0}
            onClick={handleConfirm}
          >
            {confirmLabel}
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
