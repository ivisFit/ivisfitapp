"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { Button, Input, InfoTooltip } from "@/components";
import { CardSkeleton } from "@/components/skeletons/AppSkeleton";
import { apiFetch } from "@/lib/api";
import type {
  ComidaPlan,
  DiaPlanNutricional,
  IngredientePlan,
  MacrosObjetivo,
  PlanNutricionalApiDoc,
  PlanNutricionalEstado,
  UpdatePlanNutricionalPayload,
} from "@/features/alumna/types/plan-nutricional";
import { calcularMacrosPorCantidad, type Alimento } from "@/features/profe/types/alimento";
import { MacrosProgressBar } from "./MacrosProgressBar";
import { NutricionChatPanel } from "./NutricionChatPanel";
import { PlanNutricionalComidaCard } from "./PlanNutricionalComidaCard";

function createEmptyIngrediente(): IngredientePlan {
  return { nombre: "", cantidad: 100, unidad: "g" };
}

type GenerateDraftStatusResponse = {
  status: "processing" | "done" | "error";
  plan?: PlanNutricionalApiDoc;
  error?: string;
};

const DRAFT_POLL_INTERVAL_MS = 2_500;
const DRAFT_POLL_MAX_MS = 4 * 60 * 1000;
const DEFAULT_MACROS: MacrosObjetivo = {
  kcal: 1800,
  proteinaG: 120,
  carbohidratosG: 180,
  grasasG: 60,
};

const ESTADO_LABEL: Record<PlanNutricionalEstado | "none", string> = {
  none: "Sin plan",
  borrador: "Borrador",
  publicado: "Publicado",
  archivado: "Archivado",
};

async function pollDraftResult(jobId: string): Promise<PlanNutricionalApiDoc> {
  const startedAt = Date.now();

  for (;;) {
    if (Date.now() - startedAt > DRAFT_POLL_MAX_MS) {
      throw new Error("La generación tardó demasiado. Intentá de nuevo.");
    }

    await new Promise((resolve) => setTimeout(resolve, DRAFT_POLL_INTERVAL_MS));

    const status = await apiFetch<GenerateDraftStatusResponse>(
      `/api/plan-nutricional/generar-borrador/estado/${jobId}`,
    );

    if (status.status === "done" && status.plan) return status.plan;
    if (status.status === "error") {
      throw new Error(status.error ?? "No se pudo generar el borrador");
    }
  }
}

function createEmptyComida(nombre = "Comida"): ComidaPlan {
  return {
    nombre,
    horario: "",
    ingredientes: [createEmptyIngrediente()],
    notas: "",
    preparacion: "",
  };
}

function createEmptyDia(nombre = "Día tipo"): DiaPlanNutricional {
  return {
    nombre,
    comidas: [createEmptyComida("Desayuno"), createEmptyComida("Almuerzo")],
  };
}

function cloneDia(dia: DiaPlanNutricional, nombre: string): DiaPlanNutricional {
  return {
    nombre,
    comidas: dia.comidas.map((comida) => ({
      ...comida,
      ingredientes: comida.ingredientes.map((ingrediente) => ({ ...ingrediente })),
    })),
  };
}

function sumDiaMacros(dia: DiaPlanNutricional): MacrosObjetivo {
  return dia.comidas.reduce(
    (total, comida) => {
      const comidaTotal = comida.ingredientes.reduce(
        (acc, ingrediente) => ({
          kcal: acc.kcal + (ingrediente.kcal ?? 0),
          proteinaG: acc.proteinaG + (ingrediente.proteinaG ?? 0),
          carbohidratosG: acc.carbohidratosG + (ingrediente.carbohidratosG ?? 0),
          grasasG: acc.grasasG + (ingrediente.grasasG ?? 0),
        }),
        { kcal: 0, proteinaG: 0, carbohidratosG: 0, grasasG: 0 },
      );

      return {
        kcal: total.kcal + comidaTotal.kcal,
        proteinaG: Math.round((total.proteinaG + comidaTotal.proteinaG) * 10) / 10,
        carbohidratosG:
          Math.round((total.carbohidratosG + comidaTotal.carbohidratosG) * 10) / 10,
        grasasG: Math.round((total.grasasG + comidaTotal.grasasG) * 10) / 10,
      };
    },
    { kcal: 0, proteinaG: 0, carbohidratosG: 0, grasasG: 0 },
  );
}

