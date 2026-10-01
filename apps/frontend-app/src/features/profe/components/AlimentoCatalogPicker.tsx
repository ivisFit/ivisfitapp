"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components";
import { apiFetch } from "@/lib/api";
import { mapDocId } from "@/lib/map-doc-id";
import { profeCatalogoAlimentosRoute } from "@/routes/paths";
import {
  ALIMENTO_CATEGORIA_OPTIONS,
  type Alimento,
  type AlimentoApiDoc,
  type AlimentoCategoria,
} from "@/features/profe/types/alimento";
import { useAlimentosBusqueda } from "@/features/profe/hooks/useAlimentos";
import { AlimentoInlineCreateForm } from "@/features/profe/components/AlimentoInlineCreateForm";

const BUILDER_CATEGORIA_LABELS: Record<AlimentoCategoria, string> = {
  proteina: "Proteínas",
  carbohidrato: "Carbohidratos",
  grasa: "Grasas",
  verdura: "Verduras",
  fruta: "Frutas",
  lacteo: "Lácteos",
  legumbre: "Legumbres",
  condimento: "Condimentos",
  bebida: "Bebidas",
  otro: "Otros",
};

function mapAlimento(doc: AlimentoApiDoc): Alimento | null {
  const id = mapDocId(doc);
  if (!id) return null;
  return {
    id,
    nombre: doc.nombre,
    categoria: doc.categoria,
    porcionReferencia: doc.porcionReferencia,
    macrosPorPorcion: doc.macrosPorPorcion,
    notas: doc.notas ?? "",
    activo: doc.activo,
  };
}

type AlimentoCatalogPickerProps = {
  disabled?: boolean;
  onSelect: (alimento: Alimento) => void;
};

