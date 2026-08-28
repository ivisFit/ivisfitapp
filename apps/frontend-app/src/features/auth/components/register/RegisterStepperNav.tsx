"use client";

import { Button } from "@/components";
import type { RegisterStep } from "@/features/auth/lib/register-form";

type RegisterStepperNavProps = {
  currentStep: RegisterStep;
  submitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
};

export function RegisterStepperNav({
  currentStep,
  submitting,
  onBack,
  onNext,
  onSubmit,
}: RegisterStepperNavProps) {
  const isLastStep = currentStep === 5;

  return (
    <div className="register-stepper__nav">
      {currentStep > 1 ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={submitting}
        >
          Atrás
        </Button>
      ) : (
        <span className="register-stepper__nav-spacer" aria-hidden="true" />
      )}
      <Button
        type="button"
        onClick={isLastStep ? onSubmit : onNext}
        disabled={submitting}
      >
        {submitting ? (
          "Enviando..."
        ) : (
          <>
            {isLastStep ? "Enviar solicitud" : "Continuar"}
            <span className="auth-form__cta-arrow" aria-hidden="true">
              →
            </span>
          </>
        )}
      </Button>
    </div>
  );
}
