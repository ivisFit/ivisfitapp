"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/Button";
import { CardSkeleton, InlineSkeleton, SkeletonLine } from "@/components/skeletons/AppSkeleton";
import { SeguimientoDayTimeline } from "@/features/profe/components/seguimiento/SeguimientoDayTimeline";
import { SeguimientoHero } from "@/features/profe/components/seguimiento/SeguimientoHero";
import { useAlumna } from "@/features/profe/hooks/useAlumna";
import type { AlumnaDetail } from "@/types/usuario";
import { useAlumnaSeguimiento } from "@/features/profe/hooks/useAlumnaSeguimiento";
import {
  profeAlumnaDetailRoute,
  profeAlumnaDetailTabRoute,
  profeRoutes,
} from "@/routes/paths";
import { useMediaQuery, isMobileQuery } from "@/hooks/useMediaQuery";

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

function SeguimientoNav({ alumnaId, alumnaNombre }: { alumnaId: string; alumnaNombre?: string }) {
  return (
    <nav className="alumna-detail-hero__nav" aria-label="Navegación de seguimiento">
      <Link
        href={profeAlumnaDetailRoute(alumnaId)}
        className="alumna-detail-hero__back"
        aria-label="Volver al perfil de la alumna"
      >
        <BackIcon />
      </Link>
      <span className="alumna-detail-hero__title">
        {alumnaNombre ? `Seguimiento · ${alumnaNombre}` : "Seguimiento"}
      </span>
      <span className="alumna-detail-hero__nav-spacer" aria-hidden />
    </nav>
  );
}

export function SeguimientoContent({
  alumnaId,
  alumnaNombre,
}: {
  alumnaId: string;
  alumnaNombre: string;
}) {
  const {
    rutina,
    dayViews,
    stats,
    pesosBySlot,
    loading,
    error,
    refetch,
  } = useAlumnaSeguimiento(alumnaId);

  if (loading) {
    return (
      <div aria-busy="true" aria-label="Cargando seguimiento">
        <CardSkeleton lines={3} elevated />
        <InlineSkeleton />
        <CardSkeleton lines={4} elevated />
      </div>
    );
  }

  if (error) {
    return (
      <>
        <p className="auth-error">{error}</p>
        <Button type="button" variant="ghost" onClick={refetch}>
          Reintentar
        </Button>
      </>
    );
  }

  if (!rutina) {
    return (
      <section className="seguimiento-empty">
        <h2>Sin rutina asignada</h2>
        <p>
          {alumnaNombre} todavía no tiene un plan activo. Asignale una rutina desde
          su perfil para empezar a seguir su progreso.
        </p>
        <Link href={profeAlumnaDetailTabRoute(alumnaId, "rutina")} className="btn btn--primary">
          Ir a rutina
        </Link>
      </section>
    );
  }

  return (
    <div className="seguimiento-content">
      <SeguimientoHero stats={stats} />
      <SeguimientoDayTimeline dayViews={dayViews} pesosBySlot={pesosBySlot} />
    </div>
  );
}

function AlumnaSeguimientoView({
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
    return <SeguimientoContent alumnaId={id} alumnaNombre={alumnaNombre} />;
  };

  if (isMobile) {
    return (
      <div className="alumna-seguimiento-mobile">
        <div className="alumna-detail-hero-fixed seguimiento-hero-fixed" aria-hidden>
          <div className="seguimiento-hero-fixed__glow" />
        </div>
        <SeguimientoNav alumnaId={id} alumnaNombre={alumna?.nombre} />
        <div className="alumna-detail-hero-spacer" aria-hidden />
        <div className="alumna-seguimiento-body">
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="alumna-seguimiento-desktop">
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

export function AlumnaSeguimientoPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : undefined;
  const { alumna, loading: alumnaLoading, error: alumnaError } = useAlumna(id);

  if (!id) {
    return <p className="auth-error">Alumna no encontrada</p>;
  }

  const alumnaNombre = alumna?.nombre ?? "Alumna";

  return (
    <div className="alumna-seguimiento-view page">
      <AlumnaSeguimientoView
        id={id}
        alumna={alumna}
        alumnaLoading={alumnaLoading}
        alumnaError={alumnaError}
        alumnaNombre={alumnaNombre}
      />
    </div>
  );
}