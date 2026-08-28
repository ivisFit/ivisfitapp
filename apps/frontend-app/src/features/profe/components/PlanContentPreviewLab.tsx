"use client";

import { useMemo, useState, type ReactNode } from "react";
import { PlanDaysDashboard } from "@/features/alumna/components/PlanDaysDashboard";
import { TrainingStoryPreview } from "@/features/alumna/components/TrainingStoryPreview";
import {
  buildChallenge28Days,
  buildPlanDays,
  resolveDayInfoForPlanDayNumber,
  resolveRutinaDay,
  unlockAllPlanDays,
} from "@/features/alumna/lib/rutina-day";
import type { RutinaDetail } from "@/features/alumna/types/rutina";
import { Button } from "@/components";
import type { PlanContentDraft } from "@/features/profe/lib/plan-content";
import { LabAlumnaPreviewChrome } from "@/features/profe/components/LabAlumnaPreviewChrome";
import { ProfeChromeTabs } from "@/features/profe/components/ProfeChromeTabs";

type LabPreviewView = "plan" | "story";
type LabPreviewDevice = "mobile" | "desktop";

type PlanContentPreviewLabProps = {
  rutina: RutinaDetail | null;
  planContentDraft: PlanContentDraft;
  selectedDayNumber: number;
  hasUnsavedTemplate?: boolean;
  totalDays: number;
  onSave?: () => void;
  canSave?: boolean;
  saving?: boolean;
  saveBlockedReason?: string | null;
  showIncompleteWeeksHint?: boolean;
};

function PreviewFrame({
  variant,
  children,
}: {
  variant: "mobile" | "desktop";
  children: ReactNode;
}) {
  return (
    <article
      className={`plan-content-lab__device plan-content-lab__device--${variant}`}
    >
      <header className="plan-content-lab__device-label">
        {variant === "mobile" ? "Celular" : "Desktop"}
      </header>
      <div className="plan-content-lab__viewport">
        <div className="plan-content-lab__viewport-inner">
          <LabAlumnaPreviewChrome variant={variant}>
            {children}
          </LabAlumnaPreviewChrome>
        </div>
      </div>
    </article>
  );
}

function PreviewPlaceholder({ message }: { message: string }) {
  return (
    <p className="plan-content-lab__placeholder">{message}</p>
  );
}

type LabDashboardProps = {
  rutina: RutinaDetail;
  planDays: ReturnType<typeof buildPlanDays>;
  copy: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
  };
  previewKey: string;
};

function LabDashboard({
  rutina,
  planDays,
  copy,
  previewKey,
}: LabDashboardProps) {
  return (
    <PlanDaysDashboard
      key={previewKey}
      rutina={rutina}
      days={planDays}
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
      ariaLabel="Vista previa del plan"
      sheetContainment="viewport"
    />
  );
}

type LabStoryPreviewProps = {
  rutina: RutinaDetail;
  selectedDayNumber: number;
  previewKey: string;
};

function LabStoryPreview({
  rutina,
  selectedDayNumber,
  previewKey,
}: LabStoryPreviewProps) {
  const dayInfo = useMemo(
    () => resolveDayInfoForPlanDayNumber(rutina, selectedDayNumber),
    [rutina, selectedDayNumber],
  );

  if (!dayInfo) {
    return (
      <PreviewPlaceholder message="No hay contenido para el día seleccionado." />
    );
  }

  const dayDateKey = `lab-preview-day-${selectedDayNumber}`;

  return (
    <TrainingStoryPreview
      key={previewKey}
      rutina={rutina}
      dayInfo={dayInfo}
      dayDateKey={dayDateKey}
      isDayCompleted={false}
      onFinishDay={() => undefined}
    />
  );
}

