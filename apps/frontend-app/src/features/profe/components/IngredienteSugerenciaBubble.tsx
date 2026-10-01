"use client";

import { ArrowRight, Check, Sparkles, X } from "lucide-react";
import type { IngredientePlan } from "@/features/alumna/types/plan-nutricional";
import type { SugerenciaIngrediente } from "@/features/profe/lib/sugerencia-ingredientes";

type IngredienteSugerenciaBubbleProps = {
  sugerencia: SugerenciaIngrediente;
  onAccept: () => void;
  onReject: () => void;
};

function describe(ingrediente: IngredientePlan | undefined, vacio: string) {
  if (!ingrediente?.nombre.trim()) {
    return { titulo: vacio, detalle: "" };
  }
  return {
    titulo: ingrediente.nombre,
    detalle: `${ingrediente.cantidad} ${ingrediente.unidad}`,
  };
}

export function IngredienteSugerenciaBubble({
  sugerencia,
  onAccept,
  onReject,
}: IngredienteSugerenciaBubbleProps) {
  const antes =
    sugerencia.kind === "add"
      ? { titulo: "—", detalle: "" }
      : describe(sugerencia.before, "—");
  const despues =
    sugerencia.kind === "remove"
      ? { titulo: "Quitar", detalle: "" }
      : describe(sugerencia.after, "—");
  const kicker =
    sugerencia.kind === "add"
      ? "Agregar"
      : sugerencia.kind === "remove"
        ? "Quitar"
        : "Sugerencia";

  return (
    <div className="ia-sugerencia-globo" role="status">
      <div className="ia-sugerencia-globo__head">
        <span className="ia-sugerencia-globo__badge">
          <Sparkles size={13} aria-hidden="true" />
          {kicker}
        </span>
        <div className="ia-sugerencia-globo__actions">
          <button
            type="button"
            className="ia-sugerencia-globo__btn ia-sugerencia-globo__btn--no"
            aria-label="Rechazar sugerencia"
            onClick={onReject}
          >
            <X size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="ia-sugerencia-globo__btn ia-sugerencia-globo__btn--yes"
            aria-label="Aceptar sugerencia"
            onClick={onAccept}
          >
            <Check size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="ia-sugerencia-globo__compare">
        <div className="ia-sugerencia-globo__tile ia-sugerencia-globo__tile--before">
          <span className="ia-sugerencia-globo__label">Antes</span>
          <strong className="ia-sugerencia-globo__name">{antes.titulo}</strong>
          {antes.detalle ? (
            <span className="ia-sugerencia-globo__meta">{antes.detalle}</span>
          ) : null}
        </div>
        <span className="ia-sugerencia-globo__arrow" aria-hidden="true">
          <ArrowRight size={18} />
        </span>
        <div className="ia-sugerencia-globo__tile ia-sugerencia-globo__tile--after">
          <span className="ia-sugerencia-globo__label">Después</span>
          <strong className="ia-sugerencia-globo__name">{despues.titulo}</strong>
          {despues.detalle ? (
            <span className="ia-sugerencia-globo__meta">{despues.detalle}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
