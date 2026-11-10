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
import { useState } from "react";
import { Button, Input } from "@/components";
import { RutinaExerciseRow } from "@/features/profe/components/RutinaExerciseRow";
import type { BancoEjercicio } from "@/features/profe/hooks/useBancoEjercicios";
import type { PlanContentDayDraft } from "@/features/profe/lib/plan-content";
import type { DiaPlanDraft } from "@/features/profe/lib/rutina-draft";

type RutinaDiaCardProps = {
  dia: DiaPlanDraft;
  diaIndex: number;
  ejercicios: BancoEjercicio[];
  loadingEjercicios: boolean;
  isAlumnaMode: boolean;
  planDayDraft: PlanContentDayDraft;
  onUpdateDia: (patch: Partial<Omit<DiaPlanDraft, "localId">>) => void;
  onRemoveDia: () => void;
  onDuplicateDia: () => void;
  onCopyDiaToAllWeeks: () => void;
  onCopyDiaToDias: () => void;
  onUpdatePlanDay: (patch: Partial<PlanContentDayDraft>) => void;
  onAddDraft: () => void;
  onUpdateDraft: (
    draftLocalId: string,
    patch: Partial<Omit<DiaPlanDraft["drafts"][number], "localId">>,
  ) => void;
  onRemoveDraft: (draftLocalId: string) => void;
  onReorderDrafts: (fromIndex: number, toIndex: number) => void;
  canRemoveDia: boolean;
  canDuplicateDia?: boolean;
  canCopyDiaToDias?: boolean;
};