export function AlimentoCatalogPicker({
  disabled,
  onSelect,
}: AlimentoCatalogPickerProps) {
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [categoria, setCategoria] = useState<AlimentoCategoria>("proteina");
  const [busqueda, setBusqueda] = useState("");
  const [categoriaItems, setCategoriaItems] = useState<Alimento[]>([]);
  const [categoriaLoading, setCategoriaLoading] = useState(false);
  const [categoriaLoaded, setCategoriaLoaded] = useState(false);
  const [categoriaReloadKey, setCategoriaReloadKey] = useState(0);

  const { resultados, loading, catalogEmpty, noMatches, catalogLoaded, refetchCatalog } =
    useAlimentosBusqueda(busqueda, { enabled: open });

  const fetchCategoriaItems = useCallback(
    (signal?: AbortSignal) => {
      setCategoriaLoading(true);
      setCategoriaLoaded(false);
      return apiFetch<AlimentoApiDoc[]>(
        `/api/alimentos?categoria=${encodeURIComponent(categoria)}&soloActivos=true`,
        { signal },
      )
        .then((data) => {
          setCategoriaItems(
            data
              .map(mapAlimento)
              .filter((item): item is Alimento => item !== null)
              .sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
          );
          setCategoriaLoaded(true);
        })
        .catch((err) => {
          if (err instanceof Error && err.name === "AbortError") return;
          setCategoriaItems([]);
          setCategoriaLoaded(true);
        })
        .finally(() => {
          if (!signal?.aborted) setCategoriaLoading(false);
        });
    },
    [categoria],
  );

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    void fetchCategoriaItems(controller.signal);

    return () => controller.abort();
  }, [open, categoria, categoriaReloadKey, fetchCategoriaItems]);

  function closeModal() {
    setOpen(false);
    setShowCreate(false);
    setBusqueda("");
  }

  function openCreateForm() {
    setShowCreate(true);
  }

  function handleCreated(alimento: Alimento) {
    setCategoriaReloadKey((k) => k + 1);
    refetchCatalog();
    onSelect(alimento);
    closeModal();
  }

  const listaVisible = useMemo(() => {
    const trimmed = busqueda.trim();
    if (trimmed.length >= 2) return resultados;
    return categoriaItems;
  }, [busqueda, resultados, categoriaItems]);

  const listaLoading =
    busqueda.trim().length >= 2 ? loading : categoriaLoading;

  const emptyCatalog = catalogLoaded && catalogEmpty;
  const emptyCategoria =
    categoriaLoaded && !categoriaLoading && categoriaItems.length === 0;
  const emptyBusqueda = busqueda.trim().length >= 2 && noMatches;
  const busquedaTrim = busqueda.trim();

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        Elegir del catálogo
      </Button>

      {open ? (
        <div
          className="alimento-catalog-picker__backdrop"
          role="presentation"
          onClick={closeModal}
        />
      ) : null}

      {open ? (
        <div
          className="alimento-catalog-picker"
          role="dialog"
          aria-modal="true"
          aria-labelledby="alimento-catalog-picker-title"
        >
          <header className="alimento-catalog-picker__header">
            <div>
              <h3 id="alimento-catalog-picker-title">Elegir del catálogo</h3>
              <p>Buscá o filtrá por categoría. También podés seguir escribiendo libre.</p>
            </div>
            <div className="alimento-catalog-picker__header-actions">
              {!showCreate ? (
                <Button type="button" variant="ghost" onClick={openCreateForm}>
                  + Nuevo alimento
                </Button>
              ) : null}
              <Button type="button" variant="ghost" onClick={closeModal}>
                Cerrar
              </Button>
            </div>
          </header>

          {showCreate ? (
            <AlimentoInlineCreateForm
              initialNombre={busquedaTrim.length >= 2 ? busquedaTrim : ""}
              initialCategoria={categoria}
              onCreated={handleCreated}
              onCancel={() => setShowCreate(false)}
            />
          ) : (
            <>
              <Input
                label="Buscar en todo el catálogo"
                name="catalog-busqueda"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Ej. pollo, avena..."
              />

              <div
                className="alimento-catalog-picker__categories"
                role="tablist"
                aria-label="Categorías de alimentos"
              >
                {ALIMENTO_CATEGORIA_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="tab"
                    aria-selected={categoria === option.value}
                    className={
                      categoria === option.value
                        ? "alimento-catalog-picker__category is-active"
                        : "alimento-catalog-picker__category"
                    }
                    onClick={() => setCategoria(option.value)}
                  >
                    {BUILDER_CATEGORIA_LABELS[option.value]}
                  </button>
                ))}
              </div>

              <div className="alimento-catalog-picker__list" role="listbox">
                {listaLoading ? (
                  <p className="alimento-autocomplete__loading" role="status">
                    Cargando alimentos…
                  </p>
                ) : null}
                {emptyCatalog ? (
                  <div className="alimento-catalog-picker__empty" role="status">
                    <p className="alimento-autocomplete__empty">
                      No hay alimentos en el catálogo todavía.
                    </p>
                    <Button type="button" onClick={openCreateForm}>
                      Agregar al catálogo
                    </Button>
                  </div>
                ) : null}
                {!emptyCatalog && emptyCategoria && busquedaTrim.length < 2 ? (
                  <div className="alimento-catalog-picker__empty" role="status">
                    <p className="alimento-autocomplete__empty">
                      No hay ítems en {BUILDER_CATEGORIA_LABELS[categoria]}.
                    </p>
                    <Button type="button" onClick={openCreateForm}>
                      Agregar al catálogo
                    </Button>
                  </div>
                ) : null}
                {emptyBusqueda ? (
                  <div className="alimento-catalog-picker__empty" role="status">
                    <p className="alimento-autocomplete__empty">
                      Sin coincidencias para «{busquedaTrim}».
                    </p>
                    <Button type="button" onClick={openCreateForm}>
                      Agregar «{busquedaTrim}» al catálogo
                    </Button>
                  </div>
                ) : null}
                {!listaLoading && listaVisible.length > 0 ? (
                  <ul className="alimento-autocomplete__results">
                    {listaVisible.map((alimento) => (
                      <li key={alimento.id}>
                        <button
                          type="button"
                          className="alimento-autocomplete__result"
                          role="option"
                          onClick={() => {
                            onSelect(alimento);
                            closeModal();
                          }}
                        >
                          <span>{alimento.nombre}</span>
                          <span>
                            {alimento.macrosPorPorcion.kcal} kcal /{" "}
                            {alimento.porcionReferencia.cantidad}
                            {alimento.porcionReferencia.unidad}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <p className="alimento-catalog-picker__footer-note">
                <Link href={profeCatalogoAlimentosRoute()} className="ap-link">
                  Ver catálogo completo
                </Link>
              </p>
            </>
          )}
        </div>
      ) : null}
    </>
  );
}
