"use client";

import { useEffect } from "react";
import { AgendaDiaDetalle } from "@/features/profe/components/agenda/AgendaDiaDetalle";
import type { Reunion } from "@/features/profe/types/reunion";

type AgendaDiaModalProps = {
  dateKey: string | null;
  reuniones: Reunion[];
  actionId: string | null;
  onClose: () => void;
  onAdd: () => void;
  onEdit: (reunion: Reunion) => void;
  onDelete: (reunion: Reunion) => void;
};

export function AgendaDiaModal({
  dateKey,
  reuniones,
  actionId,
  onClose,
  onAdd,
  onEdit,
  onDelete,
}: AgendaDiaModalProps) {
  useEffect(() => {
    if (!dateKey) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [dateKey, onClose]);

  if (!dateKey) return null;

  return (
    <div
      className="agenda-dia-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="agenda-dia-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="agenda-dia-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="agenda-dia-modal__close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>

        <AgendaDiaDetalle
          dateKey={dateKey}
          reuniones={reuniones}
          actionId={actionId}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
