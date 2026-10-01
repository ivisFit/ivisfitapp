"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ClipboardCheck, Target, UserRound, UtensilsCrossed } from "lucide-react";
import type { ReactNode } from "react";
import {
  ALIMENTACION_PLAN_STEPS,
  profeAlumnaAlimentacionStepRoute,
  type AlimentacionPlanStep,
} from "@/routes/paths";
import {
  ALIMENTACION_STEP_DESCRIPTIONS,
  ALIMENTACION_STEP_LABELS,
} from "@/features/profe/lib/plan-alimentacion-steps";
import { useAlimentacionStepSave } from "@/features/profe/hooks/useAlimentacionStepSave";

const STEP_ICONS: Record<AlimentacionPlanStep, ReactNode> = {
  perfil: <UserRound size={18} aria-hidden="true" />,
  objetivos: <Target size={18} aria-hidden="true" />,
  comidas: <UtensilsCrossed size={18} aria-hidden="true" />,
  revisar: <ClipboardCheck size={18} aria-hidden="true" />,
};

export function AlimentacionStepperNav({ alumnaId }: { alumnaId: string }) {
  const pathname = usePathname();
  const currentStep = ALIMENTACION_PLAN_STEPS.find((step) =>
    pathname.endsWith(`/${step}`),
  );
  const currentIndex = currentStep
    ? ALIMENTACION_PLAN_STEPS.indexOf(currentStep)
    : -1;
  const { handleStepLinkClick } = useAlimentacionStepSave();

  return (
    <nav className="alimentacion-plan-stepper" aria-label="Pasos del plan">
      <ol className="alimentacion-plan-stepper__list">
        {ALIMENTACION_PLAN_STEPS.map((step, index) => {
          const isCurrent = currentStep === step;
          const isComplete = currentIndex > index;
          const href = profeAlumnaAlimentacionStepRoute(alumnaId, step);
          return (
            <li
              key={step}
              className={`alimentacion-plan-stepper__item${isCurrent ? " is-current" : ""}${isComplete ? " is-complete" : ""}`}
            >
              <Link
                className="alimentacion-plan-stepper__link"
                href={href}
                aria-current={isCurrent ? "step" : undefined}
                onClick={isCurrent ? undefined : handleStepLinkClick(href)}
              >
                <span className="alimentacion-plan-stepper__index">
                  {isComplete ? (
                    <Check size={18} strokeWidth={2.75} aria-hidden="true" />
                  ) : (
                    STEP_ICONS[step]
                  )}
                </span>
                <span className="alimentacion-plan-stepper__text">
                  <span className="alimentacion-plan-stepper__eyebrow">
                    Paso {index + 1}
                  </span>
                  <span className="alimentacion-plan-stepper__label">
                    {ALIMENTACION_STEP_LABELS[step]}
                  </span>
                  <span className="alimentacion-plan-stepper__description">
                    {ALIMENTACION_STEP_DESCRIPTIONS[step]}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function getStepFromPathname(pathname: string): AlimentacionPlanStep | null {
  for (const step of ALIMENTACION_PLAN_STEPS) {
    if (pathname.endsWith(`/${step}`)) return step;
  }
  return null;
}
