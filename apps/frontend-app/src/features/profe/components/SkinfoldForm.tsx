"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Button, Input } from "@/components";
import { CircunferenciaForm } from "@/components/mediciones/CircunferenciaForm";
import { apiFetch, ApiError } from "@/lib/api";
import type { Sexo } from "@/types/usuario";
import type {
  CreateMedicionPayload,
  MedicionApiDoc,
  MetodoCalculo,
  PlieguesJP7,
} from "@/features/profe/types/medicion";
import "./SkinfoldForm.css";

type SkinfoldFormProps = {
  alumnaId: string;
  sexo: Sexo;
  alturaCm?: number;
  metodo: MetodoCalculo;
  onSuccess?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

type FormState = {
  fecha: string;
  pesoCorporalKg: string;
  tricipital: string;
  suprailiaco: string;
  pectoral: string;
  abdominal: string;
  muslo: string;
  axilarMedia: string;
  subescapular: string;
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
    pesoCorporalKg: "",
    tricipital: "",
    suprailiaco: "",
    pectoral: "",
    abdominal: "",
    muslo: "",
    axilarMedia: "",
    subescapular: "",
    notas: "",
  };
}

function isSkinfoldFormDirty(form: FormState) {
  return (
    form.pesoCorporalKg.trim() !== "" ||
    form.tricipital.trim() !== "" ||
    form.suprailiaco.trim() !== "" ||
    form.pectoral.trim() !== "" ||
    form.abdominal.trim() !== "" ||
    form.muslo.trim() !== "" ||
    form.axilarMedia.trim() !== "" ||
    form.subescapular.trim() !== "" ||
    form.notas.trim() !== ""
  );
}

function parseNumber(value: string) {
  return Number(value);
}

function isValidNumber(value: number) {
  return Number.isFinite(value) && value >= 0;
}

function parsePlieguesJP3(sexo: Sexo, form: FormState): PlieguesJP7 {
  if (sexo === "mujer") {
    return {
      tricipital: parseNumber(form.tricipital),
      suprailiaco: parseNumber(form.suprailiaco),
      muslo: parseNumber(form.muslo),
    };
  }
  return {
    pectoral: parseNumber(form.pectoral),
    abdominal: parseNumber(form.abdominal),
    muslo: parseNumber(form.muslo),
  };
}

function parsePlieguesJP7(form: FormState): PlieguesJP7 {
  return {
    pectoral: parseNumber(form.pectoral),
    axilarMedia: parseNumber(form.axilarMedia),
    tricipital: parseNumber(form.tricipital),
    subescapular: parseNumber(form.subescapular),
    abdominal: parseNumber(form.abdominal),
    suprailiaco: parseNumber(form.suprailiaco),
    muslo: parseNumber(form.muslo),
  };
}

function validateJP3(sexo: Sexo, pliegues: PlieguesJP7) {
  const fields =
    sexo === "mujer"
      ? [pliegues.tricipital, pliegues.suprailiaco, pliegues.muslo]
      : [pliegues.pectoral, pliegues.abdominal, pliegues.muslo];
  return fields.every((value) => isValidNumber(value ?? NaN));
}

function validateJP7(pliegues: PlieguesJP7) {
  return [
    pliegues.pectoral,
    pliegues.axilarMedia,
    pliegues.tricipital,
    pliegues.subescapular,
    pliegues.abdominal,
    pliegues.suprailiaco,
    pliegues.muslo,
  ].every((value) => isValidNumber(value ?? NaN));
}

