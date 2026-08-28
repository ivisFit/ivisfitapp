"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AuthCard } from "@/components/layout/AuthCard";
import { RegisterStepperNav } from "@/features/auth/components/register/RegisterStepperNav";
import { RegisterStepperProgress } from "@/features/auth/components/register/RegisterStepperProgress";
import { RegisterStepComprobante } from "@/features/auth/components/register/steps/RegisterStepComprobante";
import { RegisterStepContacto } from "@/features/auth/components/register/steps/RegisterStepContacto";
import { RegisterStepCuenta } from "@/features/auth/components/register/steps/RegisterStepCuenta";
import { RegisterStepPerfil } from "@/features/auth/components/register/steps/RegisterStepPerfil";
import { RegisterStepSalud } from "@/features/auth/components/register/steps/RegisterStepSalud";
import { RegisterStepSuccess } from "@/features/auth/components/register/steps/RegisterStepSuccess";
import { useRegisterForm } from "@/features/auth/hooks/useRegisterForm";
import { getRegisterStepConfig } from "@/features/auth/lib/register-form";
import { publicRoutes } from "@/routes/paths";

function PlanSelectionNote({ planTitle }: { planTitle: string | null }) {
  if (!planTitle) return null;
  return (
    <div className="auth-callout">
      <p>
        Te vas a registrar para el <strong>{planTitle}</strong>.
      </p>
    </div>
  );
}

type RegisterStepperProps = {
  planTitle: string | null;
};

export function RegisterStepper({ planTitle }: RegisterStepperProps) {
  const stepTitleRef = useRef<HTMLHeadingElement>(null);
  const {
    formData,
    currentStep,
    comprobante,
    submitting,
    error,
    success,
    updateField,
    handleComprobanteChange,
    nextStep,
    prevStep,
    submit,
  } = useRegisterForm();

  const stepConfig = getRegisterStepConfig(currentStep);

  useEffect(() => {
    stepTitleRef.current?.focus();
  }, [currentStep]);

  if (success) {
    return <RegisterStepSuccess />;
  }

  function renderStep() {
    switch (currentStep) {
      case 1:
        return (
          <>
            <PlanSelectionNote planTitle={planTitle} />
            <RegisterStepCuenta formData={formData} onChange={updateField} />
          </>
        );
      case 2:
        return (
          <RegisterStepContacto formData={formData} onChange={updateField} />
        );
      case 3:
        return <RegisterStepPerfil formData={formData} onChange={updateField} />;
      case 4:
        return <RegisterStepSalud formData={formData} onChange={updateField} />;
      case 5:
        return (
          <RegisterStepComprobante
            comprobante={comprobante}
            onComprobanteChange={handleComprobanteChange}
          />
        );
      default:
        return null;
    }
  }

  return (
    <AuthCard
      variant="login"
      eyebrow="Registro"
      title={
        <>
          Registro de <em>alumna</em>
        </>
      }
      subtitle="Completá tus datos paso a paso para solicitar tu ingreso al programa."
      className="auth-card--register auth-card--stepper"
      footer={<Link href={publicRoutes.login}>Ya tengo cuenta</Link>}
    >
      <div className="register-stepper">
        <RegisterStepperProgress currentStep={currentStep} />

        <h2
          ref={stepTitleRef}
          className="register-stepper__title"
          tabIndex={-1}
        >
          {stepConfig.title}
        </h2>
        <p className="register-stepper__subtitle">{stepConfig.subtitle}</p>

        <div
          key={currentStep}
          className="register-stepper__panel"
          role="group"
          aria-labelledby="register-step-title"
        >
          {renderStep()}
        </div>

        {error ? <p className="auth-error">{error}</p> : null}

        <RegisterStepperNav
          currentStep={currentStep}
          submitting={submitting}
          onBack={prevStep}
          onNext={nextStep}
          onSubmit={() => void submit()}
        />
      </div>
    </AuthCard>
  );
}