export function PlanContentPreviewLab({
  rutina,
  planContentDraft,
  selectedDayNumber,
  hasUnsavedTemplate = false,
  totalDays,
  onSave,
  canSave = false,
  saving = false,
  saveBlockedReason = null,
  showIncompleteWeeksHint = false,
}: PlanContentPreviewLabProps) {
  const [unlockAllDays, setUnlockAllDays] = useState(false);
  const [activeView, setActiveView] = useState<LabPreviewView>("plan");
  const [device, setDevice] = useState<LabPreviewDevice>("desktop");

  const dayInfo = useMemo(
    () => (rutina ? resolveRutinaDay(rutina) : null),
    [rutina],
  );

  const planDays = useMemo(() => {
    if (!rutina || !dayInfo || totalDays === 0) return [];

    const hasCustomContent =
      Boolean(rutina.challenge28?.days?.length) ||
      Boolean(rutina.challenge28?.weeks?.length) ||
      Boolean(rutina.challenge28?.title) ||
      Boolean(rutina.challenge28?.subtitle) ||
      Boolean(rutina.challenge28?.accentLabel);

    const days = hasCustomContent
      ? buildChallenge28Days(rutina, dayInfo, totalDays)
      : buildPlanDays(rutina, dayInfo);

    return unlockAllDays ? unlockAllPlanDays(days) : days;
  }, [dayInfo, rutina, totalDays, unlockAllDays]);

  const copy = {
    eyebrow: planContentDraft.accentLabel.trim() || undefined,
    title: planContentDraft.title.trim() || undefined,
    subtitle: planContentDraft.subtitle.trim() || undefined,
  };

  const showPreview = Boolean(rutina && totalDays > 0 && planDays.length > 0);

  const placeholderMessage =
    totalDays === 0
      ? "Agregá al menos un día al plan para previsualizar."
      : "Completá el contenido del plan para previsualizar.";

  function renderPreviewContent(previewKey: string) {
    if (!showPreview || !rutina) {
      return <PreviewPlaceholder message={placeholderMessage} />;
    }

    if (activeView === "story") {
      return (
        <LabStoryPreview
          rutina={rutina}
          selectedDayNumber={selectedDayNumber}
          previewKey={previewKey}
        />
      );
    }

    return (
      <LabDashboard
        rutina={rutina}
        planDays={planDays}
        copy={copy}
        previewKey={previewKey}
      />
    );
  }

  return (
    <section className="plan-content-lab" aria-label="Laboratorio vista alumna">
      <div className="plan-content-lab__header">
        <div>
          <h3>Laboratorio — vista alumna</h3>
          <p>Vista previa en tiempo real de cómo verá la alumna el plan.</p>
        </div>
        <div className="plan-content-lab__header-actions">
          {onSave ? (
            <div className="plan-content-lab__save">
              <Button
                type="button"
                disabled={!canSave || saving}
                onClick={onSave}
              >
                {saving ? "Guardando plantilla..." : "Guardar plantilla"}
              </Button>
              {saveBlockedReason ? (
                <p className="plan-content-lab__hint" role="status">
                  {saveBlockedReason}
                </p>
              ) : null}
              {showIncompleteWeeksHint && canSave ? (
                <p className="plan-content-lab__hint">
                  Podés guardar el contenido sin completar todos los ejercicios;
                  las semanas incompletas no se sobrescriben.
                </p>
              ) : null}
            </div>
          ) : null}
          {showPreview ? (
            <label className="plan-content-lab__unlock-toggle auth-checkbox">
              <input
                type="checkbox"
                checked={unlockAllDays}
                onChange={(event) => setUnlockAllDays(event.target.checked)}
              />
              <span>Desbloquear todos los días</span>
            </label>
          ) : null}
          {hasUnsavedTemplate ? (
            <p className="plan-content-lab__pending" role="status">
              Plantilla con cambios sin guardar
            </p>
          ) : null}
        </div>
      </div>

      {showPreview ? (
        <div className="plan-content-lab__tabs-wrap profe-tabbed-content">
          <ProfeChromeTabs
            ariaLabel="Vista previa del laboratorio"
            tabIdPrefix="lab-tab"
            activeTab={activeView}
            onTabChange={(next) => setActiveView(next as LabPreviewView)}
            tabs={[
              {
                id: "plan",
                label: "MI PLAN",
                controls: "lab-panel-plan",
              },
              {
                id: "story",
                label: "HISTORIA",
                controls: "lab-panel-story",
              },
            ]}
          />
        </div>
      ) : null}

      {showPreview ? (
        <div
          className="plan-content-lab__device-toggle"
          role="group"
          aria-label="Dispositivo de la vista previa"
        >
          {(["mobile", "desktop"] as const).map((deviceOption) => (
            <button
              key={deviceOption}
              type="button"
              aria-pressed={device === deviceOption}
              className={`plan-content-lab__device-toggle-btn${
                device === deviceOption ? " is-active" : ""
              }`}
              onClick={() => setDevice(deviceOption)}
            >
              {deviceOption === "mobile" ? "Celular" : "Desktop"}
            </button>
          ))}
        </div>
      ) : null}

      <div className="plan-content-lab__frames">
        <PreviewFrame variant={device}>
          {renderPreviewContent(device === "mobile" ? "lab-mobile" : "lab-desktop")}
        </PreviewFrame>
      </div>
    </section>
  );
}
