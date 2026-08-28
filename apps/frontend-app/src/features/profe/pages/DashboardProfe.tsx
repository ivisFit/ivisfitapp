"use client";

import dynamic from "next/dynamic";
import { PanelAdherenciaList } from "@/features/profe/components/panel/PanelAdherenciaList";
import { PanelActivityList } from "@/features/profe/components/panel/PanelActivityList";
import { PanelAppointmentsList } from "@/features/profe/components/panel/PanelAppointmentsList";
import { PanelColaHoy } from "@/features/profe/components/panel/PanelColaHoy";
import { PanelHeader } from "@/features/profe/components/panel/PanelHeader";
import { PanelMetricCards } from "@/features/profe/components/panel/PanelMetricCards";
import { PanelSkeleton } from "@/features/profe/components/panel/PanelSkeleton";
import type { PanelDashboardDto } from "@/features/profe/types/panel";
import { usePanelDashboard } from "@/features/profe/hooks/usePanelDashboard";
import { useAuth } from "@/context/AuthContext";

type DashboardProfeProps = {
  initialData?: PanelDashboardDto | null;
};

const PanelWeeklyBarChart = dynamic(
  () =>
    import("@/features/profe/components/panel/PanelWeeklyBarChart").then(
      (mod) => mod.PanelWeeklyBarChart,
    ),
  {
    ssr: false,
    loading: () => (
      <section className="profe-dashboard__chart-card glass-surface glass-surface--elevated">
        <h3 className="profe-dashboard__chart-title">
          Entrenamientos completados
        </h3>
        <div className="profe-dashboard__skeleton profe-dashboard__skeleton--chart" />
      </section>
    ),
  },
);

const PanelPlansPieChart = dynamic(
  () =>
    import("@/features/profe/components/panel/PanelPlansPieChart").then(
      (mod) => mod.PanelPlansPieChart,
    ),
  {
    ssr: false,
    loading: () => (
      <section className="profe-dashboard__chart-card glass-surface glass-surface--elevated">
        <h3 className="profe-dashboard__chart-title">
          Tipos de Planes Asignados
        </h3>
        <div className="profe-dashboard__skeleton profe-dashboard__skeleton--chart" />
      </section>
    ),
  },
);

export function DashboardProfe({ initialData = null }: DashboardProfeProps) {
  const { user } = useAuth();
  const { data, loading, error, refetch, refreshing } =
    usePanelDashboard(initialData);

  return (
    <div className="page profe-dashboard">
      <PanelHeader
        nombre={user?.name ?? "Profesora"}
        onRefresh={refetch}
        refreshing={refreshing}
      />

      {error ? (
        <section className="glass-surface glass-surface--coral profe-dashboard__error">
          <p className="profe-dashboard__error-icon" aria-hidden>
            ⚠
          </p>
          <p className="auth-error">{error}</p>
        </section>
      ) : null}

      {loading && !data ? <PanelSkeleton /> : null}

      {!loading && !data && !error ? (
        <section className="glass-surface profe-dashboard__error">
          <p className="profe-dashboard__empty">
            No se pudo mostrar el panel. Probá actualizar la página.
          </p>
          <button type="button" className="btn btn--ghost" onClick={refetch}>
            Reintentar
          </button>
        </section>
      ) : null}

      {data ? (
        <>
          {data.cola?.counts ? (
            <PanelColaHoy counts={data.cola.counts} />
          ) : null}

          <PanelMetricCards
            metricas={data.metricas}
            tendencias={data.tendencias}
            progreso30d={data.progreso30d}
          />

          <div className="profe-dashboard__row">
            <PanelActivityList items={data.actividadReciente} />
            <PanelAppointmentsList items={data.proximasCitas} />
          </div>

          <section className="profe-dashboard__kpi-section">
            <h2 className="profe-dashboard__kpi-heading">KPI</h2>
            <div className="profe-dashboard__charts">
              <PanelWeeklyBarChart
                data7d={data.progresoSemanal}
                data30d={data.progreso30d}
              />
              <PanelPlansPieChart data={data.distribucionPlanes} />
            </div>
          </section>

          <PanelAdherenciaList items={data.alumnasAtencion} />
        </>
      ) : null}
    </div>
  );
}
