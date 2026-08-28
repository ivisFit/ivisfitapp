"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/Button";
import { CardSkeleton, ChartSkeleton, SkeletonLine } from "@/components/skeletons/AppSkeleton";
import { CircunferenciasAlumnaToggleCard } from "@/features/profe/components/pliegues/CircunferenciasAlumnaToggleCard";
import { MetodoCalculoSelector } from "@/features/profe/components/pliegues/MetodoCalculoSelector";
import { SkinfoldForm } from "@/features/profe/components/SkinfoldForm";
import { PlieguesHistoryTable } from "@/features/profe/components/pliegues/PlieguesHistoryTable";
import { PlieguesPeriodFilter } from "@/features/profe/components/pliegues/PlieguesPeriodFilter";
import { PlieguesSummaryCards } from "@/features/profe/components/pliegues/PlieguesSummaryCards";
import { useAlumna } from "@/features/profe/hooks/useAlumna";
import type { AlumnaDetail } from "@/types/usuario";
import { useAlumnaMediciones } from "@/features/profe/hooks/useAlumnaMediciones";
import type { MetodoCalculo } from "@/features/profe/types/medicion";
import {
  profeAlumnaDetailRoute,
  profeRoutes,
} from "@/routes/paths";
import {
  filterMedicionesByMetodo,
  filterMedicionesByPeriod,
  type PlieguesPeriod,
} from "@/features/profe/utils/pliegues-period";
import type { Sexo } from "@/types/usuario";
import { useMediaQuery, isMobileQuery } from "@/hooks/useMediaQuery";

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

function BackIcon() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function PlieguesNav({
  alumnaId,
  alumnaNombre,
}: {
  alumnaId: string;
  alumnaNombre?: string;
}) {
  return (
    <nav className="alumna-detail-hero__nav" aria-label="Navegación de pliegues">
      <Link
        href={profeAlumnaDetailRoute(alumnaId)}
        className="alumna-detail-hero__back"
        aria-label="Volver al perfil de la alumna"
      >
        <BackIcon />
      </Link>
      <span className="alumna-detail-hero__title">
        {alumnaNombre ? `Pliegues · ${alumnaNombre}` : "Pliegues"}
      </span>
      <span className="alumna-detail-hero__nav-spacer" aria-hidden />
    </nav>
  );
}

export function PlieguesContent({
  alumnaId,
  alumnaNombre,
  sexo,
  alturaCm,
  circunferenciasHabilitadas,
  onAlumnaUpdated,
  onPlieguesDirtyChange,
}: {
  alumnaId: string;
  alumnaNombre: string;
  sexo?: Sexo;
  alturaCm?: number;
  circunferenciasHabilitadas: boolean;
  onAlumnaUpdated: () => void;
  onPlieguesDirtyChange?: (dirty: boolean) => void;
}) {
  const [period, setPeriod] = useState<PlieguesPeriod>("90d");
  const [metodoCalculo, setMetodoCalculo] = useState<MetodoCalculo>("jp3");
  const { mediciones, loading, error, refetch } = useAlumnaMediciones(alumnaId);

  const filteredMediciones = useMemo(() => {
    const byPeriod = filterMedicionesByPeriod(mediciones, period);
    return filterMedicionesByMetodo(byPeriod, metodoCalculo);
  }, [mediciones, period, metodoCalculo]);

  if (loading) {
    return (
      <div aria-busy="true" aria-label="Cargando pliegues">
        <SkeletonLine size="lg" width="w-48" gold />
        <CardSkeleton lines={2} />
        <CardSkeleton lines={3} />
      </div>
    );
  }

  if (error) {
    return (
      <>
        <p className="auth-error">{error}</p>
        <Button type="button" variant="ghost" onClick={() => void refetch()}>
          Reintentar
        </Button>
      </>
    );
  }

  if (!sexo) {
    return (
      <p className="auth-error">
        La alumna debe tener sexo registrado para calcular la grasa corporal.
      </p>
    );
  }

  return (
    <>
      <section className="pliegues-hero">
        <div className="pliegues-hero__top">
          <div className="pliegues-hero__copy">
            <span className="pliegues-hero__eyebrow">Composición corporal</span>
            <h1>{alumnaNombre}</h1>
            <p>
              Seguimiento de grasa corporal por pliegues (Jackson-Pollock) o
              circunferencias (US Navy). Elegí el método y registrá cada medición.
            </p>
          </div>
          <PlieguesPeriodFilter value={period} onChange={setPeriod} />
        </div>
        <MetodoCalculoSelector
          value={metodoCalculo}
          onChange={setMetodoCalculo}
        />
        <PlieguesSummaryCards
          mediciones={filteredMediciones}
          sexo={sexo}
          metodo={metodoCalculo}
        />
      </section>

      <div className="pliegues-layout">
        <CircunferenciasAlumnaToggleCard
          alumnaId={alumnaId}
          enabled={circunferenciasHabilitadas}
          onUpdated={onAlumnaUpdated}
        />
        <div className="pliegues-layout__row">
          <section className="pliegues-form-card">
            <h2>Nueva medición</h2>
            <SkinfoldForm
              alumnaId={alumnaId}
              sexo={sexo}
              alturaCm={alturaCm}
              metodo={metodoCalculo}
              onSuccess={() => void refetch()}
              onDirtyChange={onPlieguesDirtyChange}
            />
          </section>
          <PlieguesHistoryChart
            mediciones={filteredMediciones}
            sexo={sexo}
            metodo={metodoCalculo}
          />
        </div>
        <PlieguesHistoryTable
          mediciones={filteredMediciones}
          sexo={sexo}
          metodo={metodoCalculo}
        />
      </div>
    </>
  );
}

