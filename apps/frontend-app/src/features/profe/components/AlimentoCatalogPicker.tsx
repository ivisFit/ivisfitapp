"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input } from "@/components";
import { apiFetch } from "@/lib/api";
import { mapDocId } from "@/lib/map-doc-id";
import {
  ALIMENTO_CATEGORIA_OPTIONS,
  type Alimento,
  type AlimentoApiDoc,
  type AlimentoCategoria,
} from "@/features/profe/types/alimento";
import { useAlimentosBusqueda } from "@/features/profe/hooks/useAlimentos";

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
  const [categoria, setCategoria] = useState<AlimentoCategoria>("proteina");
  const [busqueda, setBusqueda] = useState("");
  const [categoriaItems, setCategoriaItems] = useState<Alimento[]>([]);
  const [categoriaLoading, setCategoriaLoading] = useState(false);
  const [categoriaLoaded, setCategoriaLoaded] = useState(false);

  const { resultados, loading, catalogEmpty, noMatches, catalogLoaded } =
    useAlimentosBusqueda(busqueda, { enabled: open });

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    setCategoriaLoading(true);
    setCategoriaLoaded(false);

    void apiFetch<AlimentoApiDoc[]>(
      `/api/alimentos?categoria=${encodeURIComponent(categoria)}&soloActivos=true`,
      { signal: controller.signal },
    )
      .then((data) => {
        if (controller.signal.aborted) return;
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
        if (!controller.signal.aborted) {
          setCategoriaItems([]);
          setCategoriaLoaded(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCategoriaLoading(false);
      });

    return () => controller.abort();
  }, [open, categoria]);

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
          onClick={() => setOpen(false)}
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
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cerrar
            </Button>
          </header>

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
              <p className="alimento-autocomplete__empty" role="status">
                No hay alimentos en el catálogo. Creálos en Catálogo → Alimentos.
              </p>
            ) : null}
            {!emptyCatalog && emptyCategoria && busqueda.trim().length < 2 ? (
              <p className="alimento-autocomplete__empty" role="status">
                No hay ítems en {BUILDER_CATEGORIA_LABELS[categoria]}. Revisá Catálogo →
                Alimentos.
              </p>
            ) : null}
            {emptyBusqueda ? (
              <p className="alimento-autocomplete__empty" role="status">
                Sin coincidencias. Podés usar un nombre libre o revisar el catálogo.
              </p>
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
                        setOpen(false);
                        setBusqueda("");
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
        </div>
      ) : null}
    </>
  );
}
