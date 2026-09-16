"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button, Input } from "@/components";
import { ListSkeleton } from "@/components/skeletons/AppSkeleton";
import { TutorialesSortableList } from "@/features/profe/components/tutoriales/TutorialesSortableList";
import {
  type Tutorial,
  type TutorialPayload,
  useTutoriales,
} from "@/features/profe/hooks/useTutoriales";

function getEmptyForm(): TutorialPayload {
  return {
    titulo: "",
    videoUrl: "",
    descripcion: "",
    activo: true,
  };
}

export function GestionTutoriales({
  embedded = false,
  onRefetchReady,
  onCountChange,
}: {
  embedded?: boolean;
  onRefetchReady?: (refetch: () => void) => void;
  onCountChange?: (count: number) => void;
}) {
  const {
    tutoriales,
    loading,
    error,
    actionId,
    isReordering,
    refetch,
    createTutorial,
    updateTutorial,
    deleteTutorial,
    reorderTutoriales,
  } = useTutoriales();
  const [form, setForm] = useState<TutorialPayload>(getEmptyForm);
  const [formKey, setFormKey] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const formCardRef = useRef<HTMLElement>(null);

  const tutorialesFiltrados = tutoriales.filter((tutorial) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      tutorial.titulo.toLowerCase().includes(q) ||
      (tutorial.descripcion ?? "").toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    onRefetchReady?.(refetch);
  }, [onRefetchReady, refetch]);

  useEffect(() => {
    if (!loading) {
      onCountChange?.(tutoriales.length);
    }
  }, [tutoriales.length, loading, onCountChange]);

  const isEditing = editingId !== null;
  const isSubmitting =
    actionId === "create" || (editingId !== null && actionId === editingId);

  function handleEdit(tutorial: Tutorial) {
    setEditingId(tutorial.id || null);
    setForm({
      titulo: tutorial.titulo,
      videoUrl: tutorial.videoUrl.trim(),
      descripcion: tutorial.descripcion,
      activo: tutorial.activo,
    });
    window.requestAnimationFrame(() => {
      formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      document.getElementById("tutorial-titulo")?.focus();
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(getEmptyForm());
    setFormKey((current) => current + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: TutorialPayload = {
      titulo: form.titulo.trim(),
      videoUrl: form.videoUrl.trim(),
      descripcion: form.descripcion.trim(),
      activo: form.activo,
    };

    const success = editingId
      ? await updateTutorial(editingId, payload)
      : await createTutorial(payload);

    if (!success) return;

    resetForm();
    window.setTimeout(() => {
      setForm(getEmptyForm());
    }, 0);
  }

  async function handleDelete(tutorial: Tutorial) {
    const confirmed = window.confirm(
      `¿Eliminar el tutorial "${tutorial.titulo}"?`,
    );

    if (!confirmed || !tutorial.id) return;
    await deleteTutorial(tutorial.id);
  }

  return (
    <>
      {!embedded ? (
        <div className="page__actions">
          <div>
            <h1>Tutoriales</h1>
            <p>
              Videos cortos que acompañan a las alumnas nuevas a conocer la
              aplicación.
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={refetch}>
            Actualizar
          </Button>
        </div>
      ) : null}

      <section className="ejercicio-form-card" ref={formCardRef}>
        <h2>{isEditing ? "Editar tutorial" : "Nuevo tutorial"}</h2>
        <form
          key={formKey}
          className="ejercicio-form"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <Input
            label="Título del tutorial"
            id="tutorial-titulo"
            name={`tutorial-titulo-${formKey}`}
            required
            autoComplete="off"
            placeholder="Cómo ver tu rutina"
            value={form.titulo}
            onChange={(event) =>
              setForm((current) => ({ ...current, titulo: event.target.value }))
            }
          />
          <div>
            <Input
              label="Link de YouTube"
              name={`tutorial-video-${formKey}`}
              type="text"
              inputMode="url"
              required
              autoComplete="off"
              placeholder="https://www.youtube.com/watch?v=..."
              value={form.videoUrl}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  videoUrl: event.target.value,
                }))
              }
            />
            <p className="field__hint">
              Visibilidad <strong>No listado</strong>, no Privado. Así se ve en
              la app y no aparece en el canal.
            </p>
          </div>
          <label className="field" htmlFor={`tutorial-descripcion-${formKey}`}>
            <span className="field__label">Descripción (opcional)</span>
            <textarea
              id={`tutorial-descripcion-${formKey}`}
              name={`tutorial-descripcion-${formKey}`}
              className="field__input field__textarea"
              rows={3}
              maxLength={500}
              autoComplete="off"
              placeholder="Qué explica este video..."
              value={form.descripcion}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  descripcion: event.target.value,
                }))
              }
            />
          </label>
          <label className="field ejercicio-form__checkbox" htmlFor="activo">
            <input
              id="activo"
              name="activo"
              type="checkbox"
              checked={form.activo}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  activo: event.target.checked,
                }))
              }
            />
            <span>Visible para las alumnas</span>
          </label>
          <div className="ejercicio-form__actions">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Agregar tutorial"}
            </Button>
            {isEditing ? (
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancelar
              </Button>
            ) : null}
          </div>
          {error ? <p className="auth-error">{error}</p> : null}
        </form>
      </section>

      <section className="ejercicios-list-card">
        <div className="ejercicios-list-card__header">
          <h2>Tutoriales guardados</h2>
          <span>{tutorialesFiltrados.length} en total</span>
        </div>

        <div className="alumnas-panel__filters">
          <Input
            label="Buscar"
            name="busquedaTutoriales"
            placeholder="Buscar por título..."
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </div>

        {loading ? (
          <div aria-busy="true" aria-label="Cargando tutoriales">
            <ListSkeleton items={4} withAvatar />
          </div>
        ) : null}

        {!loading && tutorialesFiltrados.length === 0 ? (
          <p className="alumnas-panel__status">
            {tutoriales.length === 0
              ? "Todavía no cargaste tutoriales."
              : "Ningún tutorial coincide con la búsqueda."}
          </p>
        ) : null}

        {!loading && tutorialesFiltrados.length > 0 ? (
          <TutorialesSortableList
            tutoriales={tutorialesFiltrados}
            actionId={actionId}
            isReordering={isReordering}
            onEdit={handleEdit}
            onDelete={(tutorial) => void handleDelete(tutorial)}
            onReorder={reorderTutoriales}
          />
        ) : null}
      </section>
    </>
  );
}
