"use client";

import { Button } from "@/components";

type NutricionWizardNavProps = {
  isFirstQuestion: boolean;
  isResumen: boolean;
  canSkip: boolean;
  submitting: boolean;
  nextDisabled?: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
};

export function NutricionWizardNav({
  isFirstQuestion,
  isResumen,
  canSkip,
  submitting,
  nextDisabled = false,
  onBack,
  onNext,
  onSkip,
}: NutricionWizardNavProps) {
  return (
    <div className="nutricion-wizard__nav">
      {!isFirstQuestion ? (
        <Button type="button" variant="ghost" onClick={onBack} disabled={submitting}>
          Atrás
        </Button>
      ) : null}
      {canSkip ? (
        <Button type="button" variant="ghost" onClick={onSkip} disabled={submitting}>
          Omitir
        </Button>
      ) : null}
      <Button
        type="button"
        onClick={onNext}
        disabled={submitting || nextDisabled}
      >
        {submitting ? "Generando..." : isResumen ? "Generar mi plan" : "Siguiente"}
      </Button>
    </div>
  );
}
