"use client";

import type { ReactNode } from "react";
import {
  Activity,
  Dumbbell,
  Heart,
  Scale,
  Sparkles,
  Target,
} from "lucide-react";
import { InfoTooltip, Input } from "@/components";
import { NutricionResumen } from "@/features/alumna/components/alimentacion/NutricionResumen";
import { SelectionCard } from "@/features/alumna/components/alimentacion/shared/SelectionCard";
import { SelectionChipGroup } from "@/features/alumna/components/alimentacion/shared/SelectionChipGroup";
import { TagInput } from "@/features/alumna/components/alimentacion/shared/TagInput";
import type {
  NutricionWizardFormState,
  WizardQuestionConfig,
} from "@/features/alumna/lib/nutricion-wizard";
import {
  CANTIDAD_COMIDAS_OPTIONS,
  HORARIO_OPTIONS,
  NIVEL_ACTIVIDAD_OPTIONS,
  OBJETIVO_OPTIONS,
  OCUPACION_OPTIONS,
  PREFERENCIA_OPTIONS,
  RESTRICCION_OPTIONS,
  TIEMPO_COCINA_OPTIONS,
} from "@/features/alumna/lib/nutricion-wizard";
import type { ObjetivoNutricional } from "@/features/alumna/types/evaluacion-nutricional";

const OBJETIVO_ICONS: Record<ObjetivoNutricional, ReactNode> = {
  bajar_grasa: <Scale size={20} />,
  ganar_masa: <Dumbbell size={20} />,
  recomposicion: <Target size={20} />,
  mantener: <Activity size={20} />,
  rendimiento: <Sparkles size={20} />,
  salud: <Heart size={20} />,
};

const SEXO_OPTIONS = [
  { value: "mujer" as const, label: "Mujer" },
  { value: "hombre" as const, label: "Hombre" },
];

const CANTIDAD_COMIDAS_CHIP_OPTIONS = CANTIDAD_COMIDAS_OPTIONS.map((count) => ({
  value: String(count),
  label: `${count} comidas`,
}));

const TIEMPO_COCINA_CHIP_OPTIONS = TIEMPO_COCINA_OPTIONS.map((option) => ({
  value: String(option.value),
  label: option.label,
}));

type NutricionQuestionScreenProps = {
  question: WizardQuestionConfig;
  form: NutricionWizardFormState;
  onChange: <K extends keyof NutricionWizardFormState>(
    key: K,
    value: NutricionWizardFormState[K],
  ) => void;
  onEditSection: (sectionIndex: number) => void;
};

export function NutricionQuestionScreen({
  question,
  form,
  onChange,
  onEditSection,
}: NutricionQuestionScreenProps) {
  if (question.inputType === "resumen") {
    return (
      <div className="nutricion-wizard__question nutricion-wizard__question--resumen">
        <h2 className="nutricion-wizard__question-title">{question.question}</h2>
        <div className="nutricion-wizard__question-control nutricion-wizard__question-control--wide">
          <NutricionResumen form={form} onEditSection={onEditSection} />
        </div>
      </div>
    );
  }

  return (
    <div className="nutricion-wizard__question">
      <h2
        className={`nutricion-wizard__question-title ${
          question.help ? "nutricion-wizard__question-title--with-help" : ""
        }`}
      >
        <span>{question.question}</span>
        {question.help ? <InfoTooltip text={question.help} /> : null}
      </h2>
      <div className="nutricion-wizard__question-control">
        {renderControl(question, form, onChange)}
      </div>
    </div>
  );
}

