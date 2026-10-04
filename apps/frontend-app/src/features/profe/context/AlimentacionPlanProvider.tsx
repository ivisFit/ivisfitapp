"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { apiFetch, formatApiError } from "@/lib/api";
import { usePlanNutricionalProfe } from "@/features/profe/hooks/useGestionAlimentacion";
import type {
  DiaPlanNutricional,
  EstructuraComida,
  MacrosObjetivo,
  PlanNutricionalApiDoc,
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
  refetch: () => void;
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
  const { plan, planBorrador, planPublicado, loading, refetch } =
    usePlanNutricionalProfe(alumnaId);

  const [titulo, setTitulo] = useState("Plan nutricional");
  const [observacionesProfe, setObservacionesProfe] = useState("");
  const [macrosObjetivo, setMacrosObjetivo] = useState<MacrosObjetivo>(DEFAULT_MACROS);
  const [estructuraComidas, setEstructuraComidas] = useState<EstructuraComida[]>([]);
  const [dias, setDias] = useState<DiaPlanNutricional[]>([]);
  const [macrosSugeridos, setMacrosSugeridos] = useState<MacrosObjetivo | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planKey = `${plan?._id ?? plan?.id ?? "none"}:${plan?.estado ?? "none"}:${plan?.updatedAt ?? ""}`;
  const isPublicado = plan?.estado === "publicado";

  useEffect(() => {
    if (!plan) {
      setTitulo("Plan nutricional");
      setObservacionesProfe("");
      setMacrosObjetivo(macrosSugeridos ?? DEFAULT_MACROS);
      setEstructuraComidas([]);
      setDias([]);
      setSavedSnapshot(null);
      return;
    }

    const nextEstructura =
      plan.estructuraComidas?.length
        ? plan.estructuraComidas
        : buildDefaultEstructura(4);
    let nextDias =
      plan.dias?.length
        ? plan.dias
        : defaultWeekDayNames().map((nombre) => ({ nombre, comidas: [] }));

    if (
      nextEstructura.length > 0 &&
      planDiasTienenEstructura(nextDias)
    ) {
      nextDias = syncDiasConEstructura(
        nextDias,
        nextEstructura,
        plan.macrosObjetivo,
      );
    }

    setTitulo(plan.titulo);
    setObservacionesProfe(plan.observacionesProfe ?? "");
    setMacrosObjetivo(plan.macrosObjetivo);
    setEstructuraComidas(nextEstructura);
    setDias(nextDias);
    setSavedSnapshot(
      serializeDraft({
        titulo: plan.titulo,
        observacionesProfe: plan.observacionesProfe ?? "",
        macrosObjetivo: plan.macrosObjetivo,
        estructuraComidas: nextEstructura,
        dias: nextDias,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planKey]);

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

  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onDirtyChange]);

  const saveDraft = useCallback(async (overrides?: SaveDraftOverrides) => {
    setSaving(true);
    setError(null);

    const nextTitulo = overrides?.titulo ?? titulo;
    const nextObservaciones = overrides?.observacionesProfe ?? observacionesProfe;
    const nextMacros = overrides?.macrosObjetivo ?? macrosObjetivo;
    const nextEstructura = overrides?.estructuraComidas ?? estructuraComidas;
    let nextDiasRaw = overrides?.dias ?? dias;
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
      const planId = plan?._id ?? plan?.id;
      let saved: PlanNutricionalApiDoc;
      if (planId) {
        saved = await apiFetch<PlanNutricionalApiDoc>(
          `/api/plan-nutricional/${planId}`,
          { method: "PATCH", body: JSON.stringify(payload) },
        );
      } else {
        saved = await apiFetch<PlanNutricionalApiDoc>("/api/plan-nutricional", {
          method: "POST",
          body: JSON.stringify({ alumnaId, ...payload }),
        });
      }
      setSavedSnapshot(
        serializeDraft({
          titulo: nextTitulo,
          observacionesProfe: nextObservaciones,
          macrosObjetivo: nextMacros,
          estructuraComidas: nextEstructura,
          dias: nextDiasRaw,
        }),
      );
      if (overrides?.titulo !== undefined) setTitulo(nextTitulo);
      if (overrides?.observacionesProfe !== undefined) {
        setObservacionesProfe(nextObservaciones);
      }
      if (overrides?.macrosObjetivo !== undefined) setMacrosObjetivo(nextMacros);
      if (overrides?.estructuraComidas !== undefined) {
        setEstructuraComidas(nextEstructura);
      }
      setDias(nextDiasRaw);
      refetch();
      return saved;
    } catch (err) {
      setError(formatApiError(err));
      return null;
    } finally {
      setSaving(false);
    }
  }, [
    alumnaId,
    dias,
    estructuraComidas,
    macrosObjetivo,
    observacionesProfe,
    plan,
    refetch,
    titulo,
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
      refetch,
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
      refetch,
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
