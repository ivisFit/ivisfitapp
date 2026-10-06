"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button, Input, Select } from "@/components";
import { useAutosizeTextarea } from "@/hooks/useAutosizeTextarea";
import type {
  ComidaPlan,
  IngredientePlan,
  IngredientePlanUnidad,
} from "@/features/alumna/types/plan-nutricional";
import { type Alimento } from "@/features/profe/types/alimento";
import type { SugerenciaIngrediente } from "@/features/profe/lib/sugerencia-ingredientes";
import { AlimentoAutocomplete } from "./AlimentoAutocomplete";
import { AlimentoCatalogPicker } from "./AlimentoCatalogPicker";
import { IngredienteSugerenciaBubble } from "./IngredienteSugerenciaBubble";

function sumComidaKcal(comida: ComidaPlan): number {
  return comida.ingredientes.reduce(
    (total, ingrediente) => total + (ingrediente.kcal ?? 0),
    0,
  );
}

type PlanNutricionalComidaCardProps = {
  comida: ComidaPlan;
  diaIndex: number;
  comidaIndex: number;
  disabled?: boolean;
  canRemove: boolean;
  /** Oculta nombre/horario (definidos en Objetivos / cabecera del bloque). */
  lockMealMeta?: boolean;
  sugerencias?: SugerenciaIngrediente[];
  onAcceptSugerencia?: (sugerencia: SugerenciaIngrediente) => void;
  onRejectSugerencia?: (sugerencia: SugerenciaIngrediente) => void;
  onUpdate: (patch: Partial<ComidaPlan>) => void;
  onSelectAlimento: (ingredienteIndex: number, alimento: Alimento) => void;
  onCantidadChange: (ingredienteIndex: number, ingrediente: IngredientePlan, cantidad: number) => void;
  onUpdateIngrediente: (ingredienteIndex: number, patch: Partial<IngredientePlan>) => void;
  onAddIngrediente: () => void;
  onRemoveIngrediente: (ingredienteIndex: number) => void;
  onRemoveComida: () => void;
  /** Registra commit de cantidades pendientes antes de guardar el plan. */
  registerFlush?: (flush: () => void) => () => void;
};

function IngredienteRowWithSugerencia({
  sugerencia,
  onAcceptSugerencia,
  onRejectSugerencia,
  rowClassName,
  children,
}: {
  sugerencia?: SugerenciaIngrediente;
  onAcceptSugerencia?: (sugerencia: SugerenciaIngrediente) => void;
  onRejectSugerencia?: (sugerencia: SugerenciaIngrediente) => void;
  rowClassName: string;
  children: ReactNode;
}) {
  const showBubble =
    sugerencia && onAcceptSugerencia && onRejectSugerencia;

  if (!showBubble) {
    return <div className={rowClassName}>{children}</div>;
  }

  return (
    <div className="plan-nutricional-ingredientes__sugerencia-slot">
      <IngredienteSugerenciaBubble
        sugerencia={sugerencia}
        onAccept={() => onAcceptSugerencia(sugerencia)}
        onReject={() => onRejectSugerencia(sugerencia)}
      />
      <div className={rowClassName}>{children}</div>
    </div>
  );
}

