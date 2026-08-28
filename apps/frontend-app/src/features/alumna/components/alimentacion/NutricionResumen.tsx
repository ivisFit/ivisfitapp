"use client";

import type { ReactNode } from "react";
import type { NutricionWizardFormState } from "@/features/alumna/lib/nutricion-wizard";
import {
  HORARIO_OPTIONS,
  NIVEL_ACTIVIDAD_OPTIONS,
  OBJETIVO_OPTIONS,
  OCUPACION_OPTIONS,
  PREFERENCIA_OPTIONS,
  RESTRICCION_OPTIONS,
  TIEMPO_COCINA_OPTIONS,
  formatList,
  getLabelForValue,
} from "@/features/alumna/lib/nutricion-wizard";

type NutricionResumenProps = {
  form: NutricionWizardFormState;
  onEditSection: (sectionIndex: number) => void;
};

type ResumenBlockProps = {
  title: string;
  sectionIndex: number;
  onEditSection: (sectionIndex: number) => void;
  children: ReactNode;
};

function ResumenBlock({
  title,
  sectionIndex,
  onEditSection,
  children,
}: ResumenBlockProps) {
  return (
    <section className="nutricion-resumen__block">
      <div className="nutricion-resumen__header">
        <h3>{title}</h3>
        <button
          type="button"
          className="nutricion-resumen__edit"
          onClick={() => onEditSection(sectionIndex)}
        >
          Editar
        </button>
      </div>
      {children}
    </section>
  );
}

function ResumenRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="nutricion-resumen__row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function NutricionResumen({ form, onEditSection }: NutricionResumenProps) {
  const preferencias = form.preferenciasAlimentarias
    .map(
      (value) =>
        PREFERENCIA_OPTIONS.find((option) => option.value === value)?.label ??
        value,
    )
    .join(", ");

  const restricciones = form.restricciones
    .map(
      (value) =>
        RESTRICCION_OPTIONS.find((option) => option.value === value)?.label ??
        value,
    )
    .join(", ");

  const horarios = form.horariosDisponibles
    .map(
      (value) =>
        HORARIO_OPTIONS.find((option) => option.value === value)?.label ?? value,
    )
    .join(", ");

  const tiempoCocina =
    TIEMPO_COCINA_OPTIONS.find(
      (option) => String(option.value) === form.tiempoCocinaMinutos,
    )?.label ?? form.tiempoCocinaMinutos;

  return (
    <div className="nutricion-resumen">
      <ResumenBlock
        title="Datos personales"
        sectionIndex={0}
        onEditSection={onEditSection}
      >
        <dl className="nutricion-resumen__list">
          <ResumenRow label="Edad" value={form.edad || "—"} />
          <ResumenRow
            label="Sexo"
            value={
              form.sexo === "mujer"
                ? "Mujer"
                : form.sexo === "hombre"
                  ? "Hombre"
                  : "—"
            }
          />
          <ResumenRow label="Estatura" value={`${form.estaturaCm || "—"} cm`} />
          <ResumenRow label="Peso actual" value={`${form.pesoActualKg || "—"} kg`} />
          <ResumenRow
            label="Peso objetivo"
            value={`${form.pesoObjetivoKg || "—"} kg`}
          />
          <ResumenRow label="Fecha objetivo" value={form.fechaObjetivo || "—"} />
          <ResumenRow
            label="Actividad física"
            value={getLabelForValue(NIVEL_ACTIVIDAD_OPTIONS, form.nivelActividad)}
          />
          <ResumenRow
            label="Ocupación"
            value={getLabelForValue(OCUPACION_OPTIONS, form.ocupacion)}
          />
        </dl>
      </ResumenBlock>

      <ResumenBlock title="Objetivo" sectionIndex={1} onEditSection={onEditSection}>
        <dl className="nutricion-resumen__list">
          <ResumenRow
            label="Objetivo principal"
            value={getLabelForValue(OBJETIVO_OPTIONS, form.objetivo)}
          />
        </dl>
      </ResumenBlock>

      <ResumenBlock
        title="Preferencias"
        sectionIndex={2}
        onEditSection={onEditSection}
      >
        <dl className="nutricion-resumen__list">
          <ResumenRow label="Estilo alimentario" value={preferencias || "—"} />
        </dl>
      </ResumenBlock>

      <ResumenBlock
        title="Restricciones"
        sectionIndex={3}
        onEditSection={onEditSection}
      >
        <dl className="nutricion-resumen__list">
          <ResumenRow label="Condiciones" value={restricciones || "Ninguna"} />
          <ResumenRow label="Alergias" value={formatList(form.alergias)} />
        </dl>
      </ResumenBlock>

      <ResumenBlock title="Gustos" sectionIndex={4} onEditSection={onEditSection}>
        <dl className="nutricion-resumen__list">
          <ResumenRow
            label="Favoritos"
            value={formatList(form.alimentosFavoritos)}
          />
          <ResumenRow
            label="No consume"
            value={formatList(form.alimentosEvitados)}
          />
        </dl>
      </ResumenBlock>

      <ResumenBlock title="Logística" sectionIndex={5} onEditSection={onEditSection}>
        <dl className="nutricion-resumen__list">
          <ResumenRow label="Horarios" value={horarios || "—"} />
          <ResumenRow
            label="Comidas por día"
            value={form.cantidadComidas ? `${form.cantidadComidas}` : "—"}
          />
          <ResumenRow label="Tiempo para cocinar" value={tiempoCocina || "—"} />
        </dl>
      </ResumenBlock>
    </div>
  );
}
