"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { TutorialesSortableItem } from "@/features/profe/components/tutoriales/TutorialesSortableItem";
import type { Tutorial } from "@/features/profe/hooks/useTutoriales";

type TutorialesSortableListProps = {
  tutoriales: Tutorial[];
  actionId: string | null;
  isReordering: boolean;
  sortingEnabled?: boolean;
  onEdit: (tutorial: Tutorial) => void;
  onDelete: (tutorial: Tutorial) => void;
  onReorder: (ids: string[]) => Promise<boolean>;
};

export function TutorialesSortableList({
  tutoriales,
  actionId,
  isReordering,
  sortingEnabled = true,
  onEdit,
  onDelete,
  onReorder,
}: TutorialesSortableListProps) {
  const [items, setItems] = useState(tutoriales);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    setItems(tutoriales);
  }, [tutoriales]);

  const dragDisabled = isReordering || !sortingEnabled;
  const sortableIds = items.map((tutorial) => tutorial.id);
  const activeTutorial =
    activeId != null ? items.find((item) => item.id === activeId) : null;

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

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortableIds.findIndex((id) => id === active.id);
    const newIndex = sortableIds.findIndex((id) => id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const previous = items;
    const nextItems = arrayMove(items, oldIndex, newIndex);
    setItems(nextItems);

    const success = await onReorder(nextItems.map((item) => item.id));
    if (success) {
      setStatusMessage("Orden actualizado.");
      window.setTimeout(() => setStatusMessage(""), 2500);
    } else {
      setItems(previous);
    }
  }

  const defaultHint = sortingEnabled
    ? "Usá el ícono ⋮⋮ para arrastrar y cambiar el orden."
    : "Limpiá la búsqueda para poder reordenar tutoriales.";

  return (
    <>
      <p className="tutorial-sortable-hint" aria-live="polite">
        {statusMessage || defaultHint}
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={(event) => void handleDragEnd(event)}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext
          items={sortableIds}
          strategy={verticalListSortingStrategy}
        >
          <ul className="ejercicios-list tutorial-sortable-list">
            {items.map((tutorial, index) => (
              <TutorialesSortableItem
                key={tutorial.id}
                sortableId={tutorial.id}
                tutorial={tutorial}
                position={index + 1}
                isProcessing={actionId === tutorial.id}
                disabled={dragDisabled}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
        </SortableContext>

        <DragOverlay dropAnimation={null}>
          {activeTutorial ? (
            <div className="tutorial-sortable-item tutorial-sortable-item--overlay ejercicio-item">
              <strong>{activeTutorial.titulo}</strong>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}
