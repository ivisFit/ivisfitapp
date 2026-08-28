"use client";

import { Button, Input, Select } from "@/components";
import type {
  ComidaPlan,
  IngredientePlan,
  IngredientePlanUnidad,
} from "@/features/alumna/types/plan-nutricional";
import { type Alimento } from "@/features/profe/types/alimento";
import { AlimentoAutocomplete } from "./AlimentoAutocomplete";

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
  onUpdate: (patch: Partial<ComidaPlan>) => void;
  onSelectAlimento: (ingredienteIndex: number, alimento: Alimento) => void;
  onCantidadChange: (ingredienteIndex: number, ingrediente: IngredientePlan, cantidad: number) => void;
  onUpdateIngrediente: (ingredienteIndex: number, patch: Partial<IngredientePlan>) => void;
  onAddIngrediente: () => void;
  onRemoveIngrediente: (ingredienteIndex: number) => void;
  onRemoveComida: () => void;
};

export function PlanNutricionalComidaCard({
  comida,
  diaIndex,
  comidaIndex,
  disabled,
  canRemove,
  onUpdate,
  onSelectAlimento,
  onCantidadChange,
  onUpdateIngrediente,
  onAddIngrediente,
  onRemoveIngrediente,
  onRemoveComida,
}: PlanNutricionalComidaCardProps) {
  const kcal = sumComidaKcal(comida);
  const fieldPrefix = `dia-${diaIndex}-comida-${comidaIndex}`;

  return (
    <article className="plan-nutricional-comida">
      <div className="plan-nutricional-comida__header">
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
        <div className="plan-nutricional-comida__kcal">
          <span>Kcal</span>
          <strong>{kcal || "—"}</strong>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={onRemoveComida}
          disabled={disabled || !canRemove}
          aria-label={`Quitar ${comida.nombre || "comida"}`}
        >
          Quitar
        </Button>
      </div>

      <div className="plan-nutricional-ingredientes">
        {comida.ingredientes.map((ingrediente, ingredienteIndex) => (
          <div
            key={`${fieldPrefix}-ing-${ingredienteIndex}`}
            className="plan-nutricional-ingredientes__row"
          >
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
            <Input
              label="Cantidad"
              name={`${fieldPrefix}-ing-${ingredienteIndex}-cantidad`}
              type="number"
              min={0}
              step="any"
              value={ingrediente.cantidad}
              onChange={(event) =>
                onCantidadChange(
                  ingredienteIndex,
                  ingrediente,
                  Number(event.target.value) || 0,
                )
              }
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
          </div>
        ))}
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
          id={`${fieldPrefix}-prep`}
          className="plan-nutricional-builder__textarea"
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
