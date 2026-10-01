"use client";

import { useMemo, useState } from "react";
import { Plus, RefreshCw, ShoppingBasket, Trash2 } from "lucide-react";
import { Button } from "@/components";
import { usePlanNutricionalProfe } from "@/features/profe/hooks/useGestionAlimentacion";
import {
  buildListaCompras,
  categorizarListaCompras,
} from "@/features/profe/lib/nutricion-labels";
import type {
  ListaComprasSemana,
  PlanNutricionalApiDoc,
} from "@/features/alumna/types/plan-nutricional";
import { apiFetch } from "@/lib/api";

type ListaComprasSemanasCardProps = {
  alumnaId: string;
};

function itemsDesdePlan(plan: PlanNutricionalApiDoc) {
  return buildListaCompras(plan.dias);
}

export function ListaComprasSemanasCard({ alumnaId }: ListaComprasSemanasCardProps) {
  const { plan, planBorrador, planPublicado, loading, refetch } =
    usePlanNutricionalProfe(alumnaId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState(0);

  const destino = planPublicado ?? planBorrador ?? plan;
  const semanas = destino?.listasComprasSemanas ?? [];
  const selectedIndex = Math.min(selected, Math.max(0, semanas.length - 1));
  const semanaActiva = semanas[selectedIndex];
  const categorias = useMemo(
    () => categorizarListaCompras(semanaActiva?.items ?? []),
    [semanaActiva],
  );

  async function persist(next: ListaComprasSemana[]) {
    if (!destino) return;
    const planId = destino._id ?? destino.id;
    if (!planId) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/plan-nutricional/${planId}`, {
        method: "PATCH",
        body: JSON.stringify({ listasComprasSemanas: next }),
      });
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la lista");
    } finally {
      setSaving(false);
    }
  }

  function generarPrimera() {
    if (!destino) return;
    const items = itemsDesdePlan(destino);
    if (!items.length) {
      setError("El plan no tiene ingredientes para armar la lista.");
      return;
    }
    setSelected(0);
    void persist([{ numeroSemana: 1, items }]);
  }

  function agregarSemana() {
    if (!destino) return;
    const items = semanas[0]?.items.length
      ? semanas[0].items
      : itemsDesdePlan(destino);
    if (!items.length) {
      setError("El plan no tiene ingredientes para armar la lista.");
      return;
    }
    const next = [
      ...semanas,
      { numeroSemana: semanas.length + 1, items },
    ];
    setSelected(next.length - 1);
    void persist(next);
  }

  function actualizarDesdePlan() {
    if (!destino || !semanas.length) return;
    const items = itemsDesdePlan(destino);
    if (!items.length) {
      setError("El plan no tiene ingredientes para actualizar la lista.");
      return;
    }
    void persist(
      semanas.map((semana) => ({
        ...semana,
        items,
      })),
    );
  }

  function quitarUltima() {
    if (semanas.length === 0) return;
    const next = semanas.slice(0, -1).map((semana, index) => ({
      ...semana,
      numeroSemana: index + 1,
    }));
    setSelected(Math.max(0, next.length - 1));
    void persist(next);
  }

  if (loading) return null;
  if (!destino) {
    return (
      <section className="alimentacion-tab-summary alimentacion-compras-plan">
        <header className="alimentacion-tab-summary__header">
          <span className="alimentacion-tab-summary__icon" aria-hidden="true">
            <ShoppingBasket size={20} />
          </span>
          <div>
            <h2 className="alimentacion-tab-summary__title">Lista de compras</h2>
            <p className="alimentacion-tab-summary__subtitle">
              Primero armá el plan para generar las compras de cada semana.
            </p>
          </div>
        </header>
      </section>
    );
  }

  return (
    <section className="alimentacion-tab-summary alimentacion-compras-plan">
      <header className="alimentacion-tab-summary__header">
        <span className="alimentacion-tab-summary__icon" aria-hidden="true">
          <ShoppingBasket size={20} />
        </span>
        <div>
          <h2 className="alimentacion-tab-summary__title">Lista de compras</h2>
          <p className="alimentacion-tab-summary__subtitle">
            {destino.estado === "publicado"
              ? "Cada semana usa los ingredientes del plan. La alumna las ve en su panel de alimentación."
              : "Se guarda en el borrador. La alumna las ve cuando publiques el plan."}
          </p>
        </div>
      </header>

      {semanas.length > 0 ? (
        <div className="alimentacion-compras-plan__weeks" role="tablist" aria-label="Semanas">
          {semanas.map((semana, index) => (
            <button
              key={semana.numeroSemana}
              type="button"
              role="tab"
              aria-selected={index === selectedIndex}
              className={
                index === selectedIndex
                  ? "alimentacion-compras-plan__week is-active"
                  : "alimentacion-compras-plan__week"
              }
              onClick={() => setSelected(index)}
            >
              Semana {semana.numeroSemana}
            </button>
          ))}
        </div>
      ) : (
        <p className="ap-inline-note">
          Todavía no hay semanas. Generá la primera con los ingredientes del plan.
        </p>
      )}

      {semanaActiva ? (
        <div className="alimentacion-compras-plan__preview">
          <p className="alimentacion-compras-plan__count">
            {semanaActiva.items.length}{" "}
            {semanaActiva.items.length === 1 ? "ítem" : "ítems"}
          </p>
          {categorias.map(({ categoria, items }) => (
            <div key={categoria}>
              <h3 className="alimentacion-compras-plan__categoria">{categoria}</h3>
              <ul className="alimentacion-compras-plan__list">
                {items.map((item) => (
                  <li key={item.nombre}>
                    <strong>{item.nombre}</strong>
                    <span>{item.cantidades.join(" · ")}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="alimentacion-tab-summary__actions">
        {semanas.length === 0 ? (
          <Button type="button" disabled={saving} onClick={generarPrimera}>
            <ShoppingBasket size={16} aria-hidden="true" />
            Generar semana 1
          </Button>
        ) : (
          <>
            <Button type="button" disabled={saving || semanas.length >= 52} onClick={agregarSemana}>
              <Plus size={16} aria-hidden="true" />
              Agregar semana
            </Button>
            <Button type="button" variant="ghost" disabled={saving} onClick={actualizarDesdePlan}>
              <RefreshCw size={16} aria-hidden="true" />
              Actualizar con el plan
            </Button>
            <Button type="button" variant="ghost" disabled={saving} onClick={quitarUltima}>
              <Trash2 size={16} aria-hidden="true" />
              Quitar última
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
