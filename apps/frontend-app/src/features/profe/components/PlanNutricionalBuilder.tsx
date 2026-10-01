"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Button, Input, InfoTooltip } from "@/components";
import { useAppDialog } from "@/components/AppDialogProvider";
import { FormSkeleton, ListSkeleton } from "@/components/skeletons/AppSkeleton";
import { apiFetch } from "@/lib/api";
import { RotateCcw, RotateCw } from "lucide-react";
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

const MAX_HISTORY = 50;

function useUndoRedo<T>(initialValue: T) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialValue);
  const [future, setFuture] = useState<T[]>([]);
  const isRestoring = useRef(false);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const pushHistory = useCallback((newPresent: T) => {
    if (isRestoring.current) return;
    setPast((prev) => {
      const next = [...prev, present];
      return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
    });
    setPresent(newPresent);
    setFuture([]);
  }, [present]);

  const undo = useCallback(() => {
    if (!canUndo) return;
    isRestoring.current = true;
    setPast((prev) => {
      const previous = prev[prev.length - 1];
      const newPast = prev.slice(0, -1);
      setFuture((f) => [present, ...f]);
      setPresent(previous);
      setTimeout(() => { isRestoring.current = false; }, 0);
      return newPast;
    });
  }, [canUndo, present]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    isRestoring.current = true;
    setFuture((f) => {
      const next = f[0];
      const newFuture = f.slice(1);
      setPast((p) => [...p, present]);
      setPresent(next);
      setTimeout(() => { isRestoring.current = false; }, 0);
      return newFuture;
    });
  }, [canRedo, present]);

  const reset = useCallback((newValue: T) => {
    setPast([]);
    setPresent(newValue);
    setFuture([]);
  }, []);

  return {
    state: present,
    setState: pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  };
}

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

