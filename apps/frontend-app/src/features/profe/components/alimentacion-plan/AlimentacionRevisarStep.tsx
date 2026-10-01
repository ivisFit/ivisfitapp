"use client";

import { useEffect, useState } from "react";
import {
  CircleCheck,
  ClipboardCheck,
  Eye,
  ListChecks,
  LoaderCircle,
  OctagonAlert,
  Send,
  TriangleAlert,
} from "lucide-react";
import { Button, Input } from "@/components";
import {
  AlimentacionStepFooter,
  AlimentacionStepHeader,
} from "@/features/profe/components/alimentacion-plan/AlimentacionStepChrome";
import { useAlimentacionPlan } from "@/features/profe/context/AlimentacionPlanProvider";
import { PlanNutricionalDashboard } from "@/features/alumna/components/alimentacion/PlanNutricionalDashboard";
import { profeAlumnaAlimentacionStepRoute, profeAlumnaAlimentacionTabRoute } from "@/routes/paths";
import { ApiError, apiFetch, formatValidationErrorMessage } from "@/lib/api";
import type {
  PlanNutricionalApiDoc,
  PlanValidacionResponse,
} from "@/features/alumna/types/plan-nutricional";
import { prepareDiasForPlanApi } from "@/features/profe/lib/plan-macros";
import { useAlimentacionStepSave } from "@/features/profe/hooks/useAlimentacionStepSave";
import { useRouter } from "next/navigation";

