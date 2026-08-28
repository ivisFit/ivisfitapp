"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ProfeChromeTabs } from "@/features/profe/components/ProfeChromeTabs";
import { AlumnaAlimentacionWorkspace } from "@/features/profe/components/AlumnaAlimentacionWorkspace";
import {
  AlumnaProfileSections,
} from "@/features/profe/components/AlumnaDetailSections";
import { HealthChangesReview } from "@/features/profe/components/HealthChangesReview";
import { AlumnaHistorialSection } from "@/features/profe/components/historial/AlumnaHistorialSection";
import { AlumnaRutinaSection } from "@/features/profe/components/AlumnaRutinaSection";
import { MensajesThread } from "@/features/shared/MensajesThread";
import { SeguimientoContent } from "@/features/profe/pages/AlumnaSeguimientoPage";
import { PlieguesContent } from "@/features/profe/pages/AlumnaPlieguesPage";
import { useAlumnaUnsavedReporter } from "@/features/profe/context/AlumnaUnsavedChangesProvider";
import type { PlanTemplate } from "@/features/profe/hooks/usePlanTemplates";
import {
  getAlumnaDetailTabFromParam,
  profeAlumnaDetailTabRoute,
  type AlumnaDetailTab,
} from "@/routes/paths";
import type { AlumnaDetail } from "@/types/usuario";

const ALUMNA_DETAIL_TABS: Array<{ id: AlumnaDetailTab; label: string }> = [
  { id: "perfil", label: "Perfil" },
  { id: "rutina", label: "Rutina" },
  { id: "seguimiento", label: "Seguimiento" },
  { id: "alimentacion", label: "Alimentación" },
  { id: "pliegues", label: "Pliegues" },
  { id: "mensajes", label: "Mensajes" },
  { id: "historial", label: "Historial" },
];

export function AlumnaDetailTabbedContent({
  alumna,
  planTemplates,
  onAlumnaUpdated,
}: AlumnaDetailTabbedContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = getAlumnaDetailTabFromParam(searchParams.get("tab"));
  const { reportSectionDirty } = useAlumnaUnsavedReporter();
  const [showHealthReview, setShowHealthReview] = useState(false);

  function setTab(next: AlumnaDetailTab) {
    if (next === tab) return;
    router.replace(profeAlumnaDetailTabRoute(alumna.id, next));
  }

  function handleReviewHealthChanges() {
    setShowHealthReview(true);
  }

  function handleHealthReviewClose() {
    setShowHealthReview(false);
  }

  function handleHealthReviewChange() {
    onAlumnaUpdated?.();
  }

  function renderActiveTab() {
    switch (tab) {
      case "perfil":
        return (
          <div
            id="alumna-detail-panel-perfil"
            className="profe-tabbed-content__panel alumna-detail-tabbed__panel"
            role="tabpanel"
            aria-labelledby="alumna-detail-tab-perfil"
          >
            <AlumnaProfileSections
              alumna={alumna}
              onReviewHealthChanges={handleReviewHealthChanges}
              onAlumnaUpdated={onAlumnaUpdated}
            />
          </div>
        );
      case "rutina":
        return (
          <div
            id="alumna-detail-panel-rutina"
            className="profe-tabbed-content__panel alumna-detail-tabbed__panel"
            role="tabpanel"
            aria-labelledby="alumna-detail-tab-rutina"
          >
            <AlumnaRutinaSection
              alumna={alumna}
              planTemplates={planTemplates}
              onDirtyChange={(dirty) => reportSectionDirty("rutina", dirty)}
            />
          </div>
        );
      case "historial":
        return (
          <div
            id="alumna-detail-panel-historial"
            className="profe-tabbed-content__panel alumna-detail-tabbed__panel"
            role="tabpanel"
            aria-labelledby="alumna-detail-tab-historial"
          >
            <AlumnaHistorialSection alumnaId={alumna.id} />
          </div>
        );
      case "seguimiento":
        return (
          <div
            id="alumna-detail-panel-seguimiento"
            className="profe-tabbed-content__panel alumna-detail-tabbed__panel"
            role="tabpanel"
            aria-labelledby="alumna-detail-tab-seguimiento"
          >
            <SeguimientoContent alumnaId={alumna.id} alumnaNombre={alumna.nombre} />
          </div>
        );
      case "alimentacion":
        return (
          <div
            id="alumna-detail-panel-alimentacion"
            className="profe-tabbed-content__panel alumna-detail-tabbed__panel"
            role="tabpanel"
            aria-labelledby="alumna-detail-tab-alimentacion"
          >
            <AlumnaAlimentacionWorkspace
              alumnaId={alumna.id}
              alumnaNombre={alumna.nombre}
              alumnaEmail={alumna.email}
              onDirtyChange={(dirty) => reportSectionDirty("alimentacion", dirty)}
            />
          </div>
        );
      case "pliegues":
        return (
          <div
            id="alumna-detail-panel-pliegues"
            className="profe-tabbed-content__panel alumna-detail-tabbed__panel"
            role="tabpanel"
            aria-labelledby="alumna-detail-tab-pliegues"
          >
            <PlieguesContent
              alumnaId={alumna.id}
              alumnaNombre={alumna.nombre}
              sexo={alumna.sexo}
              alturaCm={alumna.alturaCm}
              circunferenciasHabilitadas={alumna.circunferenciasHabilitadas === true}
              onAlumnaUpdated={onAlumnaUpdated ?? (() => {})}
              onPlieguesDirtyChange={(dirty) => reportSectionDirty("pliegues", dirty)}
            />
          </div>
        );
      case "mensajes":
        return (
          <div
            id="alumna-detail-panel-mensajes"
            className="profe-tabbed-content__panel alumna-detail-tabbed__panel"
            role="tabpanel"
            aria-labelledby="alumna-detail-tab-mensajes"
          >
            <MensajesThread alumnaId={alumna.id} viewerRole="profe" />
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <>
      <div className="alumna-detail-tabbed profe-tabbed-content">
        <ProfeChromeTabs
          ariaLabel="Secciones del perfil de alumna"
          tabIdPrefix="alumna-detail-tab"
          activeTab={tab}
          onTabChange={(next) => setTab(next as AlumnaDetailTab)}
          tabs={ALUMNA_DETAIL_TABS.map(({ id, label }) => ({
            id,
            label,
            controls: `alumna-detail-panel-${id}`,
          }))}
        />

        {renderActiveTab()}
      </div>

      {showHealthReview && (
        <HealthChangesReview
          alumna={alumna}
          onClose={handleHealthReviewClose}
          onChange={handleHealthReviewChange}
        />
      )}
    </>
  );
}

type AlumnaDetailTabbedContentProps = {
  alumna: AlumnaDetail;
  planTemplates: PlanTemplate[];
  onAlumnaUpdated?: () => void;
};