function renderControl(
  question: WizardQuestionConfig,
  form: NutricionWizardFormState,
  onChange: NutricionQuestionScreenProps["onChange"],
) {
  const field = question.field;
  if (!field) return null;

  switch (question.inputType) {
    case "number":
      return (
        <Input
          label=""
          name={field}
          type="number"
          inputMode="decimal"
          value={form[field] as string}
          onChange={(event) =>
            onChange(field, event.target.value as NutricionWizardFormState[typeof field])
          }
          className="nutricion-wizard__question-input"
          aria-label={question.question}
          autoFocus
        />
      );
    case "date":
      return (
        <Input
          label=""
          name={field}
          type="date"
          value={form[field] as string}
          onChange={(event) =>
            onChange(field, event.target.value as NutricionWizardFormState[typeof field])
          }
          className="nutricion-wizard__question-input"
          aria-label={question.question}
          autoFocus
        />
      );
    case "chips-single": {
      if (field === "sexo") {
        return (
          <SelectionChipGroup
            label=""
            options={SEXO_OPTIONS}
            value={form.sexo ? [form.sexo] : []}
            multiple={false}
            onChange={(values) =>
              onChange("sexo", (values[0] as NutricionWizardFormState["sexo"]) ?? "")
            }
          />
        );
      }
      if (field === "nivelActividad") {
        return (
          <SelectionChipGroup
            label=""
            options={NIVEL_ACTIVIDAD_OPTIONS}
            value={form.nivelActividad ? [form.nivelActividad] : []}
            multiple={false}
            onChange={(values) =>
              onChange(
                "nivelActividad",
                (values[0] as NutricionWizardFormState["nivelActividad"]) ?? "",
              )
            }
          />
        );
      }
      if (field === "ocupacion") {
        return (
          <SelectionChipGroup
            label=""
            options={OCUPACION_OPTIONS}
            value={form.ocupacion ? [form.ocupacion] : []}
            multiple={false}
            onChange={(values) =>
              onChange(
                "ocupacion",
                (values[0] as NutricionWizardFormState["ocupacion"]) ?? "",
              )
            }
          />
        );
      }
      if (field === "cantidadComidas") {
        return (
          <SelectionChipGroup
            label=""
            options={CANTIDAD_COMIDAS_CHIP_OPTIONS}
            value={form.cantidadComidas ? [form.cantidadComidas] : []}
            multiple={false}
            onChange={(values) => onChange("cantidadComidas", values[0] ?? "")}
          />
        );
      }
      if (field === "tiempoCocinaMinutos") {
        return (
          <SelectionChipGroup
            label=""
            options={TIEMPO_COCINA_CHIP_OPTIONS}
            value={
              form.tiempoCocinaMinutos ? [form.tiempoCocinaMinutos] : []
            }
            multiple={false}
            onChange={(values) => onChange("tiempoCocinaMinutos", values[0] ?? "")}
          />
        );
      }
      return null;
    }
    case "chips-multi": {
      if (field === "preferenciasAlimentarias") {
        return (
          <SelectionChipGroup
            label=""
            options={PREFERENCIA_OPTIONS}
            value={form.preferenciasAlimentarias}
            onChange={(values) => onChange("preferenciasAlimentarias", values)}
          />
        );
      }
      if (field === "restricciones") {
        return (
          <SelectionChipGroup
            label=""
            options={RESTRICCION_OPTIONS}
            value={form.restricciones}
            onChange={(values) => onChange("restricciones", values)}
          />
        );
      }
      if (field === "horariosDisponibles") {
        return (
          <SelectionChipGroup
            label=""
            options={HORARIO_OPTIONS}
            value={form.horariosDisponibles}
            onChange={(values) => onChange("horariosDisponibles", values)}
          />
        );
      }
      return null;
    }
    case "cards-single":
      return (
        <SelectionCard
          name={field}
          label=""
          value={form.objetivo}
          onChange={(value) => onChange("objetivo", value)}
          options={OBJETIVO_OPTIONS.map((option) => ({
            ...option,
            icon: OBJETIVO_ICONS[option.value],
          }))}
        />
      );
    case "tags": {
      const suggestions = field !== "alergias";
      return (
        <TagInput
          label=""
          value={form[field] as string[]}
          onChange={(values) =>
            onChange(field, values as NutricionWizardFormState[typeof field])
          }
          placeholder="Escribí y presioná Enter"
          suggestions={suggestions}
        />
      );
    }
    default:
      return null;
  }
}
