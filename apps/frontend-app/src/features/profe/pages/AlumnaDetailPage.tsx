"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/Button";
import { FormSkeleton, SkeletonLine } from "@/components/skeletons/AppSkeleton";
import {
  normalizeAlumnaRouteId,
  useAlumna,
} from "@/features/profe/hooks/useAlumna";
import { usePlanTemplates } from "@/features/profe/hooks/usePlanTemplates";
import {
  profeRoutes,
} from "@/routes/paths";
import {
  AlumnaDetailHeroMobile,
  AlumnaDetailHeroDesktop,
} from "@/features/profe/components/AlumnaDetailHero";
import { AlumnaDetailTabbedContent } from "@/features/profe/components/AlumnaDetailTabbedContent";
import { AlumnaUnsavedChangesProvider } from "@/features/profe/context/AlumnaUnsavedChangesProvider";
import { useMediaQuery, isMobileQuery } from "@/hooks/useMediaQuery";

function formatEstadoAdmision(
  estado: import("@/types/usuario").AlumnaDetail["estadoAdmision"],
) {
  const labels = {
    pendiente: "Pendiente",
    admitida: "Admitida",
    rechazada: "Rechazada",
  } as const;
  return labels[estado];
}

function AlumnaDetailBodyContent({
  alumna,
  loading,
  error,
  onRetry,
  planTemplates,
  onAlumnaUpdated,
}: {
  alumna: import("@/types/usuario").AlumnaDetail | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  planTemplates: import("@/features/profe/hooks/usePlanTemplates").PlanTemplate[];
  onAlumnaUpdated: () => void;
}) {
  if (error) {
    return (
      <>
        <p className="auth-error">{error}</p>
        <Button type="button" variant="ghost" onClick={onRetry}>
          Reintentar
        </Button>
      </>
    );
  }

  if (loading || !alumna) {
    return (
      <div aria-busy="true" aria-label="Cargando alumna">
        <SkeletonLine size="2xl" width="w-48" gold />
        <SkeletonLine size="sm" width="w-40" />
        <div className="sk sk--card-elevated">
          <FormSkeleton fields={4} />
        </div>
        <div className="sk sk--card-elevated">
          <FormSkeleton fields={3} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="alumna-detail-body__name-row">
        <div>
          <h1 className="alumna-detail-body__name">{alumna.nombre}</h1>
          <p className="alumna-detail-body__subtitle">{alumna.email}</p>
          <div className="alumna-detail-body__meta">
            <span
              className={`alumna-detail-badge alumna-detail-badge--${alumna.estadoAdmision}`}
            >
              {formatEstadoAdmision(alumna.estadoAdmision)}
            </span>
          </div>
        </div>
      </div>
      <Suspense
        fallback={
          <div aria-busy="true" aria-label="Cargando secciones">
            <SkeletonLine size="lg" width="w-40" gold />
            <div className="sk sk--card-elevated">
              <FormSkeleton fields={3} />
            </div>
          </div>
        }
      >
        <AlumnaDetailTabbedContent
          alumna={alumna}
          planTemplates={planTemplates}
          onAlumnaUpdated={onAlumnaUpdated}
        />
      </Suspense>
    </>
  );
}

function AlumnaDetailMobile({
  alumna,
  loading,
  error,
  onRetry,
  planTemplates,
  onAlumnaUpdated,
}: {
  alumna: import("@/types/usuario").AlumnaDetail | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  planTemplates: import("@/features/profe/hooks/usePlanTemplates").PlanTemplate[];
  onAlumnaUpdated: () => void;
}) {
  return (
    <div className="alumna-detail-mobile">
      <AlumnaDetailHeroMobile alumna={alumna} loading={loading} />
      <div className="alumna-detail-body">
        <AlumnaDetailBodyContent
          alumna={alumna}
          loading={loading}
          error={error}
          onRetry={onRetry}
          planTemplates={planTemplates}
          onAlumnaUpdated={onAlumnaUpdated}
        />
      </div>
    </div>
  );
}

function AlumnaDetailDesktop({
  alumna,
  loading,
  error,
  onRetry,
  planTemplates,
  onAlumnaUpdated,
}: {
  alumna: import("@/types/usuario").AlumnaDetail | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  planTemplates: import("@/features/profe/hooks/usePlanTemplates").PlanTemplate[];
  onAlumnaUpdated: () => void;
}) {
  if (error) {
    return (
      <div className="page alumna-detail-desktop alumna-detail-view">
        <p className="page__back">
          <Link href={profeRoutes.alumnas}>← Volver a alumnas</Link>
        </p>
        <p className="auth-error">{error}</p>
        <Button type="button" variant="ghost" onClick={onRetry}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (loading || !alumna) {
    return (
      <div className="page alumna-detail-desktop alumna-detail-view" aria-busy="true" aria-label="Cargando alumna">
        <SkeletonLine size="2xl" width="w-48" gold />
        <div className="sk sk--card-elevated">
          <FormSkeleton fields={4} />
        </div>
        <div className="sk sk--card-elevated">
          <FormSkeleton fields={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="page alumna-detail-desktop alumna-detail-view">
      <p className="page__back">
        <Link href={profeRoutes.alumnas}>← Volver a alumnas</Link>
      </p>
      <AlumnaDetailHeroDesktop alumna={alumna} />
      <Suspense
        fallback={
          <div aria-busy="true" aria-label="Cargando secciones">
            <SkeletonLine size="lg" width="w-40" gold />
            <div className="sk sk--card-elevated">
              <FormSkeleton fields={3} />
            </div>
          </div>
        }
      >
        <AlumnaDetailTabbedContent
          alumna={alumna}
          planTemplates={planTemplates}
          onAlumnaUpdated={onAlumnaUpdated}
        />
      </Suspense>
    </div>
  );
}

function AlumnaDetailView({
  alumna,
  loading,
  error,
  onRetry,
  planTemplates,
  onAlumnaUpdated,
}: {
  alumna: import("@/types/usuario").AlumnaDetail | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  planTemplates: import("@/features/profe/hooks/usePlanTemplates").PlanTemplate[];
  onAlumnaUpdated: () => void;
}) {
  const isMobile = useMediaQuery(isMobileQuery);

  if (isMobile) {
    return (
      <AlumnaDetailMobile
        alumna={alumna}
        loading={loading}
        error={error}
        onRetry={onRetry}
        planTemplates={planTemplates}
        onAlumnaUpdated={onAlumnaUpdated}
      />
    );
  }

  return (
    <AlumnaDetailDesktop
      alumna={alumna}
      loading={loading}
      error={error}
      onRetry={onRetry}
      planTemplates={planTemplates}
      onAlumnaUpdated={onAlumnaUpdated}
    />
  );
}

export function AlumnaDetailPage({ alumnaId: alumnaIdProp }: { alumnaId?: string }) {
  const params = useParams();
  const id =
    alumnaIdProp ??
    normalizeAlumnaRouteId(params.id as string | string[] | undefined);
  const { alumna, loading, error, refetch } = useAlumna(id);
  const { planTemplates } = usePlanTemplates();

  if (!id) {
    return (
      <AlumnaDetailView
        alumna={null}
        loading={true}
        error={null}
        onRetry={() => {}}
        planTemplates={[]}
        onAlumnaUpdated={() => {}}
      />
    );
  }

  return (
    <AlumnaUnsavedChangesProvider alumnaId={id}>
      <AlumnaDetailView
        alumna={alumna}
        loading={loading}
        error={error}
        onRetry={refetch}
        planTemplates={planTemplates}
        onAlumnaUpdated={refetch}
      />
    </AlumnaUnsavedChangesProvider>
  );
}