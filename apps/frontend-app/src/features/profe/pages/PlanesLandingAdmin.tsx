"use client";

import { useMemo } from "react";
import "@/styles/preview-cms.css";
import { CardSkeleton, SkeletonLine } from "@/components/skeletons/AppSkeleton";
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
          <div aria-busy="true" aria-label="Cargando planes">
            <SkeletonLine size="lg" width="w-60" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(16rem, 1fr))",
                gap: "1rem",
              }}
            >
              <CardSkeleton lines={4} />
              <CardSkeleton lines={4} />
              <CardSkeleton lines={4} />
            </div>
          </div>
        ) : (
          <CmsEditor previewRoutes={previewRoutes} plans={previewPlans} reloadKey={editorKey} />
        )}
      </section>
    </div>
  );
}