export function PlanNutricionalComidaCard({
  comida,
  diaIndex,
  comidaIndex,
  disabled,
  canRemove,
  lockMealMeta,
  sugerencias,
  onAcceptSugerencia,
  onRejectSugerencia,
  onUpdate,
  onSelectAlimento,
  onCantidadChange,
  onUpdateIngrediente,
  onAddIngrediente,
  onRemoveIngrediente,
  onRemoveComida,
  registerFlush,
}: PlanNutricionalComidaCardProps) {
  const kcal = sumComidaKcal(comida);
  const fieldPrefix = `dia-${diaIndex}-comida-${comidaIndex}`;
  const [cantidadEdits, setCantidadEdits] = useState<Record<string, string>>({});
  const cantidadEditsRef = useRef(cantidadEdits);
  cantidadEditsRef.current = cantidadEdits;
  const preparacionRef = useRef<HTMLTextAreaElement>(null);

  function cantidadFieldKey(ingredienteIndex: number) {
    return `${fieldPrefix}-ing-${ingredienteIndex}-cantidad`;
  }

  function defaultCantidadFallback(ingrediente: IngredientePlan): number {
    if (ingrediente.cantidad > 0) return ingrediente.cantidad;
    return ingrediente.unidad === "g" || ingrediente.unidad === "ml" ? 100 : 1;
  }

  const flushPendingEdits = useCallback(() => {
    const pending = cantidadEditsRef.current;
    if (!Object.keys(pending).length) return;

    for (const [key, raw] of Object.entries(pending)) {
      const match = key.match(/-ing-(\d+)-cantidad$/);
      if (!match) continue;
      const ingredienteIndex = Number(match[1]);
      const ingrediente = comida.ingredientes[ingredienteIndex];
      if (!ingrediente) continue;

      if (raw === "") {
        onCantidadChange(
          ingredienteIndex,
          ingrediente,
          defaultCantidadFallback(ingrediente),
        );
      } else {
        const parsed = Number(raw);
        if (Number.isFinite(parsed) && parsed >= 0) {
          onCantidadChange(ingredienteIndex, ingrediente, parsed);
        }
      }
    }
    setCantidadEdits({});
  }, [comida.ingredientes, onCantidadChange]);

  useEffect(() => {
    if (!registerFlush) return;
    return registerFlush(flushPendingEdits);
  }, [registerFlush, flushPendingEdits]);

  useAutosizeTextarea(preparacionRef, comida.preparacion ?? "");
  const sugerenciasPorIndice = new Map<number, SugerenciaIngrediente>();
  const sugerenciasAgregar: SugerenciaIngrediente[] = [];
  for (const sugerencia of sugerencias ?? []) {
    if (sugerencia.kind === "add" || sugerencia.currentIndex == null) {
      sugerenciasAgregar.push(sugerencia);
    } else {
      sugerenciasPorIndice.set(sugerencia.currentIndex, sugerencia);
    }
  }

  return (
    <article className="plan-nutricional-comida">
      <div
        className={
          lockMealMeta
            ? "plan-nutricional-comida__header plan-nutricional-comida__header--meta-locked"
            : "plan-nutricional-comida__header"
        }
      >
        {!lockMealMeta ? (
          <>
            <Input
              label="Comida"
              name={`${fieldPrefix}-nombre`}
              value={comida.nombre}
              onChange={(event) => onUpdate({ nombre: event.target.value })}
              disabled={disabled}
            />
            <Input
              label="Horario"
              name={`${fieldPrefix}-horario`}
              value={comida.horario ?? ""}
              placeholder="Ej. 08:00"
              onChange={(event) => onUpdate({ horario: event.target.value })}
              disabled={disabled}
            />
          </>
        ) : null}
        <div className="plan-nutricional-comida__kcal">
          <span>Kcal</span>
          <strong>{kcal || "—"}</strong>
        </div>
        {!lockMealMeta ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onRemoveComida}
            disabled={disabled || !canRemove}
            aria-label={`Quitar ${comida.nombre || "comida"}`}
          >
            Quitar
          </Button>
        ) : null}
      </div>

      <div className="plan-nutricional-ingredientes">
        {comida.ingredientes.map((ingrediente, ingredienteIndex) => {
          const sinCatalogo =
            Boolean(ingrediente.nombre.trim()) && !ingrediente.alimentoId;
          const sugerencia = sugerenciasPorIndice.get(ingredienteIndex);

          return (
          <IngredienteRowWithSugerencia
            key={`${fieldPrefix}-ing-${ingredienteIndex}`}
            sugerencia={sugerencia}
            onAcceptSugerencia={onAcceptSugerencia}
            onRejectSugerencia={onRejectSugerencia}
            rowClassName={
              [
                "plan-nutricional-ingredientes__row",
                sinCatalogo ? "plan-nutricional-ingredientes__row--sin-catalogo" : "",
                sugerencia ? "plan-nutricional-ingredientes__row--sugerencia" : "",
              ]
                .filter(Boolean)
                .join(" ")
            }
          >
            <div className="plan-nutricional-ingredientes__alimento">
              <AlimentoAutocomplete
                label="Alimento"
                name={`${fieldPrefix}-ing-${ingredienteIndex}-nombre`}
                value={ingrediente.nombre}
                onChangeText={(value) =>
                  onUpdateIngrediente(ingredienteIndex, {
                    nombre: value,
                    alimentoId: undefined,
                    kcal: undefined,
                    proteinaG: undefined,
                    carbohidratosG: undefined,
                    grasasG: undefined,
                  })
                }
                onSelect={(alimento) => onSelectAlimento(ingredienteIndex, alimento)}
                disabled={disabled}
              />
              <AlimentoCatalogPicker
                disabled={disabled}
                onSelect={(alimento) => onSelectAlimento(ingredienteIndex, alimento)}
              />
              {sinCatalogo ? (
                <p className="plan-nutricional-ingredientes__catalogo-hint" role="status">
                  Sin match en catálogo. Elegí uno de la lista o dejá el nombre libre.
                </p>
              ) : null}
            </div>
            <Input
              label="Cantidad"
              name={`${fieldPrefix}-ing-${ingredienteIndex}-cantidad`}
              type="number"
              min={0}
              step="any"
              value={
                cantidadFieldKey(ingredienteIndex) in cantidadEdits
                  ? cantidadEdits[cantidadFieldKey(ingredienteIndex)]
                  : String(ingrediente.cantidad)
              }
              onChange={(event) => {
                const key = cantidadFieldKey(ingredienteIndex);
                const raw = event.target.value;
                setCantidadEdits((prev) => ({ ...prev, [key]: raw }));
                if (raw === "") return;
                const parsed = Number(raw);
                if (Number.isFinite(parsed) && parsed >= 0) {
                  onCantidadChange(ingredienteIndex, ingrediente, parsed);
                }
              }}
              onBlur={() => {
                const key = cantidadFieldKey(ingredienteIndex);
                const raw = cantidadEdits[key];
                if (raw === "") {
                  onCantidadChange(
                    ingredienteIndex,
                    ingrediente,
                    defaultCantidadFallback(ingrediente),
                  );
                }
                setCantidadEdits((prev) => {
                  const next = { ...prev };
                  delete next[key];
                  return next;
                });
              }}
              disabled={disabled}
            />
            <Select
              label="Unidad"
              name={`${fieldPrefix}-ing-${ingredienteIndex}-unidad`}
              value={ingrediente.unidad}
              onChange={(event) =>
                onUpdateIngrediente(ingredienteIndex, {
                  unidad: event.target.value as IngredientePlanUnidad,
                })
              }
              disabled={disabled}
            >
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="unidad">unidad</option>
            </Select>
            <span className="plan-nutricional-ingredientes__kcal">
              {ingrediente.kcal != null ? `${ingrediente.kcal} kcal` : "—"}
            </span>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onRemoveIngrediente(ingredienteIndex)}
              disabled={disabled || comida.ingredientes.length <= 1}
              aria-label={`Quitar ${ingrediente.nombre || "ingrediente"}`}
            >
              Quitar
            </Button>
          </IngredienteRowWithSugerencia>
          );
        })}
        {sugerenciasAgregar.map((sugerencia) => {
          const propuesto = sugerencia.after;
          if (!propuesto || !onAcceptSugerencia || !onRejectSugerencia) return null;
          return (
            <IngredienteRowWithSugerencia
              key={sugerencia.id}
              sugerencia={sugerencia}
              onAcceptSugerencia={onAcceptSugerencia}
              onRejectSugerencia={onRejectSugerencia}
              rowClassName="plan-nutricional-ingredientes__row plan-nutricional-ingredientes__row--sugerencia plan-nutricional-ingredientes__row--fantasma"
            >
              <div className="plan-nutricional-ingredientes__alimento">
                <Input
                  label="Alimento"
                  name={`${fieldPrefix}-${sugerencia.id}-nombre`}
                  value={propuesto.nombre}
                  disabled
                  readOnly
                />
              </div>
              <Input
                label="Cantidad"
                name={`${fieldPrefix}-${sugerencia.id}-cantidad`}
                value={propuesto.cantidad}
                disabled
                readOnly
              />
              <Input
                label="Unidad"
                name={`${fieldPrefix}-${sugerencia.id}-unidad`}
                value={propuesto.unidad}
                disabled
                readOnly
              />
              <span className="plan-nutricional-ingredientes__kcal">
                {propuesto.kcal != null ? `${propuesto.kcal} kcal` : "—"}
              </span>
            </IngredienteRowWithSugerencia>
          );
        })}
        <Button
          type="button"
          variant="ghost"
          onClick={onAddIngrediente}
          disabled={disabled}
        >
          + Ingrediente
        </Button>
      </div>

      <label className="plan-nutricional-builder__field" htmlFor={`${fieldPrefix}-prep`}>
        <span>Preparación</span>
        <textarea
          ref={preparacionRef}
          id={`${fieldPrefix}-prep`}
          className="plan-nutricional-builder__textarea plan-nutricional-builder__textarea--autosize"
          value={comida.preparacion ?? ""}
          onChange={(event) => onUpdate({ preparacion: event.target.value })}
          placeholder="Ej: hervir 15 minutos, condimentar y servir con ensalada."
          disabled={disabled}
          rows={2}
        />
      </label>
    </article>
  );
}
