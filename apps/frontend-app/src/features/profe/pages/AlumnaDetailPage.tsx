"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/Button";
import { FormSkeleton, PageHeaderSkeleton, SkeletonCard, SkeletonStack } from "@/components/skeletons/AppSkeleton";
import {
  normalizeAlumnaRouteId,
  useAlumna,
} from "@/features/profe/hooks/useAlumna";
import { usePlanTemplates } from "@/features/profe/hooks/usePlanTemplates";
import { profeRoutes } from "@/routes/paths";
import { AlumnaDetailHeroMobile } from "@/features/profe/components/AlumnaDetailHero";
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
      <SkeletonStack aria-busy={true} aria-label="Cargando alumna">
        <PageHeaderSkeleton titleWidth="w-48" subtitleWidth="w-40" />
        <SkeletonCard elevated>
          <FormSkeleton fields={4} />
        </SkeletonCard>
        <SkeletonCard elevated>
          <FormSkeleton fields={3} />
        </SkeletonCard>
      </SkeletonStack>
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
          <SkeletonStack aria-busy={true} aria-label="Cargando secciones">
            <PageHeaderSkeleton titleWidth="w-40" subtitle={false} />
            <SkeletonCard elevated>
              <FormSkeleton fields={3} />
            </SkeletonCard>
          </SkeletonStack>
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
      <div className="page alumna-detail-desktop alumna-detail-view sk-stack" aria-busy="true" aria-label="Cargando alumna">
        <PageHeaderSkeleton titleWidth="w-48" subtitle={false} />
        <SkeletonCard elevated>
          <FormSkeleton fields={4} />
        </SkeletonCard>
        <SkeletonCard elevated>
          <FormSkeleton fields={3} />
        </SkeletonCard>
      </div>
    );
  }

  return (
    <div className="page alumna-detail-desktop alumna-detail-view">
      <p className="page__back">
        <Link href={profeRoutes.alumnas}>← Volver a alumnas</Link>
      </p>
      <Suspense
        fallback={
          <SkeletonStack aria-busy={true} aria-label="Cargando secciones">
            <PageHeaderSkeleton titleWidth="w-48" subtitleWidth="w-40" />
            <SkeletonCard elevated>
              <FormSkeleton fields={3} />
            </SkeletonCard>
          </SkeletonStack>
        }
      >
        <>
          <h1 className="sr-only">{alumna.nombre}</h1>
          <AlumnaDetailTabbedContent
            alumna={alumna}
            planTemplates={planTemplates}
            onAlumnaUpdated={onAlumnaUpdated}
          />
        </>
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