export function AlimentacionRevisarStep() {
  const router = useRouter();
  const { handleStepLinkClick } = useAlimentacionStepSave();
  const {
    alumnaId,
    plan,
    titulo,
    setTitulo,
    observacionesProfe,
    setObservacionesProfe,
    macrosObjetivo,
    estructuraComidas,
    dias,
    saveDraft,
    refetch,
    isPublicado,
  } = useAlimentacionPlan();

  const [validacion, setValidacion] = useState<PlanValidacionResponse | null>(null);
  const [loadingVal, setLoadingVal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedWarnings, setAcceptedWarnings] = useState(false);
  const [validationFetchError, setValidationFetchError] = useState<string | null>(null);

  const previewPlan: PlanNutricionalApiDoc = {
    _id: plan?._id,
    alumnaId,
    titulo,
    estado: plan?.estado ?? "borrador",
    observacionesProfe,
    macrosObjetivo,
    estructuraComidas,
    dias: prepareDiasForPlanApi(dias),
  };

  useEffect(() => {
    setLoadingVal(true);
    setValidationFetchError(null);
    void apiFetch<PlanValidacionResponse>("/api/plan-nutricional/validar", {
      method: "POST",
      body: JSON.stringify({
        alumnaId,
        plan: {
          titulo,
          observacionesProfe,
          macrosObjetivo,
          estructuraComidas,
          dias: prepareDiasForPlanApi(dias),
        },
      }),
    })
      .then((result) => {
        setValidacion(result);
        setValidationFetchError(null);
      })
      .catch((err) => {
        setValidacion(null);
        const message =
          err instanceof ApiError
            ? formatValidationErrorMessage(err.message, err.details) ?? err.message
            : err instanceof Error
              ? err.message
              : "No se pudo validar el plan";
        setValidationFetchError(message);
      })
      .finally(() => setLoadingVal(false));
  }, [alumnaId, titulo, observacionesProfe, macrosObjetivo, estructuraComidas, dias]);

  const warnings =
    validacion?.items.filter((item) => item.nivel === "warning") ?? [];
  const errors =
    validacion?.items.filter((item) => item.nivel === "error") ?? [];
  const canPublish =
    Boolean(validacion?.puedePublicar) &&
    !validationFetchError &&
    (warnings.length === 0 || acceptedWarnings);

  const blockingHint =
    validationFetchError
      ? "No se pudo validar el plan. Revisá los datos o guardá el borrador de nuevo."
      : errors.length > 0
        ? isPublicado
          ? "Corregí los errores antes de guardar."
          : "Corregí los errores para poder publicar."
        : warnings.length > 0 && !acceptedWarnings
          ? isPublicado
            ? "Aceptá las advertencias para poder guardar."
            : "Aceptá las advertencias para poder publicar."
          : null;
  const publishHint = blockingHint ?? (isPublicado ? "La alumna ve el plan actualizado al guardar." : null);

  async function handlePublish() {
    setPublishing(true);
    setError(null);
    try {
      const saved = await saveDraft();
      if (isPublicado) {
        if (!saved) {
          setError("No se pudo guardar el plan");
          return;
        }
        router.push(profeAlumnaAlimentacionTabRoute(alumnaId));
        return;
      }

      let idToPublish = saved?._id ?? saved?.id ?? plan?._id ?? plan?.id;
      if (!idToPublish) {
        const created = await apiFetch<PlanNutricionalApiDoc>("/api/plan-nutricional", {
          method: "POST",
          body: JSON.stringify({
            alumnaId,
            titulo,
            observacionesProfe,
            macrosObjetivo,
            estructuraComidas,
            dias: prepareDiasForPlanApi(dias),
          }),
        });
        idToPublish = created._id ?? created.id;
      }
      if (!idToPublish) throw new Error("No se pudo identificar el plan");
      await apiFetch(`/api/plan-nutricional/${idToPublish}/publicar`, {
        method: "POST",
      });
      refetch();
      router.push(profeAlumnaAlimentacionTabRoute(alumnaId));
    } catch (err) {
      setError(err instanceof Error ? err.message : isPublicado ? "No se pudo guardar" : "No se pudo publicar");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="alimentacion-plan-step">
      <section className="ap-card">
        <AlimentacionStepHeader
          icon={<ClipboardCheck size={20} />}
          title="Revisar y publicar"
          description="Poné título, dejale un mensaje a la alumna y confirmá que todo esté en orden."
        />
        <div className="ap-form-grid">
          <Input
            label="Título del plan"
            name="plan-titulo-revisar"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <label
            className="plan-nutricional-builder__field ap-form-grid__wide"
            htmlFor="plan-obs-revisar"
          >
            <span>Mensaje para la alumna</span>
            <textarea
              id="plan-obs-revisar"
              className="plan-nutricional-builder__textarea"
              value={observacionesProfe}
              onChange={(e) => setObservacionesProfe(e.target.value)}
              rows={3}
              placeholder="Ej: Priorizá hidratarte y respetá los horarios de las comidas."
            />
          </label>
        </div>
      </section>

      <section className="ap-card" aria-busy={loadingVal}>
        <AlimentacionStepHeader
          icon={<ListChecks size={20} />}
          title="Checklist de publicación"
          description="Validamos alergias, comidas vacías y macros antes de publicar."
          aside={
            loadingVal ? (
              <span className="ap-badge ap-badge--muted">
                <LoaderCircle size={13} className="ap-spin" aria-hidden="true" />
                Validando…
              </span>
            ) : errors.length > 0 ? (
              <span className="ap-badge ap-badge--danger">
                {errors.length} {errors.length === 1 ? "error" : "errores"}
              </span>
            ) : warnings.length > 0 ? (
              <span className="ap-badge ap-badge--gold">
                {warnings.length}{" "}
                {warnings.length === 1 ? "advertencia" : "advertencias"}
              </span>
            ) : (
              <span className="ap-badge ap-badge--success">Todo en orden</span>
            )
          }
        />
        {validacion?.items.length ? (
          <ul className="alimentacion-revisar-checklist">
            {validacion.items.map((item) => (
              <li
                key={item.id}
                className={`alimentacion-revisar-checklist__item alimentacion-revisar-checklist__item--${item.nivel}`}
              >
                <span className="alimentacion-revisar-checklist__icon" aria-hidden="true">
                  {item.nivel === "error" ? (
                    <OctagonAlert size={18} />
                  ) : item.nivel === "warning" ? (
                    <TriangleAlert size={18} />
                  ) : (
                    <CircleCheck size={18} />
                  )}
                </span>
                <span>{item.mensaje}</span>
              </li>
            ))}
          </ul>
        ) : validationFetchError ? (
          <p className="auth-error" role="alert">
            {validationFetchError}
          </p>
        ) : validacion ? (
          <p className="ap-inline-note ap-inline-note--success">
            <CircleCheck size={16} aria-hidden="true" />
            Sin observaciones. El plan está listo para publicar.
          </p>
        ) : null}
        {warnings.length > 0 && errors.length === 0 ? (
          <label className="alimentacion-revisar-checklist__accept">
            <input
              type="checkbox"
              checked={acceptedWarnings}
              onChange={(e) => setAcceptedWarnings(e.target.checked)}
            />
            <span>Acepto publicar con las advertencias listadas</span>
          </label>
        ) : null}
      </section>

      <section className="ap-card alimentacion-revisar-preview">
        <AlimentacionStepHeader
          icon={<Eye size={20} />}
          title="Vista previa"
          description="Así va a ver el plan la alumna."
        />
        <div className="alimentacion-revisar-preview__frame">
          <PlanNutricionalDashboard plan={previewPlan} preview />
        </div>
      </section>

      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}

      <AlimentacionStepFooter
        backHref={profeAlumnaAlimentacionStepRoute(alumnaId, "comidas")}
        onBackClick={handleStepLinkClick(
          profeAlumnaAlimentacionStepRoute(alumnaId, "comidas"),
        )}
        hint={publishHint}
      >
        <Button
          type="button"
          className="ap-footer__cta"
          disabled={!canPublish || publishing}
          onClick={() => void handlePublish()}
        >
          {publishing ? (
            <LoaderCircle size={16} className="ap-spin" aria-hidden="true" />
          ) : (
            <Send size={16} aria-hidden="true" />
          )}
          {publishing
            ? isPublicado
              ? "Guardando…"
              : "Publicando…"
            : isPublicado
              ? "Guardar cambios"
              : "Publicar plan"}
        </Button>
      </AlimentacionStepFooter>
    </div>
  );
}
