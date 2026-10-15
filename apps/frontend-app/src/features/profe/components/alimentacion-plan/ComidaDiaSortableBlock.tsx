"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";

type ComidaDiaSortableBlockProps = {
  sortableId: string;
  disabled?: boolean;
  dragLabel: string;
  onRemove?: () => void;
  canRemove?: boolean;
  header: ReactNode;
  children: ReactNode;
};

export function ComidaDiaSortableBlock({
  sortableId,
  disabled = false,
  dragLabel,
  onRemove,
  canRemove = true,
  header,
  children,
}: ComidaDiaSortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortableId,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`alimentacion-comida-block${
        isDragging ? " alimentacion-comida-block--dragging" : ""
      }`}
    >
      <div className="alimentacion-comida-block__header-row">
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="alimentacion-comida-block__drag-handle"
          aria-label={dragLabel}
          disabled={disabled}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} aria-hidden="true" />
        </button>
        <div className="alimentacion-comida-block__header-main">{header}</div>
        {canRemove && onRemove ? (
          <button
            type="button"
            className="btn btn--ghost ap-btn-sm alimentacion-comida-block__remove"
            onClick={onRemove}
          >
            Quitar
          </button>
        ) : null}
      </div>
      {children}
    </article>
  );
}
