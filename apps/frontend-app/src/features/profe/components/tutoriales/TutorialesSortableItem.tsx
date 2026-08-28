"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Button } from "@/components";
import { getYoutubeEmbedUrl } from "@/features/alumna/lib/rutina-day";
import type { Tutorial } from "@/features/profe/hooks/useTutoriales";

type TutorialesSortableItemProps = {
  tutorial: Tutorial;
  position: number;
  isProcessing: boolean;
  disabled?: boolean;
  onEdit: (tutorial: Tutorial) => void;
  onDelete: (tutorial: Tutorial) => void;
};

export function TutorialesSortableItem({
  tutorial,
  position,
  isProcessing,
  disabled = false,
  onEdit,
  onDelete,
}: TutorialesSortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tutorial.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const embedUrl = getYoutubeEmbedUrl(tutorial.videoUrl);

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`ejercicio-item tutorial-sortable-item${
        isDragging ? " is-dragging" : ""
      }`}
    >
      <div className="tutorial-sortable-item__toolbar">
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="tutorial-sortable-handle"
          aria-label={`Reordenar tutorial ${tutorial.titulo}`}
          disabled={disabled}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} aria-hidden />
        </button>
        <span className="tutorial-sortable-item__position">#{position}</span>
      </div>

      <div className="ejercicio-item__body">
        <div className="ejercicio-item__info">
          <div className="ejercicio-item__header">
            <div className="ejercicio-item__content">
              <h3>
                {tutorial.titulo}
                {!tutorial.activo ? (
                  <span className="tutorial-badge">Oculto</span>
                ) : null}
              </h3>
              {tutorial.descripcion ? (
                <p className="ejercicio-item__descripcion">
                  {tutorial.descripcion}
                </p>
              ) : null}
              <p className="tutorial-meta">
                {tutorial.activo ? "Visible" : "Oculto"}
              </p>
              <a
                className="auth-link"
                href={tutorial.videoUrl}
                target="_blank"
                rel="noreferrer"
              >
                Abrir en YouTube
              </a>
            </div>
            <div className="ejercicio-item__actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onEdit(tutorial)}
                disabled={isProcessing || disabled}
              >
                Editar
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onDelete(tutorial)}
                disabled={isProcessing || disabled}
              >
                {isProcessing ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>

        <div className="ejercicio-item__media">
          {embedUrl ? (
            <div className="ejercicio-video">
              <iframe
                title={`Video de ${tutorial.titulo}`}
                src={embedUrl}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="alumnas-panel__status">
              No se pudo incrustar este link, pero podés abrirlo en YouTube.
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
