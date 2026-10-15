"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";

export const MAX_ESTRUCTURA_COMIDAS = 10;

type EstructuraComidasSortableListProps = {
  itemCount: number;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onInsertAfter: (afterIndex: number) => void;
  renderRow: (index: number, sortableId: string) => ReactNode;
};

export function estructuraSortableId(index: number) {
  return `estructura-slot-${index}`;
}

export function EstructuraComidasSortableList({
  itemCount,
  onReorder,
  onInsertAfter,
  renderRow,
}: EstructuraComidasSortableListProps) {
  const sortableIds = Array.from({ length: itemCount }, (_, index) =>
    estructuraSortableId(index),
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortableIds.findIndex((id) => id === active.id);
    const newIndex = sortableIds.findIndex((id) => id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    onReorder(oldIndex, newIndex);
  }

  const canAddMore = itemCount < MAX_ESTRUCTURA_COMIDAS;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <ol className="ap-slots">
          {Array.from({ length: itemCount }, (_, index) => (
            <li
              key={sortableIds[index]}
              className="alimentacion-estructura-list__segment"
            >
              {renderRow(index, sortableIds[index])}
              {canAddMore ? (
                <div className="alimentacion-comida-insert">
                  <button
                    type="button"
                    className="alimentacion-comida-insert__btn"
                    onClick={() => onInsertAfter(index)}
                  >
                    <Plus size={15} aria-hidden="true" />
                    <span className="alimentacion-comida-insert__label">
                      Agregar comida
                    </span>
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}
