"use client";

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
  onUpdatePlanDay: (patch: Partial<PlanContentDayDraft>) => void;
  onAddDraft: () => void;
  onUpdateDraft: (
    draftLocalId: string,
    patch: Partial<Omit<DiaPlanDraft["drafts"][number], "localId">>,
  ) => void;
  onRemoveDraft: (draftLocalId: string) => void;
  onMoveDraft: (draftLocalId: string, direction: "up" | "down") => void;
  canRemoveDia: boolean;
  canDuplicateDia?: boolean;
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
  onUpdatePlanDay,
  onAddDraft,
  onUpdateDraft,
  onRemoveDraft,
  onMoveDraft,
  canRemoveDia,
  canDuplicateDia = true,
}: RutinaDiaCardProps) {
  const [showContent, setShowContent] = useState(false);

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
          <Input
            label="Nombre del día"
            name={`nombreDia-${dia.localId}`}
            required
            placeholder="Ej: Piernas y glúteos"
            value={dia.nombreDia}
            onChange={(event) => onUpdateDia({ nombreDia: event.target.value })}
          />
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
        {dia.drafts.map((draft, index) => (
          <RutinaExerciseRow
            key={draft.localId}
            draft={draft}
            index={index}
            ejercicios={ejercicios}
            canRemove={dia.drafts.length > 1}
            canMoveUp={index > 0}
            canMoveDown={index < dia.drafts.length - 1}
            disabled={loadingEjercicios || ejercicios.length === 0}
            onUpdate={(patch) => onUpdateDraft(draft.localId, patch)}
            onRemove={() => onRemoveDraft(draft.localId)}
            onMoveUp={() => onMoveDraft(draft.localId, "up")}
            onMoveDown={() => onMoveDraft(draft.localId, "down")}
          />
        ))}

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