function AlumnaPlieguesView({
  id,
  alumna,
  alumnaLoading,
  alumnaError,
  alumnaNombre,
}: {
  id: string;
  alumna: AlumnaDetail | null;
  alumnaLoading: boolean;
  alumnaError: string | null;
  alumnaNombre: string;
}) {
  const isMobile = useMediaQuery(isMobileQuery);

  const renderContent = () => {
    if (alumnaLoading) {
      return <SkeletonLine size="lg" width="w-48" gold />;
    }
    if (alumnaError) {
      return <p className="auth-error">{alumnaError}</p>;
    }
    return (
      <PlieguesContent
        alumnaId={id}
        alumnaNombre={alumnaNombre}
        sexo={alumna?.sexo}
        alturaCm={alumna?.alturaCm}
        circunferenciasHabilitadas={alumna?.circunferenciasHabilitadas === true}
        onAlumnaUpdated={() => {}}
      />
    );
  };

  if (isMobile) {
    return (
      <div className="alumna-pliegues-mobile">
        <div className="alumna-detail-hero-fixed pliegues-hero-fixed" aria-hidden>
          <div className="pliegues-hero-fixed__glow" />
        </div>
        <PlieguesNav alumnaId={id} alumnaNombre={alumna?.nombre} />
        <div className="alumna-detail-hero-spacer" aria-hidden />
        <div className="alumna-pliegues-body">
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="alumna-pliegues-desktop">
      <p className="page__back">
        <Link href={profeAlumnaDetailRoute(id)}>
          ← Perfil de {alumnaNombre}
        </Link>
        <span aria-hidden> · </span>
        <Link href={profeRoutes.alumnas}>Alumnas</Link>
      </p>
      {renderContent()}
    </div>
  );
}

export function AlumnaPlieguesPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : undefined;
  const { alumna, loading: alumnaLoading, error: alumnaError } = useAlumna(id);

  if (!id) {
    return <p className="auth-error">Alumna no encontrada</p>;
  }

  const alumnaNombre = alumna?.nombre ?? "Alumna";

  return (
    <div className="alumna-pliegues-view page">
      <AlumnaPlieguesView
        id={id}
        alumna={alumna}
        alumnaLoading={alumnaLoading}
        alumnaError={alumnaError}
        alumnaNombre={alumnaNombre}
      />
    </div>
  );
}