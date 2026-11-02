"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { IvisContentLoader } from "@/components/IvisContentLoader";
import { ProfeChromeTabs } from "@/features/profe/components/ProfeChromeTabs";
import { AlimentacionTabSummary } from "@/features/profe/components/alimentacion-plan/AlimentacionTabSummary";
import { ListaComprasSemanasCard } from "@/features/profe/components/alimentacion-plan/ListaComprasSemanasCard";
import { PlanNutricionalWorkspaceProvider } from "@/features/profe/context/PlanNutricionalWorkspaceProvider";
import {
  AlumnaProfileSections,
} from "@/features/profe/components/AlumnaDetailSections";
import { HealthChangesReview } from "@/features/profe/components/HealthChangesReview";
import { AlumnaHistorialSection } from "@/features/profe/components/historial/AlumnaHistorialSection";
import { AlumnaRutinaSection } from "@/features/profe/components/AlumnaRutinaSection";
import { MensajesThread } from "@/features/shared/MensajesThread";
import { useAlumnaUnsavedReporter } from "@/features/profe/context/AlumnaUnsavedChangesProvider";
import type { PlanTemplate } from "@/features/profe/hooks/usePlanTemplates";
import {
  getAlumnaDetailTabFromParam,
  profeAlumnaDetailTabRoute,
  type AlumnaDetailTab,
} from "@/routes/paths";
import { resolveModoPlan, type ModoPlan } from "@/lib/modo-plan";
import type { AlumnaDetail } from "@/types/usuario";

const SeguimientoContent = dynamic(
  () =>
    import("@/features/profe/pages/AlumnaSeguimientoPage").then(
      (mod) => mod.SeguimientoContent,
    ),
  {
    loading: () => (
      <IvisContentLoader variant="section" label="Cargando seguimiento" />
    ),
  },
);

const PlieguesContent = dynamic(
  () =>
    import("@/features/profe/pages/AlumnaPlieguesPage").then(
      (mod) => mod.PlieguesContent,
    ),
  {
    loading: () => (
      <IvisContentLoader variant="section" label="Cargando pliegues" />
    ),
  },
);

const ALUMNA_DETAIL_TABS: Array<{ id: AlumnaDetailTab; label: string }> = [
  { id: "perfil", label: "Perfil" },
  { id: "rutina", label: "Rutina" },
  { id: "seguimiento", label: "Seguimiento" },
  { id: "alimentacion", label: "Alimentación" },
  { id: "pliegues", label: "Pliegues" },
  { id: "mensajes", label: "Mensajes" },
  { id: "historial", label: "Historial" },
];

function hiddenTabsFor(modoPlan: ModoPlan): Set<AlumnaDetailTab> {
  if (modoPlan === "alimentacion") return new Set(["rutina", "seguimiento"]);
  if (modoPlan === "rutina") return new Set(["alimentacion"]);
  return new Set();
}

export function AlumnaDetailTabbedContent({
  alumna,
  planTemplates,
  onAlumnaUpdated,
}: AlumnaDetailTabbedContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = getAlumnaDetailTabFromParam(searchParams.get("tab"));
  const modoPlan = resolveModoPlan(alumna);
  const hiddenTabs = hiddenTabsFor(modoPlan);
  const visibleTabs = ALUMNA_DETAIL_TABS.filter((item) => !hiddenTabs.has(item.id));
  const { reportSectionDirty } = useAlumnaUnsavedReporter();
  const [showHealthReview, setShowHealthReview] = useState(false);

  function setTab(next: AlumnaDetailTab) {
    if (next === tab) return;
    router.replace(profeAlumnaDetailTabRoute(alumna.id, next));
  }

  useEffect(() => {
    if (!hiddenTabsFor(modoPlan).has(tab)) return;
    router.replace(profeAlumnaDetailTabRoute(alumna.id, "perfil"));
  }, [alumna.id, modoPlan, router, tab]);

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
    if (hiddenTabs.has(tab)) return null;
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
            <PlanNutricionalWorkspaceProvider alumnaId={alumna.id}>
              <div className="alimentacion-tab-stack">
                <AlimentacionTabSummary
                  alumnaId={alumna.id}
                  alumnaNombre={alumna.nombre}
                />
                <ListaComprasSemanasCard alumnaId={alumna.id} />
              </div>
            </PlanNutricionalWorkspaceProvider>
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
          tabs={visibleTabs.map(({ id, label }) => ({
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