export function RutinaDiaCard({
  dia,
  diaIndex,
  ejercicios,
  loadingEjercicios,
  isAlumnaMode,
  planDayDraft,
  onUpdateDia,
  onRemoveDia,
  onDuplicateDia,
  onCopyDiaToAllWeeks,
  onCopyDiaToDias,
  onUpdatePlanDay,
  onAddDraft,
  onUpdateDraft,
  onRemoveDraft,
  onReorderDrafts,
  canRemoveDia,
  canDuplicateDia = true,
  canCopyDiaToDias = true,
}: RutinaDiaCardProps) {
  const [showContent, setShowContent] = useState(false);
  const sortableIds = dia.drafts.map((draft) => draft.localId);
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
  const exercisesDisabled = loadingEjercicios || ejercicios.length === 0;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = sortableIds.findIndex((id) => id === active.id);
    const toIndex = sortableIds.findIndex((id) => id === over.id);
    if (fromIndex < 0 || toIndex < 0) return;
    onReorderDrafts(fromIndex, toIndex);
  }

  return (
    <article
      className={
        isAlumnaMode
          ? "rutina-builder__dia-card rutina-builder__dia-card--focus"
          : "rutina-builder__dia-card"
      }
    >
      <header className="rutina-builder__dia-card-header">
        <div className="rutina-builder__dia-card-title">
          <span className="rutina-builder__dia-card-badge">Día {diaIndex + 1}</span>
          <div
            className={
              isAlumnaMode
                ? "rutina-builder__dia-card-fields rutina-builder__dia-card-fields--dated"
                : "rutina-builder__dia-card-fields"
            }
          >
            <Input
              label="Nombre del día"
              name={`nombreDia-${dia.localId}`}
              required
              placeholder="Ej: Piernas y glúteos"
              value={dia.nombreDia}
              onChange={(event) => onUpdateDia({ nombreDia: event.target.value })}
            />
            {isAlumnaMode ? (
              <Input
                label="Fecha"
                name={`fecha-${dia.localId}`}
                type="date"
                required
                value={dia.fecha}
                onChange={(event) =>
                  onUpdateDia({
                    fecha: event.target.value,
                    fechaManual: true,
                  })
                }
              />
            ) : null}
          </div>
          <label className="field">
            <span className="field__label">
              Comentario para la alumna (opcional)
            </span>
            <textarea
              className="field__input field__textarea"
              name={`comentario-${dia.localId}`}
              rows={3}
              maxLength={500}
              placeholder="Ej: En las búlgaras son 10 repeticiones por lado."
              value={dia.comentario}
              onChange={(event) =>
                onUpdateDia({ comentario: event.target.value })
              }
            />
          </label>
        </div>
        {isAlumnaMode ? (
          <details className="rutina-builder__dia-menu">
            <summary
              className="rutina-builder__dia-menu-trigger"
              aria-label="Acciones del día"
            >
              <span aria-hidden="true">⋯</span>
            </summary>
            <div className="rutina-builder__dia-menu-panel">
              <button
                type="button"
                disabled={!canDuplicateDia}
                onClick={(event) => {
                  event.currentTarget.closest("details")?.removeAttribute("open");
                  onDuplicateDia();
                }}
              >
                Duplicar día
              </button>
              <button
                type="button"
                disabled={!canCopyDiaToDias}
                onClick={(event) => {
                  event.currentTarget.closest("details")?.removeAttribute("open");
                  onCopyDiaToDias();
                }}
              >
                Copiar a otros días
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.currentTarget.closest("details")?.removeAttribute("open");
                  onCopyDiaToAllWeeks();
                }}
              >
                Copiar a todas las semanas
              </button>
              <button
                type="button"
                disabled={!canRemoveDia}
                onClick={(event) => {
                  event.currentTarget.closest("details")?.removeAttribute("open");
                  onRemoveDia();
                }}
              >
                Quitar día
              </button>
            </div>
          </details>
        ) : (
          <div className="rutina-builder__dia-card-menu">
            <Button
              type="button"
              variant="ghost"
              onClick={onDuplicateDia}
              disabled={!canDuplicateDia}
            >
              Duplicar
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onCopyDiaToDias}
              disabled={!canCopyDiaToDias}
            >
              Copiar a días
            </Button>
            <Button type="button" variant="ghost" onClick={onCopyDiaToAllWeeks}>
              Copiar a todas
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onRemoveDia}
              disabled={!canRemoveDia}
            >
              Quitar
            </Button>
          </div>
        )}
      </header>

      {!isAlumnaMode ? (
        <div className="rutina-builder__dia-content-toggle">
          <button
            type="button"
            className="rutina-builder__dia-content-toggle-btn"
            aria-expanded={showContent}
            onClick={() => setShowContent((current) => !current)}
          >
            {showContent ? "Ocultar contenido visual" : "Personalizar contenido"}
          </button>
          {showContent ? (
            <div className="rutina-builder__dia-content">
              <Input
                label="Título del día"
                name={`challengeDayTitle-${dia.localId}`}
                placeholder="Día de fuerza"
                value={planDayDraft.dayTitle}
                onChange={(event) =>
                  onUpdatePlanDay({ dayTitle: event.target.value })
                }
              />
              <Input
                label="Tags del día"
                name={`challengeTags-${dia.localId}`}
                placeholder="fuerza, glúteos, energía"
                value={planDayDraft.tags}
                onChange={(event) => onUpdatePlanDay({ tags: event.target.value })}
              />
              <Input
                label="URL thumbnail del día"
                name={`challengeThumbnailUrl-${dia.localId}`}
                type="url"
                placeholder="https://..."
                value={planDayDraft.thumbnailUrl}
                onChange={(event) =>
                  onUpdatePlanDay({ thumbnailUrl: event.target.value })
                }
              />
              <Input
                label="Video de presentación (URL)"
                name={`presentationVideo-${dia.localId}`}
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={planDayDraft.presentationVideoUrl}
                onChange={(event) =>
                  onUpdatePlanDay({ presentationVideoUrl: event.target.value })
                }
              />
              <Input
                label="Video de despedida (URL)"
                name={`farewellVideo-${dia.localId}`}
                type="url"
                placeholder="https://youtu.be/..."
                value={planDayDraft.farewellVideoUrl}
                onChange={(event) =>
                  onUpdatePlanDay({ farewellVideoUrl: event.target.value })
                }
              />
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rutina-builder__dia-content rutina-builder__dia-content--alumna">
          <Input
            label="Video de presentación del día (URL)"
            name={`presentationVideo-${dia.localId}`}
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={planDayDraft.presentationVideoUrl}
            onChange={(event) =>
              onUpdatePlanDay({ presentationVideoUrl: event.target.value })
            }
          />
        </div>
      )}

      <div className="rutina-builder__dia-exercises">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
            {dia.drafts.map((draft, index) => (
              <RutinaExerciseRow
                key={draft.localId}
                draft={draft}
                index={index}
                ejercicios={ejercicios}
                canRemove={dia.drafts.length > 1}
                canDrag={dia.drafts.length > 1}
                disabled={exercisesDisabled}
                onUpdate={(patch) => onUpdateDraft(draft.localId, patch)}
                onRemove={() => onRemoveDraft(draft.localId)}
              />
            ))}
          </SortableContext>
        </DndContext>

        <Button
          type="button"
          variant="ghost"
          onClick={onAddDraft}
          disabled={loadingEjercicios || ejercicios.length === 0}
        >
          + Agregar ejercicio
        </Button>
      </div>
    </article>
  );
}
