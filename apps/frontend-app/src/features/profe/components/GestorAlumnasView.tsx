"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { AdmisionesPanel } from "@/features/profe/components/AdmisionesPanel";
import { GestorAlumnasPanel } from "@/features/profe/components/GestorAlumnasPanel";
import { ProfeChromeTabs } from "@/features/profe/components/ProfeChromeTabs";
import { useAdmisiones } from "@/features/profe/hooks/useAdmisiones";
import { useAlumnas } from "@/features/profe/hooks/useAlumnas";
import { useAuth } from "@/context/AuthContext";
import { profeAlumnasAdmisionesRoute, profeRoutes } from "@/routes/paths";

type AlumnasTab = "alumnas" | "admisiones";

function getTabFromSearchParams(
  searchParams: ReturnType<typeof useSearchParams>,
): AlumnasTab {
  return searchParams.get("tab") === "admisiones" ? "admisiones" : "alumnas";
}

export function GestorAlumnasView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = getTabFromSearchParams(searchParams);
  const { user, loading: authLoading } = useAuth();
  const isProfe = !authLoading && user?.role === "profe";

  const { alumnas, loading, error, refetch } = useAlumnas(isProfe);
  const {
    solicitudes,
    loading: admisionesLoading,
    actionId,
    error: admisionesError,
    refetch: refetchAdmisiones,
    decidir,
  } = useAdmisiones(isProfe);

  function setTab(next: AlumnasTab) {
    if (next === tab) return;

    if (next === "admisiones") {
      router.replace(profeAlumnasAdmisionesRoute());
      return;
    }

    // Keep filtro when returning to alumnas list
    const filtro = searchParams.get("filtro");
    const href = filtro
      ? `${profeRoutes.alumnas}?filtro=${filtro}`
      : profeRoutes.alumnas;
    router.replace(href);
  }

  function handleRefresh() {
    if (tab === "alumnas") {
      void refetch();
    } else {
      void refetchAdmisiones();
    }
  }

  const subtitle =
    tab === "alumnas"
      ? "Alumnas admitidas en el programa."
      : "Revisá las solicitudes pendientes y admitilas al panel.";

  const alumnasLabel = alumnas.length === 1 ? "ALUMNA" : "ALUMNAS";
  const admisionesLabel =
    solicitudes.length === 1 ? "ADMISIÓN" : "ADMISIONES";

  return (
    <div className="page alumnas-page">
      <div className="page__actions">
        <div>
          <h1>Alumnas</h1>
          <p>{subtitle}</p>
        </div>
        <Button type="button" variant="ghost" onClick={handleRefresh}>
          Actualizar
        </Button>
      </div>

      <div className="profe-tabbed-content">
        <ProfeChromeTabs
          ariaLabel="Vista de alumnas"
          tabIdPrefix="alumnas-tab"
          activeTab={tab}
          onTabChange={(next) => setTab(next as AlumnasTab)}
          tabs={[
            {
              id: "alumnas",
              label: alumnasLabel,
              count: alumnas.length,
              countLoading: authLoading || loading,
              controls: "alumnas-panel-alumnas",
            },
            {
              id: "admisiones",
              label: admisionesLabel,
              count: solicitudes.length,
              countLoading: authLoading || admisionesLoading,
              controls: "alumnas-panel-admisiones",
            },
          ]}
        />

        {tab === "alumnas" ? (
          <div
            id="alumnas-panel-alumnas"
            className="profe-tabbed-content__panel profe-tabbed-content__panel--bare"
            role="tabpanel"
            aria-labelledby="alumnas-tab-alumnas"
          >
            <GestorAlumnasPanel
              alumnas={alumnas}
              loading={authLoading || loading}
              error={error}
              onRetry={refetch}
            />
          </div>
        ) : (
          <div
            id="alumnas-panel-admisiones"
            className="profe-tabbed-content__panel"
            role="tabpanel"
            aria-labelledby="alumnas-tab-admisiones"
          >
            <AdmisionesPanel
              solicitudes={solicitudes}
              loading={authLoading || admisionesLoading}
              actionId={actionId}
              error={admisionesError}
              onRetry={refetchAdmisiones}
              onDecidir={(id, accion) => void decidir(id, accion)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
