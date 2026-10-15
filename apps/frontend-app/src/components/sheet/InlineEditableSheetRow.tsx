"use client";

import { Check, Pencil, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type InlineFieldKind =
  | "text"
  | "email"
  | "tel"
  | "date"
  | "number"
  | "select"
  | "textarea";

type SelectOption = { value: string; label: string };

type InlineEditableSheetRowProps = {
  label: string;
  value?: string;
  /** Texto mostrado en modo lectura (si difiere del valor en edición). */
  displayValue?: string;
  pending?: boolean;
  highlight?: boolean;
  editable?: boolean;
  kind?: InlineFieldKind;
  selectOptions?: SelectOption[];
  emptyLabel?: string;
  pendingTitle?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  onSave?: (value: string) => Promise<void>;
};

function displayOrEmpty(value?: string, emptyLabel = "Sin dato") {
  return value?.trim() ? value : emptyLabel;
}

export function InlineEditableSheetRow({
  label,
  value = "",
  displayValue,
  pending,
  highlight,
  editable = true,
  kind = "text",
  selectOptions,
  emptyLabel = "Sin dato",
  pendingTitle = "Pendiente de revisión",
  inputMode,
  onSave,
}: InlineEditableSheetRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    null,
  );

  const readLabel = displayValue !== undefined
    ? displayOrEmpty(displayValue, emptyLabel)
    : displayOrEmpty(value, emptyLabel);
  const isEmpty = !((displayValue ?? value)?.trim());

  useEffect(() => {
    if (!editing) {
      setDraft(value);
    }
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      if (inputRef.current instanceof HTMLInputElement && kind !== "select") {
        inputRef.current.select();
      }
    }
  }, [editing, kind]);

  function cancel() {
    setDraft(value);
    setError(null);
    setEditing(false);
  }

  async function commit() {
    if (!onSave) {
      setEditing(false);
      return;
    }
    const trimmed = draft.trim();
    if (trimmed === value.trim()) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(trimmed);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  function startEdit() {
    if (!editable || !onSave || saving) return;
    setDraft(value);
    setError(null);
    setEditing(true);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancel();
    }
    if (event.key === "Enter" && kind !== "textarea") {
      event.preventDefault();
      void commit();
    }
  }

  const canEdit = editable && Boolean(onSave);

  return (
    <div
      className={`alumna-sheet__row alumna-sheet__row--inline${highlight && isEmpty ? " alumna-sheet__row--empty" : ""}${editing ? " alumna-sheet__row--editing" : ""}`}
    >
      <dt>
        {label}
        {pending ? (
          <span className="alumna-detail__pending-badge" title={pendingTitle}>
            ⏳
          </span>
        ) : null}
      </dt>
      <dd className="alumna-sheet__value-cell">
        {editing ? (
          <>
            <div
              className={`alumna-sheet__inline-edit-wrap${kind === "textarea" ? " alumna-sheet__inline-edit-wrap--textarea" : ""}`}
            >
              {kind === "textarea" ? (
                <textarea
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                  className="alumna-sheet__inline-edit alumna-sheet__inline-edit--textarea"
                  value={draft}
                  rows={2}
                  disabled={saving}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label={label}
                />
              ) : kind === "select" ? (
                <select
                  ref={inputRef as React.RefObject<HTMLSelectElement>}
                  className="alumna-sheet__inline-edit alumna-sheet__inline-edit--select"
                  value={draft}
                  disabled={saving}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label={label}
                >
                  {selectOptions?.map((opt) => (
                    <option key={opt.value || "__empty"} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  className="alumna-sheet__inline-edit"
                  type={kind === "number" ? "number" : kind}
                  inputMode={inputMode}
                  value={draft}
                  disabled={saving}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label={label}
                />
              )}
              <span
                className="alumna-sheet__inline-actions"
                role="group"
                aria-label="Confirmar edición"
              >
                <button
                  type="button"
                  className="alumna-sheet__inline-btn"
                  onClick={() => void commit()}
                  disabled={saving}
                  aria-label="Guardar"
                >
                  <Check size={14} aria-hidden />
                </button>
                <button
                  type="button"
                  className="alumna-sheet__inline-btn"
                  onClick={cancel}
                  disabled={saving}
                  aria-label="Cancelar"
                >
                  <X size={14} aria-hidden />
                </button>
              </span>
            </div>
          </>
        ) : (
          <>
            <span
              className={`alumna-sheet__value${isEmpty ? " alumna-sheet__value--empty" : ""}`}
            >
              {readLabel}
            </span>
            {canEdit ? (
              <button
                type="button"
                className="alumna-sheet__inline-btn alumna-sheet__inline-btn--edit"
                onClick={startEdit}
                disabled={saving}
                aria-label={`Editar ${label}`}
              >
                <Pencil size={13} aria-hidden />
              </button>
            ) : null}
          </>
        )}
        {error ? (
          <span className="alumna-sheet__inline-error" role="alert">
            {error}
          </span>
        ) : null}
      </dd>
    </div>
  );
}
