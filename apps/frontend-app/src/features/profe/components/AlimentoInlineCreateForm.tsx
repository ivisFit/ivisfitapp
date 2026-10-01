"use client";

import { useState, type FormEvent } from "react";
import { Button, Input, Select } from "@/components";
import {
  alimentoFormStateToPayload,
  getEmptyAlimentoFormState,
  type AlimentoFormState,
} from "@/features/profe/lib/alimento-form";
import { createAlimentoApi } from "@/features/profe/hooks/useAlimentos";
import {
  ALIMENTO_CATEGORIA_OPTIONS,
  type Alimento,
  type AlimentoCategoria,
  type AlimentoUnidad,
} from "@/features/profe/types/alimento";

type AlimentoInlineCreateFormProps = {
  initialNombre?: string;
  initialCategoria: AlimentoCategoria;
  onCreated: (alimento: Alimento) => void;
  onCancel: () => void;
};

export function AlimentoInlineCreateForm({
  initialNombre = "",
  initialCategoria,
  onCreated,
  onCancel,
}: AlimentoInlineCreateFormProps) {
  const [form, setForm] = useState<AlimentoFormState>(() =>
    getEmptyAlimentoFormState({
      nombre: initialNombre.trim(),
      categoria: initialCategoria,
    }),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const alimento = await createAlimentoApi(alimentoFormStateToPayload(form));
      onCreated(alimento);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el alimento");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="alimento-form alimento-catalog-picker__create" onSubmit={handleSubmit}>
      <h4 className="alimento-catalog-picker__create-title">Nuevo alimento en el catálogo</h4>
      <Input
        label="Nombre del alimento"
        name="inline-alimento-nombre"
        required
        autoComplete="off"
        value={form.nombre}
        onChange={(event) =>
          setForm((current) => ({ ...current, nombre: event.target.value }))
        }
      />
      <Select
        label="Categoría"
        name="inline-alimento-categoria"
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
          name="inline-porcionCantidad"
          type="number"
          min={0}
          step="any"
          required
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
          name="inline-porcionUnidad"
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
          name="inline-kcal"
          type="number"
          min={0}
          step="any"
          required
          value={form.kcal}
          onChange={(event) =>
            setForm((current) => ({ ...current, kcal: event.target.value }))
          }
        />
        <Input
          label="Proteína (g)"
          name="inline-proteinaG"
          type="number"
          min={0}
          step="any"
          required
          value={form.proteinaG}
          onChange={(event) =>
            setForm((current) => ({ ...current, proteinaG: event.target.value }))
          }
        />
        <Input
          label="Carbohidratos (g)"
          name="inline-carbohidratosG"
          type="number"
          min={0}
          step="any"
          required
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
          name="inline-grasasG"
          type="number"
          min={0}
          step="any"
          required
          value={form.grasasG}
          onChange={(event) =>
            setForm((current) => ({ ...current, grasasG: event.target.value }))
          }
        />
      </div>

      <label className="field" htmlFor="inline-notas">
        <span className="field__label">Notas (opcional)</span>
        <textarea
          id="inline-notas"
          name="inline-notas"
          className="field__input field__textarea"
          rows={2}
          maxLength={280}
          value={form.notas}
          onChange={(event) =>
            setForm((current) => ({ ...current, notas: event.target.value }))
          }
        />
      </label>

      <div className="alimento-form__actions">
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando…" : "Guardar y usar"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
          Volver a la lista
        </Button>
      </div>
      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
