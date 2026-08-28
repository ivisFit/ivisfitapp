"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button, Input, Pagination, Select, InfoTooltip } from "@/components";
import { ListSkeleton } from "@/components/skeletons/AppSkeleton";
import { useUrlPagination } from "@/hooks/useUrlPagination";
import { useAlimentos } from "@/features/profe/hooks/useAlimentos";
import {
  ALIMENTO_CATEGORIA_OPTIONS,
  getAlimentoCategoriaLabel,
  type Alimento,
  type AlimentoCategoria,
  type AlimentoUnidad,
} from "@/features/profe/types/alimento";

const PAGE_SIZE = 10;

function getEmptyForm() {
  return {
    nombre: "",
    categoria: "proteina" as AlimentoCategoria,
    porcionCantidad: "100",
    porcionUnidad: "g" as AlimentoUnidad,
    kcal: "",
    proteinaG: "",
    carbohidratosG: "",
    grasasG: "",
    notas: "",
  };
}

export function GestionAlimentos({
  embedded = false,
  onRefetchReady,
  onCountChange,
}: {
  embedded?: boolean;
  onRefetchReady?: (refetch: () => void) => void;
  onCountChange?: (count: number) => void;
}) {
  const {
    alimentos,
    loading,
    error,
    actionId,
    refetch,
    createAlimento,
    updateAlimento,
    deleteAlimento,
  } = useAlimentos();
  const [form, setForm] = useState(getEmptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<AlimentoCategoria | "todas">(
    "todas",
  );
  const [busqueda, setBusqueda] = useState("");

  const alimentosFiltrados = useMemo(() => {
    return alimentos.filter((alimento) => {
      if (filtroCategoria !== "todas" && alimento.categoria !== filtroCategoria) {
        return false;
      }
      if (busqueda.trim() && !alimento.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [alimentos, filtroCategoria, busqueda]);

  const totalPages = Math.max(1, Math.ceil(alimentosFiltrados.length / PAGE_SIZE));
  const { page: currentPage, setPage } = useUrlPagination(totalPages);
  const pageItems = alimentosFiltrados.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    onRefetchReady?.(refetch);
  }, [onRefetchReady, refetch]);

  useEffect(() => {
    if (!loading) {
      onCountChange?.(alimentos.length);
    }
  }, [alimentos.length, loading, onCountChange]);

  const skipPageResetRef = useRef(true);
  useEffect(() => {
    if (skipPageResetRef.current) {
      skipPageResetRef.current = false;
      return;
    }
    setPage(1);
  }, [filtroCategoria, busqueda, setPage]);

  const editingAlimento = alimentos.find((alimento) => alimento.id === editingId);
  const isSubmitting =
    actionId === "create" || (editingId !== null && actionId === editingId);

  function handleEdit(alimento: Alimento) {
    setEditingId(alimento.id);
    setForm({
      nombre: alimento.nombre,
      categoria: alimento.categoria,
      porcionCantidad: String(alimento.porcionReferencia.cantidad),
      porcionUnidad: alimento.porcionReferencia.unidad,
      kcal: String(alimento.macrosPorPorcion.kcal),
      proteinaG: String(alimento.macrosPorPorcion.proteinaG),
      carbohidratosG: String(alimento.macrosPorPorcion.carbohidratosG),
      grasasG: String(alimento.macrosPorPorcion.grasasG),
      notas: alimento.notas,
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
      categoria: form.categoria,
      porcionReferencia: {
        cantidad: Number(form.porcionCantidad) || 1,
        unidad: form.porcionUnidad,
      },
      macrosPorPorcion: {
        kcal: Number(form.kcal) || 0,
        proteinaG: Number(form.proteinaG) || 0,
        carbohidratosG: Number(form.carbohidratosG) || 0,
        grasasG: Number(form.grasasG) || 0,
      },
      notas: form.notas.trim() || undefined,
      activo: true,
    };

    const success = editingId
      ? await updateAlimento(editingId, payload)
      : await createAlimento(payload);

    if (success) resetForm();
  }

  async function handleDelete(alimento: Alimento) {
    const confirmed = window.confirm(`¿Eliminar "${alimento.nombre}" del catálogo?`);
    if (!confirmed) return;
    await deleteAlimento(alimento.id);
  }

  return (
    <>
      {!embedded ? (
        <div className="page__actions">
          <div>
            <h1>Catálogo de alimentos</h1>
            <p>Cargá cada alimento una sola vez con sus calorías y macros por porción.</p>
          </div>
          <Button type="button" variant="ghost" onClick={refetch}>
            Actualizar
          </Button>
        </div>
      ) : null}

      <section className="alimento-form-card">
        <h2>{editingAlimento ? "Editar alimento" : "Nuevo alimento"}</h2>
        <form className="alimento-form" onSubmit={handleSubmit}>
          <Input
            label="Nombre del alimento"
            name="nombre"
            required
            value={form.nombre}
            onChange={(event) =>
              setForm((current) => ({ ...current, nombre: event.target.value }))
            }
          />
          <Select
            label="Categoría"
            name="categoria"
            value={form.categoria}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                categoria: event.target.value as AlimentoCategoria,
              }))
            }
          >
            {ALIMENTO_CATEGORIA_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <div className="alimento-form__row">
            <Input
              label="Porción de referencia"
              name="porcionCantidad"
              type="number"
              min={0}
              step="any"
              required
              tooltip="Cantidad base del alimento (ej. 100 g). Los macros que cargás abajo corresponden a esta porción."
              value={form.porcionCantidad}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  porcionCantidad: event.target.value,
                }))
              }
            />
            <Select
              label="Unidad"
              name="porcionUnidad"
              value={form.porcionUnidad}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  porcionUnidad: event.target.value as AlimentoUnidad,
                }))
              }
            >
              <option value="g">Gramos (g)</option>
              <option value="ml">Mililitros (ml)</option>
              <option value="unidad">Unidad</option>
            </Select>
          </div>

          <div className="alimento-form__row alimento-form__row--macros">
            <Input
              label="Kcal"
              name="kcal"
              type="number"
              min={0}
              step="any"
              required
              tooltip="Calorías de esta porción de referencia."
              value={form.kcal}
              onChange={(event) =>
                setForm((current) => ({ ...current, kcal: event.target.value }))
              }
            />
            <Input
              label="Proteína (g)"
              name="proteinaG"
              type="number"
              min={0}
              step="any"
              required
              tooltip="Gramos de proteína de esta porción de referencia."
              value={form.proteinaG}
              onChange={(event) =>
                setForm((current) => ({ ...current, proteinaG: event.target.value }))
              }
            />
            <Input
              label="Carbohidratos (g)"
              name="carbohidratosG"
              type="number"
              min={0}
              step="any"
              required
              tooltip="Gramos de carbohidratos de esta porción de referencia."
              value={form.carbohidratosG}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  carbohidratosG: event.target.value,
                }))
              }
            />
            <Input
              label="Grasas (g)"
              name="grasasG"
              type="number"
              min={0}
              step="any"
              required
              tooltip="Gramos de grasas de esta porción de referencia."
              value={form.grasasG}
              onChange={(event) =>
                setForm((current) => ({ ...current, grasasG: event.target.value }))
              }
            />
          </div>

          <label className="field" htmlFor="notas">
            <span className="field__label">Notas (opcional)</span>
            <textarea
              id="notas"
              name="notas"
              className="field__input field__textarea"
              rows={2}
              maxLength={280}
              placeholder="Ej: cocida sin piel, escurrido, etc."
              value={form.notas}
              onChange={(event) =>
                setForm((current) => ({ ...current, notas: event.target.value }))
              }
            />
          </label>

          <div className="alimento-form__actions">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Guardando..."
                : editingAlimento
                  ? "Guardar cambios"
                  : "Agregar alimento"}
            </Button>
            {editingAlimento ? (
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

      <section className="alimentos-list-card">
        <div className="alimentos-list-card__header">
          <h2>Alimentos guardados</h2>
          <span>{alimentos.length} en el catálogo</span>
        </div>

        <div className="alimentos-list-card__filters">
          <Input
            label="Buscar"
            name="busqueda"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
          <Select
            label="Categoría"
            name="filtroCategoria"
            value={filtroCategoria}
            onChange={(event) =>
              setFiltroCategoria(event.target.value as AlimentoCategoria | "todas")
            }
          >
            <option value="todas">Todas</option>
            {ALIMENTO_CATEGORIA_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {loading ? (
          <div aria-busy="true" aria-label="Cargando alimentos">
            <ListSkeleton items={5} />
          </div>
        ) : null}

        {!loading && alimentosFiltrados.length === 0 ? (
          <p className="alumnas-panel__status">No hay alimentos que coincidan.</p>
        ) : null}

        <ul className="alimentos-list">
          {pageItems.map((alimento) => {
            const isProcessing = actionId === alimento.id;

            return (
              <li className="alimento-item" key={alimento.id}>
                <div className="alimento-item__info">
                  <div className="alimento-item__header">
                    <h3>{alimento.nombre}</h3>
                    <span className="alimento-item__categoria">
                      {getAlimentoCategoriaLabel(alimento.categoria)}
                    </span>
                  </div>
                  <div className="alimento-item__porcion">
                    <span className="alimento-item__porcion-ref">
                      Por {alimento.porcionReferencia.cantidad}
                      {alimento.porcionReferencia.unidad}
                    </span>
                    <span
                      className="alimento-item__macros"
                      aria-label="Macronutrientes por porción"
                    >
                      <span className="macro-pill macro-pill--kcal">
                        {alimento.macrosPorPorcion.kcal} kcal
                      </span>
                      <span className="macro-pill">
                        P {alimento.macrosPorPorcion.proteinaG}g
                      </span>
                      <span className="macro-pill">
                        C {alimento.macrosPorPorcion.carbohidratosG}g
                      </span>
                      <span className="macro-pill">
                        G {alimento.macrosPorPorcion.grasasG}g
                      </span>
                    </span>
                  </div>
                  {alimento.notas ? (
                    <p className="alimento-item__notas">{alimento.notas}</p>
                  ) : null}
                </div>
                <div className="alimento-item__actions">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleEdit(alimento)}
                    disabled={isProcessing}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => void handleDelete(alimento)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Eliminando..." : "Eliminar"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
        <Pagination
          page={currentPage}
          totalItems={alimentosFiltrados.length}
          pageSize={PAGE_SIZE}
          disabled={loading}
          onPageChange={setPage}
        />
      </section>
    </>
  );
}
