"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button, Input } from "@/components";
import { apiFetch, ApiError } from "@/lib/api";
import type { Sexo } from "@/types/usuario";
import type {
  Circunferencias,
  CreateMedicionPayload,
  MedicionApiDoc,
} from "@/features/profe/types/medicion";
import "@/features/profe/components/SkinfoldForm.css";

type CircunferenciaFormProps = {
  sexo: Sexo;
  alturaCm?: number;
  alumnaId?: string;
  onSuccess?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

type FormState = {
  fecha: string;
  cuelloCm: string;
  cinturaCm: string;
  caderaCm: string;
  notas: string;
};

function getTodayDateInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getEmptyForm(): FormState {
  return {
    fecha: getTodayDateInputValue(),
    cuelloCm: "",
    cinturaCm: "",
    caderaCm: "",
    notas: "",
  };
}

function isCircunferenciaFormDirty(form: FormState) {
  return (
    form.cuelloCm.trim() !== "" ||
    form.cinturaCm.trim() !== "" ||
    form.caderaCm.trim() !== "" ||
    form.notas.trim() !== ""
  );
}

function parseNumber(value: string) {
  return Number(value);
}

function isValidNumber(value: number) {
  return Number.isFinite(value) && value >= 0;
}

function parseCircunferencias(sexo: Sexo, form: FormState): Circunferencias {
  const base = {
    cuelloCm: parseNumber(form.cuelloCm),
    cinturaCm: parseNumber(form.cinturaCm),
  };
  if (sexo === "mujer") {
    return { ...base, caderaCm: parseNumber(form.caderaCm) };
  }
  return base;
}

function validateCircunferencias(sexo: Sexo, circ: Circunferencias) {
  const baseValid =
    isValidNumber(circ.cuelloCm ?? NaN) &&
    circ.cuelloCm! > 0 &&
    isValidNumber(circ.cinturaCm ?? NaN) &&
    circ.cinturaCm! > 0;
  if (sexo === "mujer") {
    return baseValid && isValidNumber(circ.caderaCm ?? NaN) && circ.caderaCm! > 0;
  }
  return baseValid;
}

export function CircunferenciaForm({
  sexo,
  alturaCm,
  alumnaId,
  onSuccess,
  onDirtyChange,
}: CircunferenciaFormProps) {
  const [form, setForm] = useState<FormState>(getEmptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    onDirtyChange?.(isCircunferenciaFormDirty(form));
  }, [form, onDirtyChange]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError(null);
    setSuccessMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!alturaCm || alturaCm <= 0) {
      setError(
        "Debés tener altura registrada en tu perfil para usar el método de circunferencias.",
      );
      return;
    }

    const circunferencias = parseCircunferencias(sexo, form);
    if (!validateCircunferencias(sexo, circunferencias)) {
      setError(
        "Ingresá circunferencias válidas en centímetros (mayores a 0).",
      );
      return;
    }

    const payload: CreateMedicionPayload = {
      metodoCalculo: "us-navy",
      fecha: form.fecha,
      circunferencias,
    };

    if (alumnaId) {
      payload.alumnaId = alumnaId;
    }

    const notas = form.notas.trim();
    if (notas) {
      payload.notas = notas;
    }

    setIsLoading(true);

    try {
      const created = await apiFetch<MedicionApiDoc>("/api/mediciones", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setForm(getEmptyForm());
      const grasa = created.metricas.porcentajeGrasaCorporal;
      setSuccessMessage(
        grasa != null
          ? `Medición registrada. Grasa corporal: ${grasa.toLocaleString("es-UY", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%.`
          : "Medición registrada correctamente.",
      );
      onSuccess?.();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "No se pudo guardar la medición. Intentá de nuevo.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="skinfold-form" onSubmit={handleSubmit}>
      <Input
        label="Fecha de medición"
        name="fecha"
        type="date"
        required
        value={form.fecha}
        onChange={handleChange}
        disabled={isLoading}
      />

      {alturaCm ? (
        <p className="skinfold-form__hint">
          Altura del perfil: {alturaCm.toLocaleString("es-UY")} cm
        </p>
      ) : null}

      <div className="skinfold-form__grid">
        <Input
          label="Cuello (cm)"
          name="cuelloCm"
          type="number"
          inputMode="decimal"
          min={0}
          step={0.1}
          required
          value={form.cuelloCm}
          onChange={handleChange}
          disabled={isLoading}
        />
        <Input
          label="Cintura (cm)"
          name="cinturaCm"
          type="number"
          inputMode="decimal"
          min={0}
          step={0.1}
          required
          value={form.cinturaCm}
          onChange={handleChange}
          disabled={isLoading}
        />
        {sexo === "mujer" ? (
          <Input
            label="Cadera (cm)"
            name="caderaCm"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.1}
            required
            value={form.caderaCm}
            onChange={handleChange}
            disabled={isLoading}
          />
        ) : null}
      </div>

      <label className="field" htmlFor="notas">
        <span className="field__label">Notas (opcional)</span>
        <textarea
          id="notas"
          name="notas"
          className="field__input field__textarea"
          rows={3}
          value={form.notas}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Observaciones de la medición"
        />
      </label>

      {error ? <p className="auth-error">{error}</p> : null}
      {successMessage ? (
        <p className="skinfold-form__success" role="status">
          {successMessage}
        </p>
      ) : null}

      <div className="skinfold-form__actions">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Registrar medición"}
        </Button>
      </div>
    </form>
  );
}
