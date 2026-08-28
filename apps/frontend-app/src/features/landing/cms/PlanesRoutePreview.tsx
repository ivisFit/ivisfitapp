"use client";

import { useEdit } from "@/lib/preview-cms/lib/content-edit/EditProvider";
import { useLandingContent } from "@/features/landing/cms/LandingContentProvider";
import { LandingHomePage } from "@/features/landing/pages/LandingHomePage";
import { PlanDetailPage } from "@/features/landing/components/PlanDetailPage";

export default function PlanesRoutePreview() {
  const { previewRoute } = useEdit();
  const { plans } = useLandingContent();

  if (previewRoute === "/") {
    return <LandingHomePage plans={plans} />;
  }

  const plan = plans.find(
    (item) => item.route === previewRoute || `/${item.id}` === previewRoute,
  );

  if (plan) {
    return <PlanDetailPage plan={plan} slug={plan.id} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8 text-center text-sm text-neutral-600">
      No hay un plan publicado para la ruta {previewRoute}.
    </div>
  );
}
