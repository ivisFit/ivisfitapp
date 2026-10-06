"use client";

import { Button } from "@/components";
import { useAppDialog } from "@/components/AppDialogProvider";
import { useAlimentacionPlan } from "@/features/profe/context/AlimentacionPlanProvider";
import { planDocId } from "@/features/profe/context/AlimentacionPlanProvider";
import { apiFetch, formatApiError } from "@/lib/api";
import { useState } from "react";

export function AlimentacionBorradorBanner() {
  const {
    planBorrador,
    planPublicado,
    reloadFromServer,
    refetch,
    saving,
  } = useAlimentacionPlan();
  const dialog = useAppDialog();
  const [discarding, setDiscarding] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!planBorrador) return null;

  const showPublishedHint = Boolean(planPublicado);

  async function handleDiscard() {
    const draftId = planDocId(planBorrador);
    if (!draftId) return;

    const confirmed = await dialog.confirm({
      title: "Eliminar borrador",
      message: planPublicado
        ? "¿Eliminar este borrador? La alumna sigue viendo el plan publicado."
        : "¿Eliminar este borrador? Esta acción no se puede deshacer.",
      tone: "danger",
      confirmLabel: "Eliminar",
    });
    if (!confirmed) return;

    setDiscarding(true);
    setActionError(null);
    try {
      await apiFetch(`/api/plan-nutricional/${draftId}`, { method: "DELETE" });
      await refetch();
    } catch (err) {
      setActionError(formatApiError(err));
    } finally {
      setDiscarding(false);
    }
  }

  return (
    <div className="plan-nutricional-builder__version-banner" role="status">
      <p>
        {showPublishedHint
          ? "Tenés un borrador en curso. La alumna sigue viendo el plan publicado hasta que republicás."
          : `Borrador activo: ${planBorrador.titulo}. Los cambios se guardan en el borrador.`}
      </p>
      <div className="plan-nutricional-builder__version-banner-actions">
        <Button
          type="button"
          variant="ghost"
          disabled={saving || discarding}
          onClick={() => void reloadFromServer()}
        >
          Recargar borrador
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={saving || discarding}
          onClick={() => void handleDiscard()}
        >
          {discarding ? "Descartando…" : "Descartar borrador"}
        </Button>
      </div>
      {actionError ? (
        <p className="auth-error" role="alert">
          {actionError}
        </p>
      ) : null}
    </div>
  );
}