async function pollDraftResult(jobId: string, signal?: AbortSignal): Promise<PlanNutricionalApiDoc> {
  const startedAt = Date.now();

  for (;;) {
    if (Date.now() - startedAt > DRAFT_POLL_MAX_MS) {
      throw new Error("La generación tardó demasiado. Intentá de nuevo.");
    }

    if (signal?.aborted) {
      throw new DOMException("Cancelled", "AbortError");
    }

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, DRAFT_POLL_INTERVAL_MS);
      signal?.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new DOMException("Cancelled", "AbortError"));
      });
    });

    const status = await apiFetch<GenerateDraftStatusResponse>(
      `/api/plan-nutricional/generar-borrador/estado/${jobId}`,
      { signal },
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
  planBorrador?: PlanNutricionalApiDoc | null;
  planPublicado?: PlanNutricionalApiDoc | null;
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

function planDiasTienenContenido(diasPlan: DiaPlanNutricional[]) {
  return diasPlan.some((dia) =>
    dia.comidas.some(
      (comida) =>
        Boolean(comida.preparacion?.trim()) ||
        Boolean(comida.notas?.trim()) ||
        comida.ingredientes.some(
          (ing) =>
            ing.nombre.trim() !== "" ||
            ing.kcal != null ||
            Boolean(ing.alimentoId),
        ),
    ),
  );
}

function buildDiasPlantilla(diasPlan: DiaPlanNutricional[]) {
  return diasPlan.map((dia, index) => ({
    nombre: dia.nombre.trim() || `Día ${index + 1}`,
  }));
}

// --- Validación pre-publicación ---
function validatePlanForPublish(params: {
  macrosObjetivo: MacrosObjetivo;
  dias: DiaPlanNutricional[];
}): { ok: boolean; message?: string } {
  const { macrosObjetivo, dias } = params;

  if (!macrosObjetivo.kcal || macrosObjetivo.kcal < 800) {
    return { ok: false, message: "El plan debe tener al menos 800 kcal diarias." };
  }
  if (!macrosObjetivo.proteinaG || macrosObjetivo.proteinaG <= 0) {
    return { ok: false, message: "La proteína diaria debe ser mayor a 0g." };
  }
  if (!macrosObjetivo.carbohidratosG || macrosObjetivo.carbohidratosG <= 0) {
    return { ok: false, message: "Los carbohidratos diarios deben ser mayores a 0g." };
  }
  if (!macrosObjetivo.grasasG || macrosObjetivo.grasasG <= 0) {
    return { ok: false, message: "Las grasas diarias deben ser mayores a 0g." };
  }

  const hasAnyContent = dias.some((dia) =>
    dia.comidas.some(
      (comida) =>
        Boolean(comida.nombre.trim()) ||
        Boolean(comida.horario?.trim()) ||
        comida.ingredientes.some(
          (ing) => ing.nombre.trim() !== "" || ing.kcal != null || Boolean(ing.alimentoId),
        ),
    ),
  );

  if (!hasAnyContent) {
    return { ok: false, message: "El plan debe tener al menos una comida con contenido." };
  }

  const diasConComidasVacias = dias.filter((dia) =>
    dia.comidas.every(
      (comida) =>
        !comida.nombre.trim() &&
        !comida.horario?.trim() &&
        comida.ingredientes.every(
          (ing) => ing.nombre.trim() === "" && ing.kcal == null && !ing.alimentoId,
        ),
    ),
  );

  if (diasConComidasVacias.length > 0) {
    return {
      ok: false,
      message: `${diasConComidasVacias.length} día(s) están completamente vacíos. Eliminá los días vacíos o agregá contenido.`,
    };
  }

  return { ok: true };
}

// --- Sanitizar ingredientes: asegurar macros numéricos ---
function sanitizeDiasForSave(dias: DiaPlanNutricional[]): DiaPlanNutricional[] {
  return dias.map((dia) => ({
    ...dia,
    comidas: dia.comidas.map((comida) => ({
      ...comida,
      ingredientes: comida.ingredientes.map((ing) => ({
        ...ing,
        kcal: ing.kcal ?? 0,
        proteinaG: ing.proteinaG ?? 0,
        carbohidratosG: ing.carbohidratosG ?? 0,
        grasasG: ing.grasasG ?? 0,
      })),
    })),
  }));
}

export function PlanNutricionalBuilder({
  alumnaId,
  alumnaNombre,
  plan,
  planBorrador = null,
  planPublicado = null,
  loading = false,
  macrosSugeridos,
  onSaved,
  onDirtyChange,
}: PlanNutricionalBuilderProps) {
  const dialog = useAppDialog();
  const [titulo, setTitulo] = useState("Plan nutricional");
  const [observacionesProfe, setObservacionesProfe] = useState("");
  const [macrosObjetivo, setMacrosObjetivo] = useState<MacrosObjetivo>(DEFAULT_MACROS);
  const [dias, setDias] = useState<DiaPlanNutricional[]>([createEmptyDia()]);
  const [selectedDiaIndex, setSelectedDiaIndex] = useState(0);
  const [manualStarted, setManualStarted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingAbortController, setGeneratingAbortController] = useState<AbortController | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [creatingVersion, setCreatingVersion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);

  // --- Undo/Redo para dias ---
  const diasHistoryRef = useRef<DiaPlanNutricional[][]>([]);
  const diasHistoryIndexRef = useRef(-1);
  const MAX_HISTORY = 50;

  function pushDiasHistory(newDias: DiaPlanNutricional[]) {
    // No registrar si estamos restaurando
    if (diasHistoryIndexRef.current === -1 && diasHistoryRef.current.length === 0) {
      // Primera vez: inicializar con estado actual
      diasHistoryRef.current = [dias];
      diasHistoryIndexRef.current = 0;
    }
    const truncated = diasHistoryRef.current.slice(0, diasHistoryIndexRef.current + 1);
    const next = [...truncated, newDias].slice(-MAX_HISTORY);
    diasHistoryRef.current = next;
    diasHistoryIndexRef.current = next.length - 1;
  }

  function setDiasWithHistory(newDias: DiaPlanNutricional[] | ((prev: DiaPlanNutricional[]) => DiaPlanNutricional[])) {
    const resolved = typeof newDias === "function" ? newDias(dias) : newDias;
    pushDiasHistory(resolved);
    setDias(resolved);
  }

  function undoDias() {
    if (diasHistoryIndexRef.current <= 0) return;
    diasHistoryIndexRef.current -= 1;
    const previous = diasHistoryRef.current[diasHistoryIndexRef.current];
    setDias(previous);
  }

  function redoDias() {
    if (diasHistoryIndexRef.current >= diasHistoryRef.current.length - 1) return;
    diasHistoryIndexRef.current += 1;
    const next = diasHistoryRef.current[diasHistoryIndexRef.current];
    setDias(next);
  }

  const canUndoDias = diasHistoryIndexRef.current > 0;
  const canRedoDias = diasHistoryIndexRef.current < diasHistoryRef.current.length - 1;

  function resetDiasHistory(newDias: DiaPlanNutricional[]) {
    diasHistoryRef.current = [newDias];
    diasHistoryIndexRef.current = 0;
    setDias(newDias);
  }

  const isPublicado = plan?.estado === "publicado";
  const isBusy =
    saving || generating || publishing || archiving || deleting || creatingVersion;
  const publishedPlanId = planPublicado?._id ?? planPublicado?.id;
  const pendingDraftWhilePublished = Boolean(planBorrador && planPublicado);
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
      resetDiasHistory([createEmptyDia()]);
      setSelectedDiaIndex(0);
      setManualStarted(false);
      setSavedSnapshot(null);
      onDirtyChange?.(false);
      return;
    }

    const draft = applyPlanToDraft(plan);
    const diasSanitizados = sanitizeDiasForSave(draft.dias);
    setTitulo(draft.titulo);
    setObservacionesProfe(draft.observacionesProfe);
    setMacrosObjetivo(draft.macrosObjetivo);
    resetDiasHistory(diasSanitizados);
    setSelectedDiaIndex((current) =>
      current < diasSanitizados.length ? current : 0,
    );
    setManualStarted(true);
    setSavedSnapshot(serializePlanDraft({ ...draft, dias: diasSanitizados }));
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

  // Cleanup: cancel IA generation on unmount
  useEffect(() => {
    return () => {
      generatingAbortController?.abort();
    };
  }, [generatingAbortController]);

  // Keyboard shortcuts: Undo (Ctrl+Z) / Redo (Ctrl+Shift+Z)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ignorar si el foco está en un input/textarea
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redoDias();
        } else {
          undoDias();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndoDias, canRedoDias]);

  function markCurrentAsSaved(nextSnapshot = currentSnapshot) {
    setSavedSnapshot(nextSnapshot);
  }

  function applyGeneratedPlan(data: PlanNutricionalApiDoc) {
    const draft = applyPlanToDraft(data);
    const diasSanitizados = sanitizeDiasForSave(draft.dias);
    setTitulo(draft.titulo);
    setObservacionesProfe(draft.observacionesProfe);
    setMacrosObjetivo(draft.macrosObjetivo);
    resetDiasHistory(diasSanitizados);
    setSelectedDiaIndex(0);
    setManualStarted(true);
    markCurrentAsSaved(serializePlanDraft({ ...draft, dias: diasSanitizados }));
  }

  async function handleGenerateDraft() {
    const debeConfirmar = dias.length > 1 || planDiasTienenContenido(dias);
    if (debeConfirmar) {
      const confirmed = await dialog.confirm({
        title: "Completar con IA",
        message: `La IA va a completar las comidas en tus ${dias.length} día(s), manteniendo los nombres. Se reemplazará el contenido actual de cada comida. ¿Continuar?`,
        tone: "warning",
        confirmLabel: "Continuar",
      });
      if (!confirmed) return;
    }

    const abortController = new AbortController();
    setGeneratingAbortController(abortController);
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
            diasPlantilla: buildDiasPlantilla(dias),
          }),
        },
      );

      const data = await pollDraftResult(jobId, abortController.signal);
      applyGeneratedPlan(data);
      const sinCatalogo = data.dias?.some((dia) =>
        dia.comidas.some((comida) =>
          comida.ingredientes.some(
            (ing) => ing.nombre.trim() && !ing.alimentoId,
          ),
        ),
      );
      setMessage(
        sinCatalogo
          ? "Borrador generado. Revisá los ingredientes marcados sin catálogo antes de publicar."
          : "Borrador generado. Revisá y editá antes de publicar.",
      );
      onSaved();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setMessage("Generación cancelada.");
      } else {
        setError(
          err instanceof Error
            ? `${err.message} Si tardó demasiado, intentá generar el borrador de nuevo.`
            : "No se pudo generar el borrador",
        );
      }
    } finally {
      setGenerating(false);
      setGeneratingAbortController(null);
    }
  }

  async function handleSave() {
    // Validación de advertencia (no bloqueante)
    const validation = validatePlanForPublish({ macrosObjetivo, dias });
    const showWarning = !validation.ok;

    setSaving(true);
    setError(null);
    setMessage(null);

    const diasSanitizados = sanitizeDiasForSave(dias);

    const payload: UpdatePlanNutricionalPayload = {
      titulo,
      observacionesProfe,
      macrosObjetivo,
      dias: diasSanitizados,
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

      const baseMessage = "Plan guardado como borrador.";
      setMessage(showWarning ? `${baseMessage} ⚠️ ${validation.message}` : baseMessage);
      markCurrentAsSaved();
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el plan");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    const validation = validatePlanForPublish({ macrosObjetivo, dias });
    if (!validation.ok) {
      setError(validation.message ?? "Plan inválido para publicar.");
      return;
    }

    setPublishing(true);
    setError(null);
    setMessage(null);

    const diasSanitizados = sanitizeDiasForSave(dias);

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
              dias: diasSanitizados,
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
            dias: diasSanitizados,
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
    const confirmed = await dialog.confirm({
      title: "Archivar plan",
      message: "¿Archivar este plan? Dejará de estar activo.",
      tone: "warning",
      confirmLabel: "Archivar",
    });
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
    const confirmed = await dialog.confirm({
      title: "Eliminar borrador",
      message: "¿Eliminar este borrador? Esta acción no se puede deshacer.",
      tone: "danger",
      confirmLabel: "Eliminar",
    });
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    setMessage(null);

    try {
      await apiFetch(`/api/plan-nutricional/${planId}`, { method: "DELETE" });
      setMessage(
        planPublicado
          ? "Borrador descartado. Seguís viendo el plan publicado."
          : "Borrador eliminado.",
      );
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el borrador");
    } finally {
      setDeleting(false);
    }
  }

  async function handleCreateNewVersion() {
    const sourceId = publishedPlanId;
    if (!sourceId) return;

    setCreatingVersion(true);
    setError(null);
    setMessage(null);

    try {
      await apiFetch(`/api/plan-nutricional/${sourceId}/nueva-version`, {
        method: "POST",
      });
      setMessage(
        "Nueva versión creada en borrador. La alumna sigue viendo el plan publicado hasta que republicás.",
      );
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo crear la nueva versión",
      );
    } finally {
      setCreatingVersion(false);
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
    setDiasWithHistory((current) =>
      current.map((dia, index) => (index === diaIndex ? { ...dia, ...patch } : dia)),
    );
  }

  function addDia() {
    setDiasWithHistory((current) => [...current, createEmptyDia(`Día ${current.length + 1}`)]);
    setSelectedDiaIndex(dias.length);
  }

  function duplicateDia(diaIndex: number) {
    setDiasWithHistory((current) => {
      const source = current[diaIndex];
      if (!source) return current;
      const next = [...current];
      next.splice(diaIndex + 1, 0, cloneDia(source, `${source.nombre} (copia)`));
      return next;
    });
    setSelectedDiaIndex(diaIndex + 1);
  }

  function removeDia(diaIndex: number) {
    setDiasWithHistory((current) => {
      if (current.length <= 1) return current;
      return current.filter((_, index) => index !== diaIndex);
    });
  }

  function updateComida(
    diaIndex: number,
    comidaIndex: number,
    patch: Partial<ComidaPlan>,
  ) {
    setDiasWithHistory((current) =>
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
    setDiasWithHistory((current) =>
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
    setDiasWithHistory((current) =>
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
    setDiasWithHistory((current) =>
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
    setDiasWithHistory((current) =>
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
    setDiasWithHistory((current) =>
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
        <div className="sk-card__head" aria-hidden>
          <span className="sk sk--sm sk--gold sk--w-40" />
          <span className="sk sk--xs sk--w-56" />
        </div>
        <FormSkeleton fields={3} showButton={false} />
        <ListSkeleton items={3} surface={false} />
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
      {pendingDraftWhilePublished ? (
        <div className="plan-nutricional-builder__version-banner" role="status">
          <p>
            Tenés una versión en borrador basada en el plan publicado. La alumna
            sigue viendo el plan publicado hasta que republicás.
          </p>
          <div className="plan-nutricional-builder__version-banner-actions">
            <Button type="button" variant="ghost" disabled={isBusy} onClick={() => void handleDelete()}>
              {deleting ? "Descartando..." : "Descartar borrador"}
            </Button>
          </div>
        </div>
      ) : null}

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
          {macrosSugeridos ? (
            <div className="plan-nutricional-macros__ia-actions">
              <Button
                type="button"
                variant="ghost"
                className="ap-btn-sm"
                onClick={() => setMacrosObjetivo(macrosSugeridos)}
                disabled={isPublicado}
              >
                Usar macros IA
              </Button>
              <InfoTooltip text="La IA calcula las calorías y macros según la evaluación, el objetivo y el nivel de actividad de la alumna. Podés usarlos como base y ajustarlos." />
            </div>
          ) : null}
        </div>
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
              Para editar, creá una nueva versión. El plan publicado sigue visible
              para la alumna hasta republicar.
            </p>
          ) : null}
        </div>
        <div className="plan-nutricional-builder__save-bar-actions">
          <Button
            type="button"
            variant="ghost"
            className="btn--icon"
            onClick={undoDias}
            disabled={isBusy || isPublicado || !canUndoDias}
            aria-label="Deshacer"
            title="Deshacer (Ctrl+Z)"
          >
            <RotateCcw size={18} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="btn--icon"
            onClick={redoDias}
            disabled={isBusy || isPublicado || !canRedoDias}
            aria-label="Rehacer"
            title="Rehacer (Ctrl+Shift+Z)"
          >
            <RotateCw size={18} />
          </Button>
          {isPublicado ? (
            <Button
              type="button"
              onClick={() => void handleCreateNewVersion()}
              disabled={isBusy || Boolean(planBorrador)}
            >
              {creatingVersion ? "Creando..." : "Crear nueva versión"}
            </Button>
          ) : null}
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
            {publishing
              ? "Publicando..."
              : isPublicado
                ? "Publicado"
                : planPublicado
                  ? "Republicar plan"
                  : "Publicar plan"}
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
