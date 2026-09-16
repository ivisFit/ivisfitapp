"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button, Input, Pagination } from "@/components";
import { ListSkeleton } from "@/components/skeletons/AppSkeleton";
import { useUrlPagination } from "@/hooks/useUrlPagination";
import { YoutubePreview } from "@/features/profe/components/YoutubePreview";
import {
  type BancoEjercicio,
  useBancoEjercicios,
} from "@/features/profe/hooks/useBancoEjercicios";
import { uniqueListKey } from "@/lib/map-doc-id";

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
  const [formKey, setFormKey] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const formCardRef = useRef<HTMLElement>(null);

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
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = ejerciciosFiltrados.slice(pageStart, pageStart + PAGE_SIZE);
  const ejercicioIds = ejerciciosFiltrados.map((ejercicio) => ejercicio.id);

  useEffect(() => {
    onRefetchReady?.(refetch);
  }, [onRefetchReady, refetch]);

  useEffect(() => {
    if (loading) return;
    if (ejerciciosFiltrados.length === 0) return;
    if (pageItems.length === 0 && currentPage > 1) {
      setPage(currentPage - 1);
    }
  }, [
    loading,
    ejerciciosFiltrados.length,
    pageItems.length,
    currentPage,
    setPage,
  ]);

  useEffect(() => {
    if (!loading) {
      onCountChange?.(ejercicios.length);
    }
  }, [ejercicios.length, loading, onCountChange]);

  const isEditing = editingId !== null;
  const isSubmitting =
    actionId === "create" || (editingId !== null && actionId === editingId);

  function handleEdit(ejercicio: BancoEjercicio) {
    setEditingId(ejercicio.id || null);
    setForm({
      nombre: ejercicio.nombre,
      videoUrl: ejercicio.videoUrl.trim(),
      descripcion: ejercicio.descripcion,
    });
    window.requestAnimationFrame(() => {
      formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      document.getElementById("ejercicio-nombre")?.focus();
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(getEmptyForm());
    setFormKey((current) => current + 1);
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

    if (!success) return;

    resetForm();
    window.setTimeout(() => {
      setForm(getEmptyForm());
    }, 0);
  }

  async function handleDelete(ejercicio: BancoEjercicio) {
    const confirmed = window.confirm(
      `¿Eliminar "${ejercicio.nombre}" del banco de ejercicios?`,
    );

    if (!confirmed || !ejercicio.id) return;
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

      <section className="ejercicio-form-card" ref={formCardRef}>
        <h2>{isEditing ? "Editar ejercicio" : "Nuevo ejercicio"}</h2>
        <form
          key={formKey}
          className="ejercicio-form"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <Input
            label="Nombre del ejercicio"
            id="ejercicio-nombre"
            name={`ejercicio-nombre-${formKey}`}
            required
            autoComplete="off"
            value={form.nombre}
            onChange={(event) =>
              setForm((current) => ({ ...current, nombre: event.target.value }))
            }
          />
          <div>
            <Input
              label="Link de YouTube"
              name={`ejercicio-video-${formKey}`}
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
          <label className="field" htmlFor={`ejercicio-descripcion-${formKey}`}>
            <span className="field__label">Descripcion (opcional)</span>
            <textarea
              id={`ejercicio-descripcion-${formKey}`}
              name={`ejercicio-descripcion-${formKey}`}
              className="field__input field__textarea"
              rows={3}
              maxLength={500}
              autoComplete="off"
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
                : isEditing
                  ? "Guardar cambios"
                  : "Agregar ejercicio"}
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
          {pageItems.map((ejercicio, index) => {
            const isProcessing = actionId === ejercicio.id;
            const listKey = uniqueListKey(
              ejercicio.id,
              pageStart + index,
              ejercicioIds,
            );

            return (
              <li className="ejercicio-item" key={listKey}>
                <div className="ejercicio-item__body">
                  <div className="ejercicio-item__info">
                    <div className="ejercicio-item__header">
                      <h3>{ejercicio.nombre}</h3>
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

                  <div className="ejercicio-item__media">
                    <YoutubePreview
                      videoUrl={ejercicio.videoUrl}
                      title={ejercicio.nombre}
                    />
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
