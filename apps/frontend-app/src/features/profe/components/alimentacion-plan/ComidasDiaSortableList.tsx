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

const MAX_COMIDAS_POR_DIA = 10;

type ComidasDiaSortableListProps = {
  diaIndex: number;
  itemCount: number;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onInsertAfter: (afterIndex: number) => void;
  renderBlock: (comidaIndex: number, sortableId: string) => ReactNode;
};

export function mealSortableId(diaIndex: number, comidaIndex: number) {
  return `meal-${diaIndex}-${comidaIndex}`;
}

export function ComidasDiaSortableList({
  diaIndex,
  itemCount,
  onReorder,
  onInsertAfter,
  renderBlock,
}: ComidasDiaSortableListProps) {
  const sortableIds = Array.from({ length: itemCount }, (_, index) =>
    mealSortableId(diaIndex, index),
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

  const canAddMore = itemCount < MAX_COMIDAS_POR_DIA;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className="alimentacion-comida-list">
          {Array.from({ length: itemCount }, (_, comidaIndex) => (
            <div key={sortableIds[comidaIndex]} className="alimentacion-comida-list__segment">
              {renderBlock(comidaIndex, sortableIds[comidaIndex])}
              {canAddMore ? (
                <div className="alimentacion-comida-insert">
                  <button
                    type="button"
                    className="alimentacion-comida-insert__btn"
                    onClick={() => onInsertAfter(comidaIndex)}
                  >
                    <Plus size={15} aria-hidden="true" />
                    <span className="alimentacion-comida-insert__label">
                      Agregar comida
                    </span>
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
