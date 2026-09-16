"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { TutorialesSortableItem } from "@/features/profe/components/tutoriales/TutorialesSortableItem";
import type { Tutorial } from "@/features/profe/hooks/useTutoriales";
import { uniqueListKey } from "@/lib/map-doc-id";

type TutorialesSortableListProps = {
  tutoriales: Tutorial[];
  actionId: string | null;
  isReordering: boolean;
  onEdit: (tutorial: Tutorial) => void;
  onDelete: (tutorial: Tutorial) => void;
  onReorder: (ids: string[]) => Promise<boolean>;
};

export function TutorialesSortableList({
  tutoriales,
  actionId,
  isReordering,
  onEdit,
  onDelete,
  onReorder,
}: TutorialesSortableListProps) {
  const [statusMessage, setStatusMessage] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const tutorialIds = tutoriales.map((tutorial) => tutorial.id);
  const sortableIds = tutoriales.map((tutorial, index) =>
    uniqueListKey(tutorial.id, index, tutorialIds),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortableIds.findIndex((id) => id === active.id);
    const newIndex = sortableIds.findIndex((id) => id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const nextItems = arrayMove(tutoriales, oldIndex, newIndex);
    const success = await onReorder(nextItems.map((item) => item.id));

    if (success) {
      setStatusMessage("Orden actualizado.");
      window.setTimeout(() => setStatusMessage(""), 2500);
    }
  }

  return (
    <>
      <p className="tutorial-sortable-hint" aria-live="polite">
        {statusMessage || "Arrastrá para cambiar el orden de visualización."}
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => void handleDragEnd(event)}
      >
        <SortableContext
          items={sortableIds}
          strategy={verticalListSortingStrategy}
        >
          <ul className="ejercicios-list tutorial-sortable-list">
            {tutoriales.map((tutorial, index) => {
              const sortableId = uniqueListKey(tutorial.id, index, tutorialIds);
              return (
                <TutorialesSortableItem
                  key={sortableId}
                  sortableId={sortableId}
                  tutorial={tutorial}
                  position={index + 1}
                  isProcessing={actionId === tutorial.id}
                  disabled={isReordering}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>
    </>
  );
}
