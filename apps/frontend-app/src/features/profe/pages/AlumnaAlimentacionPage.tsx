"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { SkeletonLine } from "@/components/skeletons/AppSkeleton";
import { AlumnaAlimentacionWorkspace } from "@/features/profe/components/AlumnaAlimentacionWorkspace";
import { useAlumna } from "@/features/profe/hooks/useAlumna";
import type { AlumnaDetail } from "@/types/usuario";
import {
  profeAlumnaDetailRoute,
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

function AlimentacionNav({
  alumnaId,
  alumnaNombre,
}: {
  alumnaId: string;
  alumnaNombre?: string;
}) {
  return (
    <nav className="alumna-detail-hero__nav" aria-label="Navegación de alimentación">
      <Link
        href={profeAlumnaDetailRoute(alumnaId)}
        className="alumna-detail-hero__back"
        aria-label="Volver al perfil de la alumna"
      >
        <BackIcon />
      </Link>
      <span className="alumna-detail-hero__title">
        {alumnaNombre ? `Alimentación · ${alumnaNombre}` : "Alimentación"}
      </span>
      <span className="alumna-detail-hero__nav-spacer" aria-hidden />
    </nav>
  );
}

function AlimentacionContent({
  alumnaId,
  alumnaNombre,
  alumnaEmail,
}: {
  alumnaId: string;
  alumnaNombre: string;
  alumnaEmail?: string;
}) {
  return (
    <AlumnaAlimentacionWorkspace
      alumnaId={alumnaId}
      alumnaNombre={alumnaNombre}
      alumnaEmail={alumnaEmail}
    />
  );
}

function AlumnaAlimentacionView({
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
      <AlimentacionContent
        alumnaId={id}
        alumnaNombre={alumnaNombre}
        alumnaEmail={alumna?.email}
      />
    );
  };

  if (isMobile) {
    return (
      <div className="alumna-alimentacion-mobile">
        <div className="alumna-detail-hero-fixed alimentacion-hero-fixed" aria-hidden>
          <div className="alimentacion-hero-fixed__glow" />
        </div>
        <AlimentacionNav alumnaId={id} alumnaNombre={alumna?.nombre} />
        <div className="alumna-detail-hero-spacer" aria-hidden />
        <div className="alumna-alimentacion-body">
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="alumna-alimentacion-desktop">
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

export function AlumnaAlimentacionPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : undefined;
  const { alumna, loading: alumnaLoading, error: alumnaError } = useAlumna(id);

  if (!id) {
    return <p className="auth-error">Alumna no encontrada</p>;
  }

  const alumnaNombre = alumna?.nombre ?? "Alumna";

  return (
    <div className="alumna-alimentacion-view page">
      <AlumnaAlimentacionView
        id={id}
        alumna={alumna}
        alumnaLoading={alumnaLoading}
        alumnaError={alumnaError}
        alumnaNombre={alumnaNombre}
      />
    </div>
  );
}