"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button, Input, Pagination } from "@/components";
import { ListSkeleton } from "@/components/skeletons/AppSkeleton";
import { useUrlPagination } from "@/hooks/useUrlPagination";
import {
  type BancoEjercicio,
  useBancoEjercicios,
} from "@/features/profe/hooks/useBancoEjercicios";
import { getYoutubeEmbedUrl } from "@/lib/youtube";

const PAGE_SIZE = 10;

function getEmptyForm() {
  return { nombre: "", videoUrl: "", descripcion: "" };
}

export function BancoEjercicios({
  embedded = false,
  onRefetchReady,
  onCountChange,
}: {
  embedded?: boolean;
  onRefetchReady?: (refetch: () => void) => void;
  onCountChange?: (count: number) => void;
}) {
  const {
    ejercicios,
    loading,
    error,
    actionId,
    refetch,
    createEjercicio,
    updateEjercicio,
    deleteEjercicio,
  } = useBancoEjercicios();
  const [form, setForm] = useState(getEmptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const ejerciciosFiltrados = ejercicios.filter((ejercicio) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      ejercicio.nombre.toLowerCase().includes(q) ||
      ejercicio.descripcion.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(ejerciciosFiltrados.length / PAGE_SIZE));
  const { page: currentPage, setPage } = useUrlPagination(totalPages);
  const pageItems = ejerciciosFiltrados.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    onRefetchReady?.(refetch);
  }, [onRefetchReady, refetch]);

  useEffect(() => {
    if (!loading) {
      onCountChange?.(ejercicios.length);
    }
  }, [ejercicios.length, loading, onCountChange]);

  const editingExercise = ejercicios.find((ejercicio) => ejercicio.id === editingId);
  const isSubmitting =
    actionId === "create" || (editingId !== null && actionId === editingId);

  function handleEdit(ejercicio: BancoEjercicio) {
    setEditingId(ejercicio.id);
    setForm({
      nombre: ejercicio.nombre,
      videoUrl: ejercicio.videoUrl,
      descripcion: ejercicio.descripcion,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(getEmptyForm());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      nombre: form.nombre.trim(),
      videoUrl: form.videoUrl.trim(),
      descripcion: form.descripcion.trim(),
    };

    const success = editingId
      ? await updateEjercicio(editingId, payload)
      : await createEjercicio(payload);

    if (success) resetForm();
  }

  async function handleDelete(ejercicio: BancoEjercicio) {
    const confirmed = window.confirm(
      `¿Eliminar "${ejercicio.nombre}" del banco de ejercicios?`,
    );

    if (!confirmed) return;
    await deleteEjercicio(ejercicio.id);
  }

  return (
    <>
      {!embedded ? (
        <div className="page__actions">
          <div>
            <h1>Banco de ejercicios</h1>
            <p>Guardá cada ejercicio con su video una sola vez.</p>
          </div>
          <Button type="button" variant="ghost" onClick={refetch}>
            Actualizar
          </Button>
        </div>
      ) : null}

      <section className="ejercicio-form-card">
        <h2>{editingExercise ? "Editar ejercicio" : "Nuevo ejercicio"}</h2>
        <form className="ejercicio-form" onSubmit={handleSubmit}>
          <Input
            label="Nombre del ejercicio"
            name="nombre"
            required
            value={form.nombre}
            onChange={(event) =>
              setForm((current) => ({ ...current, nombre: event.target.value }))
            }
          />
          <Input
            label="Link de YouTube"
            name="videoUrl"
            type="url"
            required
            placeholder="https://www.youtube.com/watch?v=..."
            value={form.videoUrl}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                videoUrl: event.target.value,
              }))
            }
          />
          <label className="field" htmlFor="descripcion">
            <span className="field__label">Descripcion (opcional)</span>
            <textarea
              id="descripcion"
              name="descripcion"
              className="field__input field__textarea"
              rows={3}
              maxLength={500}
              placeholder="Indicaciones tecnicas, enfoque muscular, errores comunes..."
              value={form.descripcion}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  descripcion: event.target.value,
                }))
              }
            />
          </label>
          <div className="ejercicio-form__actions">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Guardando..."
                : editingExercise
                  ? "Guardar cambios"
                  : "Agregar ejercicio"}
            </Button>
            {editingExercise ? (
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancelar
              </Button>
            ) : null}
          </div>
        </form>
      </section>

      {error ? (
        <section>
          <p className="auth-error">{error}</p>
        </section>
      ) : null}

      <section className="ejercicios-list-card">
        <div className="ejercicios-list-card__header">
          <h2>Ejercicios guardados</h2>
          <span>{ejerciciosFiltrados.length} en el banco</span>
        </div>

        <div className="alumnas-panel__filters">
          <Input
            label="Buscar"
            name="busquedaEjercicios"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(event) => {
              setBusqueda(event.target.value);
              setPage(1);
            }}
          />
        </div>

        {loading ? (
          <div aria-busy="true" aria-label="Cargando ejercicios">
            <ListSkeleton items={4} withAvatar />
          </div>
        ) : null}

        {!loading && ejerciciosFiltrados.length === 0 ? (
          <p className="alumnas-panel__status">
            {ejercicios.length === 0
              ? "Todavía no cargaste ejercicios."
              : "Ningún ejercicio coincide con la búsqueda."}
          </p>
        ) : null}

        <ul className="ejercicios-list">
          {pageItems.map((ejercicio) => {
            const isProcessing = actionId === ejercicio.id;
            const embedUrl = getYoutubeEmbedUrl(ejercicio.videoUrl);

            return (
              <li className="ejercicio-item" key={ejercicio.id}>
                <div className="ejercicio-item__body">
                  <div className="ejercicio-item__info">
                    <div className="ejercicio-item__header">
                      <div className="ejercicio-item__content">
                        <h3>{ejercicio.nombre}</h3>
                        {ejercicio.descripcion ? (
                          <p className="ejercicio-item__descripcion">
                            {ejercicio.descripcion}
                          </p>
                        ) : null}
                        <a
                          className="auth-link"
                          href={ejercicio.videoUrl}
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
                          onClick={() => handleEdit(ejercicio)}
                          disabled={isProcessing}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => void handleDelete(ejercicio)}
                          disabled={isProcessing}
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
                          title={`Video de ${ejercicio.nombre}`}
                          src={embedUrl}
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <p className="alumnas-panel__status">
                        No se pudo incrustar este link, pero podés abrirlo en
                        YouTube.
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <Pagination
          page={currentPage}
          totalItems={ejerciciosFiltrados.length}
          pageSize={PAGE_SIZE}
          disabled={loading}
          onPageChange={setPage}
        />
      </section>
    </>
  );
}
