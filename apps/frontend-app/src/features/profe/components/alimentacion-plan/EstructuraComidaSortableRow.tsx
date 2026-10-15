"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode, PointerEvent } from "react";

type EstructuraComidaSortableRowProps = {
  sortableId: string;
  index: number;
  dragLabel: string;
  onRemove?: () => void;
  canRemove?: boolean;
  children: ReactNode;
  meta: ReactNode;
};

function stopDragPointer(event: PointerEvent) {
  event.stopPropagation();
}

export function EstructuraComidaSortableRow({
  sortableId,
  index,
  dragLabel,
  onRemove,
  canRemove = true,
  children,
  meta,
}: EstructuraComidaSortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`alimentacion-estructura-row${
        isDragging ? " alimentacion-estructura-row--dragging" : ""
      }`}
      aria-label={dragLabel}
      {...attributes}
      {...listeners}
    >
      <div className="alimentacion-estructura-row__aside">
        <span className="alimentacion-estructura-row__index" aria-hidden="true">
          {index + 1}
        </span>
        {canRemove && onRemove ? (
          <div className="alimentacion-estructura-row__actions">
            <button
              type="button"
              className="btn btn--ghost ap-btn-sm"
              onClick={onRemove}
              onPointerDown={stopDragPointer}
            >
              Quitar
            </button>
          </div>
        ) : null}
      </div>
      <div
        className="alimentacion-estructura-row__fields"
        onPointerDown={stopDragPointer}
      >
        {children}
      </div>
      <div
        className="alimentacion-estructura-row__meta-host"
        onPointerDown={stopDragPointer}
      >
        {meta}
      </div>
    </div>
  );
}