function applyPlanToDraft(plan: PlanNutricionalApiDoc) {
  return {
    titulo: plan.titulo,
    observacionesProfe: plan.observacionesProfe ?? "",
    macrosObjetivo: plan.macrosObjetivo,
    dias: plan.dias?.length ? plan.dias : [createEmptyDia()],
  };
}

type PlanNutricionalBuilderProps = {
  alumnaId: string;
  alumnaNombre: string;
  plan: PlanNutricionalApiDoc | null;
  loading?: boolean;
  macrosSugeridos?: MacrosObjetivo | null;
  onSaved: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

function serializePlanDraft(input: {
  titulo: string;
  observacionesProfe: string;
  macrosObjetivo: MacrosObjetivo;
  dias: DiaPlanNutricional[];
}) {
  return JSON.stringify({
    titulo: input.titulo,
    observacionesProfe: input.observacionesProfe,
    macrosObjetivo: input.macrosObjetivo,
    dias: input.dias,
  });
}

function closeMenu(event: MouseEvent<HTMLButtonElement>) {
  event.currentTarget.closest("details")?.removeAttribute("open");
}

export function PlanNutricionalBuilder({
  alumnaId,
  alumnaNombre,
  plan,
  loading = false,
  macrosSugeridos,
  onSaved,
  onDirtyChange,
}: PlanNutricionalBuilderProps) {
  const [titulo, setTitulo] = useState("Plan nutricional");
  const [observacionesProfe, setObservacionesProfe] = useState("");
  const [macrosObjetivo, setMacrosObjetivo] = useState<MacrosObjetivo>(DEFAULT_MACROS);
  const [dias, setDias] = useState<DiaPlanNutricional[]>([createEmptyDia()]);
  const [selectedDiaIndex, setSelectedDiaIndex] = useState(0);
  const [manualStarted, setManualStarted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);

  const isPublicado = plan?.estado === "publicado";
  const isBusy = saving || generating || publishing || archiving || deleting;
  const planId = plan?._id ?? plan?.id;
  const planKey = `${planId ?? "none"}:${plan?.estado ?? "none"}:${plan?.updatedAt ?? ""}`;
  const estadoKey = plan?.estado ?? "none";
  const showEditor = Boolean(plan) || manualStarted;
  const selectedDia = dias[selectedDiaIndex] ?? dias[0] ?? null;
  const selectedDiaMacros = selectedDia ? sumDiaMacros(selectedDia) : null;
  const currentSnapshot = useMemo(
    () => serializePlanDraft({ titulo, observacionesProfe, macrosObjetivo, dias }),
    [titulo, observacionesProfe, macrosObjetivo, dias],
  );
  const hasUnsavedChanges = savedSnapshot !== null && currentSnapshot !== savedSnapshot;

  useEffect(() => {
    if (!plan) {
      setTitulo("Plan nutricional");
      setObservacionesProfe("");
      setMacrosObjetivo(DEFAULT_MACROS);
      setDias([createEmptyDia()]);
      setSelectedDiaIndex(0);
      setManualStarted(false);
      setSavedSnapshot(null);
      onDirtyChange?.(false);
      return;
    }

    const draft = applyPlanToDraft(plan);
    setTitulo(draft.titulo);
    setObservacionesProfe(draft.observacionesProfe);
    setMacrosObjetivo(draft.macrosObjetivo);
    setDias(draft.dias);
    setSelectedDiaIndex((current) =>
      current < draft.dias.length ? current : 0,
    );
    setManualStarted(true);
    setSavedSnapshot(serializePlanDraft(draft));
    // Hydrate only when the persisted plan identity/revision changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planKey]);

  useEffect(() => {
    if (savedSnapshot === null) return;
    onDirtyChange?.(currentSnapshot !== savedSnapshot);
  }, [currentSnapshot, savedSnapshot, onDirtyChange]);

  useEffect(() => {
    if (selectedDiaIndex < dias.length) return;
    setSelectedDiaIndex(Math.max(0, dias.length - 1));
  }, [dias.length, selectedDiaIndex]);

  function markCurrentAsSaved(nextSnapshot = currentSnapshot) {
    setSavedSnapshot(nextSnapshot);
  }

  function applyGeneratedPlan(data: PlanNutricionalApiDoc) {
    const draft = applyPlanToDraft(data);
    setTitulo(draft.titulo);
    setObservacionesProfe(draft.observacionesProfe);
    setMacrosObjetivo(draft.macrosObjetivo);
    setDias(draft.dias);
    setSelectedDiaIndex(0);
    setManualStarted(true);
    markCurrentAsSaved(serializePlanDraft(draft));
  }

  async function handleGenerateDraft() {
    setGenerating(true);
    setError(null);
    setMessage(null);

    try {
      const { jobId } = await apiFetch<{ jobId: string }>(
        "/api/plan-nutricional/generar-borrador",
        {
          method: "POST",
          body: JSON.stringify({
            alumnaId,
            planId,
          }),
        },
      );

      const data = await pollDraftResult(jobId);
      applyGeneratedPlan(data);
      setMessage("Borrador generado. Revisá y editá antes de publicar.");
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} Si tardó demasiado, intentá generar el borrador de nuevo.`
          : "No se pudo generar el borrador",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload: UpdatePlanNutricionalPayload = {
      titulo,
      observacionesProfe,
      macrosObjetivo,
      dias,
    };

    try {
      if (planId) {
        await apiFetch(`/api/plan-nutricional/${planId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/plan-nutricional", {
          method: "POST",
          body: JSON.stringify({
            alumnaId,
            ...payload,
          }),
        });
      }

      setMessage("Plan guardado como borrador.");
      markCurrentAsSaved();
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el plan");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    setError(null);
    setMessage(null);

    try {
      let idToPublish = planId;

      if (!idToPublish) {
        const created = await apiFetch<PlanNutricionalApiDoc>(
          "/api/plan-nutricional",
          {
            method: "POST",
            body: JSON.stringify({
              alumnaId,
              titulo,
              observacionesProfe,
              macrosObjetivo,
              dias,
            }),
          },
        );
        idToPublish = created._id ?? created.id;
      } else {
        await apiFetch(`/api/plan-nutricional/${idToPublish}`, {
          method: "PATCH",
          body: JSON.stringify({
            titulo,
            observacionesProfe,
            macrosObjetivo,
            dias,
          }),
        });
      }

      if (!idToPublish) {
        throw new Error("No se pudo identificar el plan");
      }

      await apiFetch(`/api/plan-nutricional/${idToPublish}/publicar`, {
        method: "POST",
      });

      setMessage("Plan publicado. La alumna ya puede verlo.");
      markCurrentAsSaved();
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo publicar el plan",
      );
    } finally {
      setPublishing(false);
    }
  }

  async function handleArchive() {
    if (!planId) return;
    const confirmed = window.confirm("¿Archivar este plan? Dejará de estar activo.");
    if (!confirmed) return;

    setArchiving(true);
    setError(null);
    setMessage(null);

    try {
      await apiFetch(`/api/plan-nutricional/${planId}/archivar`, { method: "POST" });
      setMessage("Plan archivado.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo archivar el plan");
    } finally {
      setArchiving(false);
    }
  }

  async function handleDelete() {
    if (!planId) return;
    const confirmed = window.confirm("¿Eliminar este borrador? Esta acción no se puede deshacer.");
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    setMessage(null);

    try {
      await apiFetch(`/api/plan-nutricional/${planId}`, { method: "DELETE" });
      setMessage("Borrador eliminado.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el borrador");
    } finally {
      setDeleting(false);
    }
  }

  function handleStartManual() {
    setManualStarted(true);
    setError(null);
    setMessage(null);
    if (macrosSugeridos) setMacrosObjetivo(macrosSugeridos);
    const snapshot = serializePlanDraft({
      titulo,
      observacionesProfe,
      macrosObjetivo: macrosSugeridos ?? macrosObjetivo,
      dias,
    });
    setSavedSnapshot(snapshot);
  }

  function updateDia(diaIndex: number, patch: Partial<DiaPlanNutricional>) {
    setDias((current) =>
      current.map((dia, index) => (index === diaIndex ? { ...dia, ...patch } : dia)),
    );
  }

  function addDia() {
    setDias((current) => [...current, createEmptyDia(`Día ${current.length + 1}`)]);
    setSelectedDiaIndex(dias.length);
  }

  function duplicateDia(diaIndex: number) {
    setDias((current) => {
      const source = current[diaIndex];
      if (!source) return current;
      const next = [...current];
      next.splice(diaIndex + 1, 0, cloneDia(source, `${source.nombre} (copia)`));
      return next;
    });
    setSelectedDiaIndex(diaIndex + 1);
  }

  function removeDia(diaIndex: number) {
    setDias((current) => {
      if (current.length <= 1) return current;
      return current.filter((_, index) => index !== diaIndex);
    });
  }

  function updateComida(
    diaIndex: number,
    comidaIndex: number,
    patch: Partial<ComidaPlan>,
  ) {
    setDias((current) =>
      current.map((dia, dIndex) =>
        dIndex !== diaIndex
          ? dia
          : {
              ...dia,
              comidas: dia.comidas.map((comida, cIndex) =>
                cIndex !== comidaIndex ? comida : { ...comida, ...patch },
              ),
            },
      ),
    );
  }

  function updateIngrediente(
    diaIndex: number,
    comidaIndex: number,
    ingredienteIndex: number,
    patch: Partial<IngredientePlan>,
  ) {
    setDias((current) =>
      current.map((dia, dIndex) => {
        if (dIndex !== diaIndex) return dia;
        return {
          ...dia,
          comidas: dia.comidas.map((comida, cIndex) => {
            if (cIndex !== comidaIndex) return comida;
            return {
              ...comida,
              ingredientes: comida.ingredientes.map((ingrediente, iIndex) =>
                iIndex !== ingredienteIndex
                  ? ingrediente
                  : { ...ingrediente, ...patch },
              ),
            };
          }),
        };
      }),
    );
  }

  function handleSelectAlimento(
    diaIndex: number,
    comidaIndex: number,
    ingredienteIndex: number,
    alimento: Alimento,
  ) {
    const macros = calcularMacrosPorCantidad(alimento, alimento.porcionReferencia.cantidad);
    updateIngrediente(diaIndex, comidaIndex, ingredienteIndex, {
      alimentoId: alimento.id,
      nombre: alimento.nombre,
      cantidad: alimento.porcionReferencia.cantidad,
      unidad: alimento.porcionReferencia.unidad,
      ...macros,
    });
  }

  function handleCantidadChange(
    diaIndex: number,
    comidaIndex: number,
    ingredienteIndex: number,
    ingrediente: IngredientePlan,
    nuevaCantidad: number,
  ) {
    if (ingrediente.alimentoId && ingrediente.cantidad > 0 && ingrediente.kcal !== undefined) {
      const factor = nuevaCantidad / ingrediente.cantidad;
      updateIngrediente(diaIndex, comidaIndex, ingredienteIndex, {
        cantidad: nuevaCantidad,
        kcal: Math.round(ingrediente.kcal * factor),
        proteinaG: Math.round((ingrediente.proteinaG ?? 0) * factor * 10) / 10,
        carbohidratosG: Math.round((ingrediente.carbohidratosG ?? 0) * factor * 10) / 10,
        grasasG: Math.round((ingrediente.grasasG ?? 0) * factor * 10) / 10,
      });
    } else {
      updateIngrediente(diaIndex, comidaIndex, ingredienteIndex, {
        cantidad: nuevaCantidad,
      });
    }
  }

  function addIngrediente(diaIndex: number, comidaIndex: number) {
    setDias((current) =>
      current.map((dia, dIndex) => {
        if (dIndex !== diaIndex) return dia;
        return {
          ...dia,
          comidas: dia.comidas.map((comida, cIndex) =>
            cIndex !== comidaIndex
              ? comida
              : {
                  ...comida,
                  ingredientes: [...comida.ingredientes, createEmptyIngrediente()],
                },
          ),
        };
      }),
    );
  }

  function removeIngrediente(
    diaIndex: number,
    comidaIndex: number,
    ingredienteIndex: number,
  ) {
    setDias((current) =>
      current.map((dia, dIndex) => {
        if (dIndex !== diaIndex) return dia;
        return {
          ...dia,
          comidas: dia.comidas.map((comida, cIndex) => {
            if (cIndex !== comidaIndex || comida.ingredientes.length <= 1) {
              return comida;
            }
            return {
              ...comida,
              ingredientes: comida.ingredientes.filter(
                (_, index) => index !== ingredienteIndex,
              ),
            };
          }),
        };
      }),
    );
  }

  function addComida(diaIndex: number) {
    setDias((current) =>
      current.map((dia, dIndex) =>
        dIndex !== diaIndex
          ? dia
          : {
              ...dia,
              comidas: [...dia.comidas, createEmptyComida(`Comida ${dia.comidas.length + 1}`)],
            },
      ),
    );
  }

  function removeComida(diaIndex: number, comidaIndex: number) {
    setDias((current) =>
      current.map((dia, dIndex) => {
        if (dIndex !== diaIndex || dia.comidas.length <= 1) return dia;
        return {
          ...dia,
          comidas: dia.comidas.filter((_, index) => index !== comidaIndex),
        };
      }),
    );
  }

  if (loading && !showEditor) {
    return (
      <div
        className="plan-nutricional-builder"
        aria-busy="true"
        aria-label="Cargando plan nutricional"
      >
        <CardSkeleton lines={4} />
      </div>
    );
  }

  if (!showEditor) {
    return (
      <div className="plan-nutricional-builder">
        <div className="plan-nutricional-builder__empty">
          <h2>Todavía no hay plan nutricional</h2>
          <p>
            Generá un borrador con IA o armá el plan a mano para{" "}
            {alumnaNombre}.
          </p>
          <div className="plan-nutricional-builder__empty-actions">
            <Button
              type="button"
              onClick={() => void handleGenerateDraft()}
              disabled={isBusy}
            >
              {generating ? "Generando..." : "Generar borrador con IA"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleStartManual}
              disabled={isBusy}
            >
              Armar a mano
            </Button>
          </div>
          {error ? <p className="auth-error">{error}</p> : null}
          {message ? <p className="alumnas-panel__status">{message}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="plan-nutricional-builder">
      <section className="plan-nutricional-builder__toolbar">
        <div className="plan-nutricional-builder__toolbar-heading">
          <span
            className={`plan-nutricional-builder__plan-badge plan-nutricional-builder__plan-badge--${estadoKey}`}
          >
            {ESTADO_LABEL[estadoKey]}
          </span>
          {plan?.generadoPorIa ? (
            <span className="plan-nutricional-builder__plan-meta">Generado con IA</span>
          ) : null}
          <p className="plan-nutricional-builder__toolbar-hint">
            Editá el plan de {alumnaNombre} y usá la barra de abajo para guardar o
            publicar.
          </p>
        </div>

        <div className="plan-nutricional-builder__toolbar-grid">
          <Input
            label="Título"
            name="plan-titulo"
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            disabled={isPublicado}
            tooltip="Nombre del plan que verá la alumna (ej. 'Plan masa muscular')."
          />
          <div className="plan-nutricional-builder__field plan-nutricional-builder__field--observaciones">
            <label className="field" htmlFor="plan-observaciones">
              <span className="field__label-row">
                <span className="field__label">Observaciones para la alumna</span>
                <InfoTooltip text="Mensaje que la alumna verá al abrir su plan: aclaraciones, tips o pautas." />
              </span>
            </label>
            <textarea
              id="plan-observaciones"
              className="plan-nutricional-builder__textarea"
              value={observacionesProfe}
              onChange={(event) => setObservacionesProfe(event.target.value)}
              disabled={isPublicado}
              rows={2}
            />
          </div>
        </div>

        <div className="plan-nutricional-macros">
          {(
            [
              [
                "kcal",
                "Kcal",
                "Energía total diaria del plan. La IA la sugiere según el objetivo de la alumna; podés ajustarla.",
              ],
              [
                "proteinaG",
                "Proteína (g)",
                "Cantidad diaria de proteína: ayuda a conservar y construir músculo.",
              ],
              [
                "carbohidratosG",
                "Carbos (g)",
                "Hidratos diarios: principal fuente de energía para entrenar y recuperarse.",
              ],
              [
                "grasasG",
                "Grasas (g)",
                "Grasas saludables diarias: necesarias para las hormonas y la absorción de vitaminas.",
              ],
            ] as const
          ).map(([key, label, help]) => (
            <Input
              key={key}
              label={label}
              name={`macro-${key}`}
              type="number"
              value={macrosObjetivo[key]}
              tooltip={help}
              onChange={(event) =>
                setMacrosObjetivo((current) => ({
                  ...current,
                  [key]: Number(event.target.value) || 0,
                }))
              }
              disabled={isPublicado}
            />
          ))}
        </div>
        {macrosSugeridos ? (
          <div className="plan-nutricional-builder__ia-row">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setMacrosObjetivo(macrosSugeridos)}
              disabled={isPublicado}
            >
              Usar macros sugeridos por IA
            </Button>
            <InfoTooltip text="La IA calcula las calorías y macros según la evaluación, el objetivo y el nivel de actividad de la alumna. Podés usarlos como base y ajustarlos." />
          </div>
        ) : null}
      </section>

      <details className="plan-nutricional-builder__copiloto">
        <summary className="plan-nutricional-builder__copiloto-summary">
          <span>
            <strong>Copiloto nutricional</strong>
            <small>Pedí un resumen o ajustes del plan</small>
          </span>
        </summary>
        <div className="plan-nutricional-builder__copiloto-body">
          <NutricionChatPanel
            rol="profe"
            alumnaId={alumnaId}
            planId={planId}
            title="Copiloto nutricional"
          />
        </div>
      </details>

      <div className="plan-nutricional-builder__workspace">
        <nav className="plan-nutricional-builder__day-rail" aria-label="Días del plan">
          {dias.map((dia, diaIndex) => {
            const diaMacros = sumDiaMacros(dia);
            const isActive = diaIndex === selectedDiaIndex;
            return (
              <button
                key={`${dia.nombre}-${diaIndex}`}
                type="button"
                className={
                  isActive
                    ? "plan-nutricional-builder__day-rail-item is-active"
                    : "plan-nutricional-builder__day-rail-item"
                }
                aria-current={isActive ? "true" : undefined}
                onClick={() => setSelectedDiaIndex(diaIndex)}
              >
                <span className="plan-nutricional-builder__day-rail-index">
                  Día {diaIndex + 1}
                </span>
                <span className="plan-nutricional-builder__day-rail-name">
                  {dia.nombre.trim() || "Sin nombre"}
                </span>
                <span className="plan-nutricional-builder__day-rail-meta">
                  {dia.comidas.length}{" "}
                  {dia.comidas.length === 1 ? "comida" : "comidas"}
                  {diaMacros.kcal > 0 ? ` · ${diaMacros.kcal} kcal` : ""}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            className="plan-nutricional-builder__day-rail-add"
            onClick={addDia}
            disabled={isPublicado}
          >
            + Agregar día
          </button>
        </nav>

        <div className="plan-nutricional-builder__dia-panel">
          {selectedDia ? (
            <>
              <div className="plan-nutricional-builder__dia-header">
                <Input
                  label="Nombre del día"
                  name={`dia-nombre-${selectedDiaIndex}`}
                  value={selectedDia.nombre}
                  onChange={(event) =>
                    updateDia(selectedDiaIndex, { nombre: event.target.value })
                  }
                  disabled={isPublicado}
                />
                <details className="plan-nutricional-builder__dia-menu">
                  <summary
                    className="plan-nutricional-builder__dia-menu-trigger"
                    aria-label="Acciones del día"
                  >
                    <span aria-hidden="true">⋯</span>
                  </summary>
                  <div className="plan-nutricional-builder__dia-menu-panel">
                    <button
                      type="button"
                      disabled={isPublicado}
                      onClick={(event) => {
                        closeMenu(event);
                        duplicateDia(selectedDiaIndex);
                      }}
                    >
                      Duplicar día
                    </button>
                    <button
                      type="button"
                      disabled={isPublicado || dias.length <= 1}
                      onClick={(event) => {
                        closeMenu(event);
                        removeDia(selectedDiaIndex);
                      }}
                    >
                      Quitar día
                    </button>
                  </div>
                </details>
              </div>

              {selectedDiaMacros && selectedDiaMacros.kcal > 0 ? (
                <MacrosProgressBar
                  objetivo={macrosObjetivo}
                  actual={selectedDiaMacros}
                />
              ) : null}

              {selectedDia.comidas.map((comida, comidaIndex) => (
                <PlanNutricionalComidaCard
                  key={`${selectedDiaIndex}-${comidaIndex}`}
                  comida={comida}
                  diaIndex={selectedDiaIndex}
                  comidaIndex={comidaIndex}
                  disabled={isPublicado}
                  canRemove={selectedDia.comidas.length > 1}
                  onUpdate={(patch) =>
                    updateComida(selectedDiaIndex, comidaIndex, patch)
                  }
                  onSelectAlimento={(ingredienteIndex, alimento) =>
                    handleSelectAlimento(
                      selectedDiaIndex,
                      comidaIndex,
                      ingredienteIndex,
                      alimento,
                    )
                  }
                  onCantidadChange={(ingredienteIndex, ingrediente, cantidad) =>
                    handleCantidadChange(
                      selectedDiaIndex,
                      comidaIndex,
                      ingredienteIndex,
                      ingrediente,
                      cantidad,
                    )
                  }
                  onUpdateIngrediente={(ingredienteIndex, patch) =>
                    updateIngrediente(
                      selectedDiaIndex,
                      comidaIndex,
                      ingredienteIndex,
                      patch,
                    )
                  }
                  onAddIngrediente={() =>
                    addIngrediente(selectedDiaIndex, comidaIndex)
                  }
                  onRemoveIngrediente={(ingredienteIndex) =>
                    removeIngrediente(
                      selectedDiaIndex,
                      comidaIndex,
                      ingredienteIndex,
                    )
                  }
                  onRemoveComida={() =>
                    removeComida(selectedDiaIndex, comidaIndex)
                  }
                />
              ))}

              <Button
                type="button"
                variant="ghost"
                onClick={() => addComida(selectedDiaIndex)}
                disabled={isPublicado}
              >
                + Comida
              </Button>
            </>
          ) : (
            <p className="plan-nutricional-builder__toolbar-hint">
              Seleccioná un día para editar las comidas.
            </p>
          )}
        </div>
      </div>

      {error ? <p className="auth-error">{error}</p> : null}
      {message ? <p className="alumnas-panel__status">{message}</p> : null}

      <div className="plan-nutricional-builder__save-bar">
        <div className="plan-nutricional-builder__save-bar-status">
          {hasUnsavedChanges ? (
            <p className="plan-nutricional-builder__save-bar-pending" role="status">
              <span className="plan-nutricional-builder__save-bar-dot" aria-hidden="true" />
              Cambios sin guardar
            </p>
          ) : (
            <p className="plan-nutricional-builder__save-bar-synced" role="status">
              Plan sincronizado
            </p>
          )}
          {isPublicado ? (
            <p className="plan-nutricional-builder__save-bar-hint">
              Archivá el plan para volver a editarlo.
            </p>
          ) : null}
        </div>
        <div className="plan-nutricional-builder__save-bar-actions">
          <Button
            type="button"
            variant="ghost"
            onClick={() => void handleGenerateDraft()}
            disabled={isBusy || isPublicado}
          >
            {generating ? "Generando..." : "Generar IA"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => void handleSave()}
            disabled={isBusy || isPublicado}
          >
            {saving ? "Guardando..." : "Guardar borrador"}
          </Button>
          <Button
            type="button"
            onClick={() => void handlePublish()}
            disabled={isBusy || isPublicado}
          >
            {publishing ? "Publicando..." : isPublicado ? "Publicado" : "Publicar plan"}
          </Button>
          {planId ? (
            <details className="plan-nutricional-builder__dia-menu">
              <summary
                className="plan-nutricional-builder__dia-menu-trigger"
                aria-label="Más acciones del plan"
              >
                <span aria-hidden="true">⋯</span>
              </summary>
              <div className="plan-nutricional-builder__dia-menu-panel">
                <button
                  type="button"
                  disabled={isBusy || plan?.estado === "archivado"}
                  onClick={(event) => {
                    closeMenu(event);
                    void handleArchive();
                  }}
                >
                  {archiving ? "Archivando..." : "Archivar"}
                </button>
                {!isPublicado ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={(event) => {
                      closeMenu(event);
                      void handleDelete();
                    }}
                  >
                    {deleting ? "Eliminando..." : "Eliminar borrador"}
                  </button>
                ) : null}
              </div>
            </details>
          ) : null}
        </div>
      </div>
    </div>
  );
}
