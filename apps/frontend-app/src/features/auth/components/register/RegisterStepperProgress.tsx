"use client";

import {
  REGISTER_TOTAL_STEPS,
  getRegisterProgressPercent,
  getRegisterStepConfig,
  type RegisterStep,
} from "@/features/auth/lib/register-form";

type RegisterStepperProgressProps = {
  currentStep: RegisterStep;
};

export function RegisterStepperProgress({
  currentStep,
}: RegisterStepperProgressProps) {
  const stepConfig = getRegisterStepConfig(currentStep);
  const percent = getRegisterProgressPercent(currentStep);

  return (
    <div
      className="register-stepper__progress"
      role="navigation"
      aria-label="Progreso del registro"
    >
      <span className="register-stepper__progress-label" aria-live="polite">
        Paso {currentStep} de {REGISTER_TOTAL_STEPS} — {stepConfig.label}
      </span>
      <div className="register-stepper__progress-track" aria-hidden="true">
        <i
          className="register-stepper__progress-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="register-stepper__dots" aria-hidden="true">
        {Array.from({ length: REGISTER_TOTAL_STEPS }, (_, index) => {
          const stepNumber = (index + 1) as RegisterStep;
          let className = "register-stepper__dot";
          if (stepNumber < currentStep) {
            className += " register-stepper__dot--complete";
          }
          if (stepNumber === currentStep) {
            className += " register-stepper__dot--current";
          }
          return <span key={stepNumber} className={className} aria-current={stepNumber === currentStep ? "step" : undefined} />;
        })}
      </div>
    </div>
  );
}
