"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { apiFetch, ApiError, formatApiError } from "@/lib/api";
import { usePlanNutricionalProfe } from "@/features/profe/hooks/useGestionAlimentacion";
import type {
  DiaPlanNutricional,
  EstructuraComida,
  MacrosObjetivo,
  PlanNutricionalApiDoc,
  PlanNutricionalProfeWorkspace,
  UpdatePlanNutricionalPayload,
} from "@/features/alumna/types/plan-nutricional";
import {
  buildDefaultEstructura,
  prepareDiasForPlanApi,
  defaultWeekDayNames,
  planDiasTienenEstructura,
  syncDiasConEstructura,
} from "@/features/profe/lib/plan-macros";

const DEFAULT_MACROS: MacrosObjetivo = {
  kcal: 1800,
  proteinaG: 120,
  carbohidratosG: 180,
  grasasG: 60,
};

type AlimentacionPlanContextValue = {
  alumnaId: string;
  plan: PlanNutricionalApiDoc | null;
  planBorrador: PlanNutricionalApiDoc | null;
  planPublicado: PlanNutricionalApiDoc | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  titulo: string;
  observacionesProfe: string;
  macrosObjetivo: MacrosObjetivo;
  estructuraComidas: EstructuraComida[];
  dias: DiaPlanNutricional[];
  macrosSugeridos: MacrosObjetivo | null;
  hasUnsavedChanges: boolean;
  setTitulo: (value: string) => void;
  setObservacionesProfe: (value: string) => void;
  setMacrosObjetivo: (value: MacrosObjetivo) => void;
  setEstructuraComidas: (value: EstructuraComida[]) => void;
  setDias: Dispatch<SetStateAction<DiaPlanNutricional[]>>;
  setMacrosSugeridos: (value: MacrosObjetivo | null) => void;
  saveDraft: (
    overrides?: SaveDraftOverrides,
  ) => Promise<PlanNutricionalApiDoc | null>;
  refetch: () => Promise<void>;
  reloadFromServer: () => Promise<void>;
  isPublicado: boolean;
};

const AlimentacionPlanContext = createContext<AlimentacionPlanContextValue | null>(
  null,
);

export type SaveDraftOverrides = {
  titulo?: string;
  observacionesProfe?: string;
  macrosObjetivo?: MacrosObjetivo;
  estructuraComidas?: EstructuraComida[];
  dias?: DiaPlanNutricional[];
};

function serializeDraft(input: {
  titulo: string;
  observacionesProfe: string;
  macrosObjetivo: MacrosObjetivo;
  estructuraComidas: EstructuraComida[];
  dias: DiaPlanNutricional[];
}) {
  return JSON.stringify(input);
}

export function planDocId(
  doc: PlanNutricionalApiDoc | null | undefined,
): string | undefined {
  const id = doc?._id ?? doc?.id;
  return id ? String(id) : undefined;
}

async function fetchWorkspace(
  alumnaId: string,
): Promise<PlanNutricionalProfeWorkspace> {
  return apiFetch<PlanNutricionalProfeWorkspace>(
    `/api/plan-nutricional/workspace?alumnaId=${encodeURIComponent(alumnaId)}`,
  );
}

async function fetchWorkspaceDraftId(alumnaId: string): Promise<string | undefined> {
  const workspace = await fetchWorkspace(alumnaId);
  return planDocId(workspace.borrador);
}

function localStateFromPlanDoc(plan: PlanNutricionalApiDoc) {
  const nextEstructura =
    plan.estructuraComidas?.length
      ? plan.estructuraComidas
      : buildDefaultEstructura(4);
  let nextDias =
    plan.dias?.length
      ? plan.dias
      : defaultWeekDayNames().map((nombre) => ({ nombre, comidas: [] }));

  if (nextEstructura.length > 0 && planDiasTienenEstructura(nextDias)) {
    nextDias = syncDiasConEstructura(
      nextDias,
      nextEstructura,
      plan.macrosObjetivo,
    );
  }

  return {
    titulo: plan.titulo,
    observacionesProfe: plan.observacionesProfe ?? "",
    macrosObjetivo: plan.macrosObjetivo,
    estructuraComidas: nextEstructura,
    dias: nextDias,
  };
}

