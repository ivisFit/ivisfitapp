"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/Button";
import { ChartSkeleton, FormSkeleton, SkeletonLine, TableSkeleton } from "@/components/skeletons/AppSkeleton";
import { CircunferenciaForm } from "@/components/mediciones/CircunferenciaForm";
import { PlieguesHistoryTable } from "@/features/profe/components/pliegues/PlieguesHistoryTable";
import { useMeProfile } from "@/features/alumna/hooks/useMeProfile";
import { useMisCircunferencias } from "@/features/alumna/hooks/useMisCircunferencias";
import { useInvalidateGamificacion } from "@/features/gamificacion/hooks/useGamificacion";
import { alumnaRoutes } from "@/routes/paths";

const PlieguesHistoryChart = dynamic(
  () =>
    import("@/features/profe/components/pliegues/PlieguesHistoryChart").then(
      (mod) => mod.PlieguesHistoryChart,
    ),
  {
    ssr: false,
    loading: () => (
      <section className="pliegues-chart">
        <ChartSkeleton height="chart-md" />
      </section>
    ),
  },
);

export function CircunferenciasPage() {
  const { profile, loading: profileLoading, error: profileError } = useMeProfile();
  const enabled = profile?.circunferenciasHabilitadas === true;
  const { mediciones, loading, error, refetch } = useMisCircunferencias(enabled);
  const invalidateGamificacion = useInvalidateGamificacion();

  const handleMedicionGuardada = () => {
    void refetch();
    invalidateGamificacion();
  };

  if (profileLoading) {
    return (
      <div className="circunferencias-page page" aria-busy="true" aria-label="Cargando">
        <SkeletonLine size="2xl" width="w-40" gold />
        <FormSkeleton fields={3} />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="circunferencias-page page">
        <div className="feature-card circunferencias-state" role="alert">
          <p className="auth-error">{profileError}</p>
          <Link className="btn btn--ghost" href={alumnaRoutes.progreso}>
            Volver a Progreso
          </Link>
        </div>
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className="circunferencias-page page">
        <h1>Circunferencias</h1>
        <div className="feature-card circunferencias-state">
          <p>
            La medición de circunferencias no está habilitada para tu cuenta. Tu
            profesora puede activarla desde tu ficha de pliegues.
          </p>
          <Link href={alumnaRoutes.progreso}>Volver a Progreso</Link>
        </div>
      </div>
    );
  }

  if (!profile?.sexo) {
    return (
      <div className="circunferencias-page page">
        <div className="feature-card circunferencias-state" role="alert">
          <p className="auth-error">
            Tu perfil debe tener sexo registrado para calcular la grasa corporal.
          </p>
          <Link className="btn btn--ghost" href={alumnaRoutes.progreso}>
            Volver a Progreso
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="circunferencias-page page alumna-pliegues-view">
      <div className="alumna-pliegues-body">
        <section className="pliegues-hero">
          <div className="pliegues-hero__copy">
            <span className="pliegues-hero__eyebrow">Composición corporal</span>
            <h1>Circunferencias</h1>
            <p>
              Registrá tus mediciones de cuello, cintura y cadera con la fórmula
              US Navy para seguir tu porcentaje de grasa corporal.
            </p>
          </div>
        </section>

        {loading ? (
          <div className="pliegues-layout" aria-busy="true" aria-label="Cargando mediciones">
            <div className="pliegues-layout__row">
              <section className="pliegues-form-card feature-card">
                <FormSkeleton fields={3} />
              </section>
              <ChartSkeleton height="chart" />
            </div>
            <div className="feature-card">
              <TableSkeleton rows={3} columns={["3rem", "1fr", "4rem"]} />
            </div>
          </div>
        ) : error ? (
          <div className="feature-card circunferencias-state" role="alert">
            <p className="auth-error">{error}</p>
            <Button type="button" variant="ghost" onClick={() => void refetch()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="pliegues-layout">
            <div className="pliegues-layout__row">
              <section className="pliegues-form-card feature-card">
                <h2>Nueva medición</h2>
                <CircunferenciaForm
                  sexo={profile.sexo}
                  alturaCm={profile.alturaCm}
                  onSuccess={handleMedicionGuardada}
                />
              </section>
              <PlieguesHistoryChart
                mediciones={mediciones}
                sexo={profile.sexo}
                metodo="us-navy"
              />
            </div>
            <PlieguesHistoryTable
              mediciones={mediciones}
              sexo={profile.sexo}
              metodo="us-navy"
            />
          </div>
        )}
      </div>
    </div>
  );
}