function SkinfoldPlieguesForm({
  alumnaId,
  sexo,
  metodo,
  onSuccess,
  onDirtyChange,
}: {
  alumnaId: string;
  sexo: Sexo;
  metodo: "jp3" | "jp7";
  onSuccess?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [form, setForm] = useState<FormState>(getEmptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    onDirtyChange?.(isSkinfoldFormDirty(form));
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

    const payload: CreateMedicionPayload = {
      alumnaId,
      metodoCalculo: metodo,
      fecha: form.fecha,
    };

    const pesoCorporalKg = parseNumber(form.pesoCorporalKg);
    if (isValidNumber(pesoCorporalKg) && pesoCorporalKg > 0) {
      payload.pesoCorporalKg = pesoCorporalKg;
    }

    if (metodo === "jp3") {
      const pliegues = parsePlieguesJP3(sexo, form);
      if (!validateJP3(sexo, pliegues)) {
        setError(
          "Ingresá valores numéricos válidos (0 o más) para los tres pliegues.",
        );
        return;
      }
      payload.pliegues = pliegues;
    } else {
      const pliegues = parsePlieguesJP7(form);
      if (!validateJP7(pliegues)) {
        setError(
          "Ingresá valores numéricos válidos (0 o más) para los siete pliegues.",
        );
        return;
      }
      payload.pliegues = pliegues;
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

      <Input
        label="Peso corporal (kg, opcional)"
        name="pesoCorporalKg"
        type="number"
        inputMode="decimal"
        min={0}
        step={0.1}
        value={form.pesoCorporalKg}
        onChange={handleChange}
        disabled={isLoading}
      />

      {metodo === "jp7" ? (
        <div className="skinfold-form__grid">
          <Input label="Pectoral (mm)" name="pectoral" type="number" inputMode="decimal" min={0} step={0.1} required value={form.pectoral} onChange={handleChange} disabled={isLoading} />
          <Input label="Axilar media (mm)" name="axilarMedia" type="number" inputMode="decimal" min={0} step={0.1} required value={form.axilarMedia} onChange={handleChange} disabled={isLoading} />
          <Input label="Tríceps (mm)" name="tricipital" type="number" inputMode="decimal" min={0} step={0.1} required value={form.tricipital} onChange={handleChange} disabled={isLoading} />
          <Input label="Subescapular (mm)" name="subescapular" type="number" inputMode="decimal" min={0} step={0.1} required value={form.subescapular} onChange={handleChange} disabled={isLoading} />
          <Input label="Abdomen (mm)" name="abdominal" type="number" inputMode="decimal" min={0} step={0.1} required value={form.abdominal} onChange={handleChange} disabled={isLoading} />
          <Input label="Suprailíaco (mm)" name="suprailiaco" type="number" inputMode="decimal" min={0} step={0.1} required value={form.suprailiaco} onChange={handleChange} disabled={isLoading} />
          <Input label="Muslo (mm)" name="muslo" type="number" inputMode="decimal" min={0} step={0.1} required value={form.muslo} onChange={handleChange} disabled={isLoading} />
        </div>
      ) : (
        <div className="skinfold-form__grid">
          {sexo === "mujer" ? (
            <>
              <Input label="Tríceps (mm)" name="tricipital" type="number" inputMode="decimal" min={0} step={0.1} required value={form.tricipital} onChange={handleChange} disabled={isLoading} />
              <Input label="Suprailíaco (mm)" name="suprailiaco" type="number" inputMode="decimal" min={0} step={0.1} required value={form.suprailiaco} onChange={handleChange} disabled={isLoading} />
            </>
          ) : (
            <>
              <Input label="Pectoral (mm)" name="pectoral" type="number" inputMode="decimal" min={0} step={0.1} required value={form.pectoral} onChange={handleChange} disabled={isLoading} />
              <Input label="Abdomen (mm)" name="abdominal" type="number" inputMode="decimal" min={0} step={0.1} required value={form.abdominal} onChange={handleChange} disabled={isLoading} />
            </>
          )}
          <Input label="Muslo (mm)" name="muslo" type="number" inputMode="decimal" min={0} step={0.1} required value={form.muslo} onChange={handleChange} disabled={isLoading} />
        </div>
      )}

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

export function SkinfoldForm({
  alumnaId,
  sexo,
  alturaCm,
  metodo,
  onSuccess,
  onDirtyChange,
}: SkinfoldFormProps) {
  if (metodo === "us-navy") {
    return (
      <CircunferenciaForm
        sexo={sexo}
        alturaCm={alturaCm}
        alumnaId={alumnaId}
        onSuccess={onSuccess}
        onDirtyChange={onDirtyChange}
      />
    );
  }

  return (
    <SkinfoldPlieguesForm
      alumnaId={alumnaId}
      sexo={sexo}
      metodo={metodo}
      onSuccess={onSuccess}
      onDirtyChange={onDirtyChange}
    />
  );
}
