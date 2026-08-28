"use client";

import {
  WIZARD_STEPS,
  getQuestionProgress,
  type WizardQuestionConfig,
} from "@/features/alumna/lib/nutricion-wizard";

type NutricionWizardProgressProps = {
  questionIndex: number;
  sectionIndex: number;
  activeQuestions: WizardQuestionConfig[];
};

export function NutricionWizardProgress({
  questionIndex,
  sectionIndex,
  activeQuestions,
}: NutricionWizardProgressProps) {
  const { current, total, percent } = getQuestionProgress(
    questionIndex,
    activeQuestions,
  );
  const section = WIZARD_STEPS[sectionIndex];
  const sectionLabel = section?.label ?? "";
  const sectionShortLabel = section?.shortLabel ?? sectionLabel;

  return (
    <div
      className="nutricion-wizard__progress"
      role="navigation"
      aria-label="Progreso de evaluación"
    >
      <span className="nutricion-wizard__progress-label" aria-live="polite">
        <span className="nutricion-wizard__progress-count">
          Pregunta {current} de {total}
        </span>
        <span className="nutricion-wizard__progress-section">{sectionLabel}</span>
        <span className="nutricion-wizard__progress-section nutricion-wizard__progress-section--short">
          {sectionShortLabel}
        </span>
      </span>
      <div className="nutricion-wizard__progress-track" aria-hidden="true">
        <i
          className="nutricion-wizard__progress-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="nutricion-wizard__stepper-dots" aria-hidden="true">
        {activeQuestions.map((question, index) => {
          if (question.inputType === "resumen") return null;
          let className = "nutricion-wizard__step-dot";
          if (index < questionIndex) {
            className += " nutricion-wizard__step-dot--complete";
          }
          if (index === questionIndex) {
            className += " nutricion-wizard__step-dot--current";
          }
          return <span key={question.id} className={className} />;
        })}
      </div>
    </div>
  );
}
