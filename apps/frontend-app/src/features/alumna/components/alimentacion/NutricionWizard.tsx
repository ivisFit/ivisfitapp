"use client";

import { useEffect, useState } from "react";
import { FormSkeleton, SkeletonLine } from "@/components/skeletons/AppSkeleton";
import { NutricionQuestionScreen } from "@/features/alumna/components/alimentacion/NutricionQuestionScreen";
import { NutricionWizardNav } from "@/features/alumna/components/alimentacion/NutricionWizardNav";
import { NutricionWizardProgress } from "@/features/alumna/components/alimentacion/NutricionWizardProgress";
import { useEvaluacionNutricional } from "@/features/alumna/hooks/useEvaluacionNutricional";
import {
  buildPayload,
  createInitialFormState,
  getActiveWizardQuestions,
  getFirstQuestionIndexForSection,
  getSectionIndexForQuestion,
  isQuestionValid,
  prefillFormFromProfile,
  WIZARD_QUESTIONS,
  type NutricionWizardFormState,
  type WizardQuestionConfig,
} from "@/features/alumna/lib/nutricion-wizard";
import { apiFetch } from "@/lib/api";
import { fetchCached } from "@/lib/apiCache";
import type { UsuarioApiDoc } from "@/types/usuario";

type NutricionWizardProps = {
  onComplete: () => void;
};

export function NutricionWizard({ onComplete }: NutricionWizardProps) {
  const { submitEvaluacion } = useEvaluacionNutricional(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [form, setForm] = useState<NutricionWizardFormState>(() =>
    createInitialFormState(),
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeQuestions, setActiveQuestions] =
    useState<WizardQuestionConfig[]>(WIZARD_QUESTIONS);

  const currentQuestion = activeQuestions[currentQuestionIndex];
  const activeSectionIndex = getSectionIndexForQuestion(
    currentQuestionIndex,
    activeQuestions,
  );
  const isResumen = currentQuestion?.inputType === "resumen";
  const isFirstQuestion = currentQuestionIndex === 0;
  const canGoNext =
    isResumen || isQuestionValid(currentQuestion?.id ?? "", form);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      try {
        const profile = await fetchCached<UsuarioApiDoc>(
          "/api/me",
          (sig) => apiFetch<UsuarioApiDoc>("/api/me", { signal: sig }),
          60_000,
          controller.signal,
        );

        const prefilled = prefillFormFromProfile(profile);
        setForm(createInitialFormState(prefilled));
        setActiveQuestions(getActiveWizardQuestions(profile));
      } catch {
        // Prefill is optional; wizard still works without profile data.
      } finally {
        if (!controller.signal.aborted) {
          setProfileLoading(false);
        }
      }
    }

    void loadProfile();
    return () => controller.abort();
  }, []);

  function updateForm<K extends keyof NutricionWizardFormState>(
    key: K,
    value: NutricionWizardFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitEvaluacion(buildPayload(form));
      onComplete();
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar la evaluación nutricional",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNext() {
    setSubmitError(null);

    if (isResumen) {
      await handleSubmit();
      return;
    }

    if (!canGoNext) return;

    setCurrentQuestionIndex((prev) =>
      Math.min(prev + 1, activeQuestions.length - 1),
    );
  }

  function handleBack() {
    setSubmitError(null);
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  }

  function handleSkip() {
    if (!currentQuestion?.optional) return;
    setSubmitError(null);
    setCurrentQuestionIndex((prev) =>
      Math.min(prev + 1, activeQuestions.length - 1),
    );
  }

  function handleEditSection(sectionIndex: number) {
    setSubmitError(null);
    setCurrentQuestionIndex(
      getFirstQuestionIndexForSection(sectionIndex, activeQuestions),
    );
  }

  if (profileLoading || !currentQuestion) {
    return (
      <div className="nutricion-wizard" aria-busy="true" aria-label="Cargando evaluación">
        <SkeletonLine size="2xl" width="w-56" gold />
        <div className="sk sk--card-elevated">
          <FormSkeleton fields={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="nutricion-wizard">
      <header className="nutricion-wizard__hero nutricion-wizard__hero--compact">
        <span className="nutricion-wizard__eyebrow">Plan nutricional</span>
        <h1>Evaluación Inicial Nutricional</h1>
      </header>

      <div className="nutricion-wizard__progress-sticky">
        <NutricionWizardProgress
          questionIndex={currentQuestionIndex}
          sectionIndex={activeSectionIndex}
          activeQuestions={activeQuestions}
        />
      </div>

      <div className="nutricion-wizard__layout">
        <div className="nutricion-wizard__content">
          <NutricionQuestionScreen
            question={currentQuestion}
            form={form}
            onChange={updateForm}
            onEditSection={handleEditSection}
          />
          {submitError ? <p className="auth-error">{submitError}</p> : null}
        </div>
      </div>

      <NutricionWizardNav
        isFirstQuestion={isFirstQuestion}
        isResumen={isResumen}
        canSkip={currentQuestion.optional === true}
        submitting={submitting}
        nextDisabled={!canGoNext}
        onBack={handleBack}
        onNext={() => void handleNext()}
        onSkip={handleSkip}
      />
    </div>
  );
}