function snapshotFromLocalState(input: {
  titulo: string;
  observacionesProfe: string;
  macrosObjetivo: MacrosObjetivo;
  estructuraComidas: EstructuraComida[];
  dias: DiaPlanNutricional[];
}) {
  return serializeDraft(input);
}

function editingDocForHydration(
  plan: PlanNutricionalApiDoc | null,
  planBorrador: PlanNutricionalApiDoc | null,
): PlanNutricionalApiDoc | null {
  return planBorrador ?? (plan?.estado === "borrador" ? plan : null) ?? plan;
}

type AlimentacionPlanProviderProps = {
  alumnaId: string;
  onDirtyChange?: (dirty: boolean) => void;
  children: ReactNode;
};

export function AlimentacionPlanProvider({
  alumnaId,
  onDirtyChange,
  children,
}: AlimentacionPlanProviderProps) {
  const {
    plan,
    planBorrador,
    planPublicado,
    loading,
    refetch: refetchWorkspace,
  } = usePlanNutricionalProfe(alumnaId);

  const [titulo, setTitulo] = useState("Plan nutricional");
  const [observacionesProfe, setObservacionesProfe] = useState("");
  const [macrosObjetivo, setMacrosObjetivo] = useState<MacrosObjetivo>(DEFAULT_MACROS);
  const [estructuraComidas, setEstructuraComidas] = useState<EstructuraComida[]>([]);
  const [dias, setDias] = useState<DiaPlanNutricional[]>([]);
  const diasRef = useRef(dias);
  diasRef.current = dias;
  const [macrosSugeridos, setMacrosSugeridos] = useState<MacrosObjetivo | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasUnsavedChangesRef = useRef(false);
  const hydratedPlanIdRef = useRef<string | null>(null);

  const planKey = `${plan?._id ?? plan?.id ?? "none"}:${plan?.estado ?? "none"}:${plan?.updatedAt ?? ""}`;
  const borradorKey = `${planBorrador?._id ?? planBorrador?.id ?? "none"}:${planBorrador?.updatedAt ?? ""}`;
  const isPublicado = plan?.estado === "publicado" && !planBorrador;

  const applyPlanToEditor = useCallback((planDoc: PlanNutricionalApiDoc) => {
    const local = localStateFromPlanDoc(planDoc);
    setTitulo(local.titulo);
    setObservacionesProfe(local.observacionesProfe);
    setMacrosObjetivo(local.macrosObjetivo);
    setEstructuraComidas(local.estructuraComidas);
    setDias(local.dias);
    setSavedSnapshot(snapshotFromLocalState(local));
    hydratedPlanIdRef.current = planDocId(planDoc) ?? null;
  }, []);

  const reloadFromServer = useCallback(async () => {
    await refetchWorkspace();
    const workspace = await fetchWorkspace(alumnaId);
    const doc = editingDocForHydration(
      workspace.editing,
      workspace.borrador,
    );
    if (doc) {
      applyPlanToEditor(doc);
    }
    setError(null);
  }, [alumnaId, refetchWorkspace, applyPlanToEditor]);

  useEffect(() => {
    if (loading) return;

    const doc = editingDocForHydration(plan, planBorrador);

    if (!doc) {
      hydratedPlanIdRef.current = null;
      if (!planPublicado && !planBorrador) {
        setTitulo("Plan nutricional");
        setObservacionesProfe("");
        setMacrosObjetivo(macrosSugeridos ?? DEFAULT_MACROS);
        setEstructuraComidas([]);
        setDias([]);
        setSavedSnapshot(null);
      }
      return;
    }

    const id = planDocId(doc);
    const idChanged = id !== hydratedPlanIdRef.current;

    if (idChanged) {
      applyPlanToEditor(doc);
      return;
    }

    if (!hasUnsavedChangesRef.current && savedSnapshot === null) {
      applyPlanToEditor(doc);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, planKey, borradorKey, planPublicado]);

  const currentSnapshot = useMemo(
    () =>
      serializeDraft({
        titulo,
        observacionesProfe,
        macrosObjetivo,
        estructuraComidas,
        dias,
      }),
    [titulo, observacionesProfe, macrosObjetivo, estructuraComidas, dias],
  );

  const hasUnsavedChanges =
    savedSnapshot !== null && currentSnapshot !== savedSnapshot;

  hasUnsavedChangesRef.current = hasUnsavedChanges;

  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onDirtyChange]);

  const resolvePersistPlanId = useCallback(async (): Promise<string | undefined> => {
    let draftId = planDocId(planBorrador);
    if (!draftId) {
      draftId = await fetchWorkspaceDraftId(alumnaId);
    }
    if (draftId) return draftId;
    if (plan?.estado === "borrador") {
      return planDocId(plan);
    }
    return undefined;
  }, [alumnaId, plan, planBorrador]);

  const saveDraft = useCallback(async (overrides?: SaveDraftOverrides) => {
    setSaving(true);
    setError(null);

    const nextTitulo = overrides?.titulo ?? titulo;
    const nextObservaciones = overrides?.observacionesProfe ?? observacionesProfe;
    const nextMacros = overrides?.macrosObjetivo ?? macrosObjetivo;
    const nextEstructura = overrides?.estructuraComidas ?? estructuraComidas;
    let nextDiasRaw = overrides?.dias ?? diasRef.current;
    if (nextEstructura.length > 0 && planDiasTienenEstructura(nextDiasRaw)) {
      nextDiasRaw = syncDiasConEstructura(
        nextDiasRaw,
        nextEstructura,
        nextMacros,
      );
    }
    const diasConMacros = prepareDiasForPlanApi(nextDiasRaw);
    const payload: UpdatePlanNutricionalPayload = {
      titulo: nextTitulo,
      observacionesProfe: nextObservaciones,
      macrosObjetivo: nextMacros,
      estructuraComidas: nextEstructura,
      dias: diasConMacros,
    };

    try {
      const persistPlan = async (targetId?: string) => {
        if (targetId) {
          return apiFetch<PlanNutricionalApiDoc>(
            `/api/plan-nutricional/${targetId}`,
            { method: "PATCH", body: JSON.stringify(payload) },
          );
        }
        return apiFetch<PlanNutricionalApiDoc>("/api/plan-nutricional", {
          method: "POST",
          body: JSON.stringify({ alumnaId, ...payload }),
        });
      };

      const planId = await resolvePersistPlanId();

      let saved: PlanNutricionalApiDoc;
      try {
        saved = await persistPlan(planId);
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          await refetchWorkspace();
          const retryId = await fetchWorkspaceDraftId(alumnaId);
          if (!retryId) throw err;
          saved = await persistPlan(retryId);
        } else {
          throw err;
        }
      }

      applyPlanToEditor(saved);
      await refetchWorkspace();

      return saved;
    } catch (err) {
      setError(formatApiError(err));
      return null;
    } finally {
      setSaving(false);
    }
  }, [
    alumnaId,
    estructuraComidas,
    macrosObjetivo,
    observacionesProfe,
    refetchWorkspace,
    resolvePersistPlanId,
    titulo,
    applyPlanToEditor,
  ]);

  const value = useMemo(
    () => ({
      alumnaId,
      plan,
      planBorrador,
      planPublicado,
      loading,
      saving,
      error,
      titulo,
      observacionesProfe,
      macrosObjetivo,
      estructuraComidas,
      dias,
      macrosSugeridos,
      hasUnsavedChanges,
      setTitulo,
      setObservacionesProfe,
      setMacrosObjetivo,
      setEstructuraComidas,
      setDias,
      setMacrosSugeridos,
      saveDraft,
      refetch: refetchWorkspace,
      reloadFromServer,
      isPublicado,
    }),
    [
      alumnaId,
      plan,
      planBorrador,
      planPublicado,
      loading,
      saving,
      error,
      titulo,
      observacionesProfe,
      macrosObjetivo,
      estructuraComidas,
      dias,
      macrosSugeridos,
      hasUnsavedChanges,
      saveDraft,
      refetchWorkspace,
      reloadFromServer,
      isPublicado,
    ],
  );

  return (
    <AlimentacionPlanContext.Provider value={value}>
      {children}
    </AlimentacionPlanContext.Provider>
  );
}

export function useAlimentacionPlan() {
  const ctx = useContext(AlimentacionPlanContext);
  if (!ctx) {
    throw new Error("useAlimentacionPlan debe usarse dentro de AlimentacionPlanProvider");
  }
  return ctx;
}
