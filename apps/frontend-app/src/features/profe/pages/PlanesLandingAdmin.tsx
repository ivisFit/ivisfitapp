"use client";

import { useMemo } from "react";
import "@/styles/preview-cms.css";
import { CardSkeleton, PageHeaderSkeleton, SkeletonStack } from "@/components/skeletons/AppSkeleton";
import CmsEditor from "@/lib/preview-cms/components/CmsEditor";
import { buildPreviewRoutesFromSlugs } from "@/config/cms.config.shared";
import { useLandingPlanesGestion } from "@/features/profe/hooks/useLandingPlanesGestion";
import { buildPreviewPlansForEditor } from "@/features/landing/lib/landing-plans-api";

export function PlanesLandingAdmin({ embedded = false }: { embedded?: boolean }) {
  const { planes, loading } = useLandingPlanesGestion();
  const previewRoutes = useMemo(
    () => buildPreviewRoutesFromSlugs(planes),
    [planes],
  );
  const previewPlans = useMemo(
    () => buildPreviewPlansForEditor(planes),
    [planes],
  );

  const editorKey = useMemo(
    () => planes.map((plan) => `${plan.id}:${plan.slug}:${plan.route}`).join("|"),
    [planes],
  );

  return (
    <div className="planes-landing-admin">
      {!embedded ? (
        <header className="planes-landing-admin__header">
          <div>
            <h1>Planes web</h1>
            <p>
              Editá el contenido de los planes en la vista previa. Hacé clic en cualquier texto para editarlo.
            </p>
          </div>
        </header>
      ) : null}

      <section className="planes-landing-admin__editor">
        {loading ? (
          <SkeletonStack aria-busy={true} aria-label="Cargando planes">
            <PageHeaderSkeleton titleWidth="w-60" subtitle={false} />
            <div className="sk-grid sk-grid--auto">
              <CardSkeleton lines={4} elevated />
              <CardSkeleton lines={4} elevated />
              <CardSkeleton lines={4} elevated />
            </div>
          </SkeletonStack>
        ) : (
          <CmsEditor previewRoutes={previewRoutes} plans={previewPlans} reloadKey={editorKey} />
        )}
      </section>
    </div>
  );
}
