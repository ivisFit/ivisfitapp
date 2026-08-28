"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button, Input, Select } from "@/components";
import { InlineSkeleton, ListSkeleton } from "@/components/skeletons/AppSkeleton";
import { useBancoEjercicios } from "@/features/profe/hooks/useBancoEjercicios";
import { useAlumnaRutinaEditor } from "@/features/profe/hooks/useAlumnaRutinaEditor";
import {
  savePlanTemplateBlueprint,
  usePlanTemplateDetail,
} from "@/features/profe/hooks/usePlanTemplateDetail";
import type { PlanTemplate } from "@/features/profe/hooks/usePlanTemplates";
import { PlanContentPreviewLab } from "@/features/profe/components/PlanContentPreviewLab";
import { RutinaDiaCard } from "@/features/profe/components/RutinaDiaCard";
import { RutinaSemanaTabs } from "@/features/profe/components/RutinaSemanaTabs";
import {
  buildChallenge28FromEditorState,
  buildPreviewRutina,
  createEmptyPlanContentDayDraft,
  createEmptyPlanContentEditorState,
  createEmptyPlanContentWeekDraft,
  draftSemanasToRutinaSemanas,
  getPlanDayNumberFromSemanas,
  hasPlanContentEditorData,
  mergePlanContentEditorWithDefaults,
  planContentEditorToDraft,
  type PlanContentDayDraft,
  type PlanContentEditorState,
  type PlanContentWeekDraft,
} from "@/features/profe/lib/plan-content";
import {
  blueprintToFormState,
  buildSemanasDraftForPlan,
  createDiaPlanDraft,
  createDraftEjercicio,
  formStateToBlueprint,
  formStateToRutinaPayload,
  mergeTemplateBlueprintForSave,
  planContentDefaultsFromTemplate,
  rutinaDetailToBlueprint,
  rutinaDocToFormState,
  type DiaPlanDraft,
  type EjercicioRutinaDraft,
  type MediaType,
  type PlanTemplateBlueprint,
  type SemanaPlanDraft,
} from "@/features/profe/lib/rutina-draft";
import { resolveRutinaDay } from "@/features/alumna/lib/rutina-day";
import { apiFetch } from "@/lib/api";
import { invalidateCache } from "@/lib/apiCache";

const DURACION_OPTIONS = [4, 5, 6, 8];
const DEFAULT_DIAS_POR_SEMANA = 3;
const MAX_DIAS_POR_SEMANA = 7;
const DIAS_POR_SEMANA_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

function getDiasPorSemanaFromDraft(
  semanas: SemanaPlanDraft[],
  fallback = DEFAULT_DIAS_POR_SEMANA,
): number {
  if (semanas.length === 0) return fallback;
  return Math.max(...semanas.map((s) => s.dias.length), fallback);
}

function resizeSemanasToDiasPorSemana(
  semanas: SemanaPlanDraft[],
  diasPorSemana: number,
  defaultEjercicioId = "",
): SemanaPlanDraft[] {
  const target = Math.min(MAX_DIAS_POR_SEMANA, Math.max(1, diasPorSemana));

  return semanas.map((sem) => {
    const nextDias = [...sem.dias];
    while (nextDias.length < target) {
      nextDias.push(
        createDiaPlanDraft(nextDias.length + 1, defaultEjercicioId),
      );
    }
    while (nextDias.length > target) {
      nextDias.pop();
    }
    return { ...sem, dias: nextDias };
  });
}

type RutinaBuilderProps = {
  mode?: "template" | "alumna";
  alumnaId?: string;
  alumnaNombre?: string;
  planTemplates?: PlanTemplate[];
  selectedPlanTemplate?: PlanTemplate | null;
  onSelectPlanTemplate?: (plan: PlanTemplate | null) => void;
  onDirtyChange?: (dirty: boolean) => void;
};

function createLocalId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

function isSemanaComplete(semana: SemanaPlanDraft): boolean {
  return (
    semana.dias.length > 0 &&
    semana.dias.every(
      (dia) =>
        dia.nombreDia.trim() &&
        dia.drafts.length > 0 &&
        dia.drafts.every((draft) => draft.ejercicioId),
    )
  );
}

function cloneDiaForDuplicate(dia: DiaPlanDraft): DiaPlanDraft {
  return {
    localId: createLocalId(),
    nombreDia: `${dia.nombreDia} (copia)`,
    drafts: dia.drafts.map((draft) => ({
      ...draft,
      localId: createLocalId(),
    })),
  };
}

function cloneDiaContent(source: DiaPlanDraft, target: DiaPlanDraft): DiaPlanDraft {
  return {
    ...target,
    nombreDia: source.nombreDia,
    drafts: source.drafts.map((draft) => ({
      ...draft,
      localId: createLocalId(),
    })),
  };
}

function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildPlanTemplateSnapshot(plan: PlanTemplate) {
  return {
    slug: plan.slug,
    nombre: plan.nombre,
    duracionSemanas: plan.duracionSemanas,
    duracionLabel: plan.duracionLabel,
    formato: plan.formato,
    inversion: plan.inversion,
    ...(typeof plan.precio === "number" ? { precio: plan.precio } : {}),
    ...(plan.moneda ? { moneda: plan.moneda } : {}),
  };
}

function applyFormState(
  state: ReturnType<typeof blueprintToFormState>,
  setters: {
    setNombrePlan: (v: string) => void;
    setDuracionSemanas: (v: number) => void;
    setDiasPorSemana: (v: number) => void;
    setStartDate: (v: string) => void;
    setStoryMediaType: (v: MediaType) => void;
    setStoryBackgroundUrl: (v: string) => void;
    setStoryPosterUrl: (v: string) => void;
    setStoryTitle: (v: string) => void;
    setStorySubtitle: (v: string) => void;
    setStoryCtaLabel: (v: string) => void;
    setPlanContent: (v: PlanContentEditorState) => void;
    setSemanasDraft: (v: SemanaPlanDraft[]) => void;
  },
) {
  setters.setNombrePlan(state.nombrePlan);
  setters.setDuracionSemanas(state.duracionSemanas);
  setters.setDiasPorSemana(state.diasPorSemana);
  setters.setStartDate(state.startDate);
  setters.setStoryMediaType(state.storyMediaType);
  setters.setStoryBackgroundUrl(state.storyBackgroundUrl);
  setters.setStoryPosterUrl(state.storyPosterUrl);
  setters.setStoryTitle(state.storyTitle);
  setters.setStorySubtitle(state.storySubtitle);
  setters.setStoryCtaLabel(state.storyCtaLabel);
  setters.setPlanContent(state.planContent);
  setters.setSemanasDraft(state.semanasDraft);
}

export function RutinaBuilder({
  mode = "template",
  alumnaId: alumnaIdProp,
  alumnaNombre,
  planTemplates = [],
  selectedPlanTemplate = null,
  onSelectPlanTemplate,
  onDirtyChange,
}: RutinaBuilderProps) {
  const isTemplateMode = mode === "template";
  const isAlumnaMode = mode === "alumna";
  const {
    ejercicios,
    loading: loadingEjercicios,
    error: ejerciciosError,
    refetch: refetchEjercicios,
  } = useBancoEjercicios();
  const {
    blueprint: loadedBlueprint,
    loading: loadingBlueprint,
    refetch: refetchBlueprint,
  } = usePlanTemplateDetail(
    isTemplateMode ? (selectedPlanTemplate?.id ?? null) : null,
  );
  const {
    rutinaId: existingRutinaId,
    rutina: existingRutina,
    loading: loadingAlumnaRutina,
    error: alumnaRutinaError,
    refetch: refetchAlumnaRutina,
  } = useAlumnaRutinaEditor(isAlumnaMode ? alumnaIdProp : undefined);

  const [nombrePlan, setNombrePlan] = useState("");
  const [duracionSemanas, setDuracionSemanas] = useState(4);
  const [startDate, setStartDate] = useState(() =>
    formatDateInputValue(new Date()),
  );
  const [storyMediaType, setStoryMediaType] = useState<MediaType>("image");
  const [storyBackgroundUrl, setStoryBackgroundUrl] = useState("");
  const [storyPosterUrl, setStoryPosterUrl] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [storySubtitle, setStorySubtitle] = useState("");
  const [storyCtaLabel, setStoryCtaLabel] = useState("");
  const [planContent, setPlanContent] = useState<PlanContentEditorState>(
    createEmptyPlanContentEditorState,
  );
  const [savedBlueprintJson, setSavedBlueprintJson] = useState<string | null>(
    null,
  );
  const [savedAlumnaJson, setSavedAlumnaJson] = useState<string | null>(null);
  const [templatePickerId, setTemplatePickerId] = useState("");
  const hydratedRutinaRef = useRef<string | null>(null);
  const hydratedBlueprintRef = useRef<string | null>(null);
  const lastPlanTemplateIdRef = useRef<string | null>(null);
  const pendingTodayRef = useRef<{ week: number; dayIndex: number } | null>(
    null,
  );
  const [numeroSemana, setNumeroSemana] = useState(1);
  const [diasPorSemana, setDiasPorSemana] = useState(DEFAULT_DIAS_POR_SEMANA);
  const [semanasDraft, setSemanasDraft] = useState<SemanaPlanDraft[]>(() =>
    buildSemanasDraftForPlan(1, DEFAULT_DIAS_POR_SEMANA),
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedDiaId, setSelectedDiaId] = useState<string | null>(null);
  const [alumnaEditorReady, setAlumnaEditorReady] = useState(false);

  const duracionOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...DURACION_OPTIONS,
          ...planTemplates.map((plan) => plan.duracionSemanas),
          duracionSemanas,
        ]),
      ).sort((a, b) => a - b),
    [duracionSemanas, planTemplates],
  );

  const semanasValid =
    semanasDraft.length > 0 &&
    semanasDraft.every(
      (sem) =>
        sem.dias.length > 0 &&
        sem.dias.every(
          (dia) =>
            dia.nombreDia.trim() &&
            dia.drafts.length > 0 &&
            dia.drafts.every((draft) => draft.ejercicioId),
        ),
    );

  const canSaveTemplate =
    isTemplateMode &&
    Boolean(selectedPlanTemplate?.id) &&
    Boolean(nombrePlan.trim());

  const templateSaveBlockedReason = !selectedPlanTemplate?.id
    ? "Seleccioná un plan del catálogo superior."
    : !nombrePlan.trim()
      ? "Completá el nombre del plan."
      : null;

  const canSaveAlumnaRutina =
    isAlumnaMode &&
    Boolean(alumnaIdProp) &&
    Boolean(nombrePlan.trim()) &&
    (existingRutinaId ? true : semanasValid);

  const totalDiasPlan = useMemo(
    () => semanasDraft.reduce((total, sem) => total + sem.dias.length, 0),
    [semanasDraft],
  );

  const semanaIndex = semanasDraft.findIndex(
    (semana) => semana.numeroSemana === numeroSemana,
  );
  const semanaActiva =
    semanaIndex >= 0 ? semanasDraft[semanaIndex] : semanasDraft[0];
  const diasSemana = semanaActiva?.dias ?? [];
  const alumnaToday = useMemo(
    () => (isAlumnaMode && existingRutina ? resolveRutinaDay(existingRutina) : null),
    [existingRutina, isAlumnaMode],
  );

  useEffect(() => {
    if (!isAlumnaMode || !semanaActiva) return;

    const pending = pendingTodayRef.current;
    if (pending && semanaActiva.numeroSemana === pending.week) {
      const todayDia = semanaActiva.dias[pending.dayIndex];
      if (todayDia) {
        pendingTodayRef.current = null;
        if (selectedDiaId !== todayDia.localId) {
          setSelectedDiaId(todayDia.localId);
        }
        return;
      }
    }

    const exists = semanaActiva.dias.some((dia) => dia.localId === selectedDiaId);
    if (!exists) {
      setSelectedDiaId(semanaActiva.dias[0]?.localId ?? null);
    }
  }, [isAlumnaMode, semanaActiva, selectedDiaId]);

  const formSetters = {
    setNombrePlan,
    setDuracionSemanas,
    setDiasPorSemana,
    setStartDate,
    setStoryMediaType,
    setStoryBackgroundUrl,
    setStoryPosterUrl,
    setStoryTitle,
    setStorySubtitle,
    setStoryCtaLabel,
    setPlanContent,
    setSemanasDraft,
  };

  useEffect(() => {
    if (!isTemplateMode || !selectedPlanTemplate || loadingBlueprint) return;
    if (hydratedBlueprintRef.current === selectedPlanTemplate.id) return;

    const defaultEjercicioId = ejercicios[0]?.id ?? "";
    const state = blueprintToFormState(
      loadedBlueprint,
      selectedPlanTemplate,
      defaultEjercicioId,
      startDate,
    );
    applyFormState(state, formSetters);
    setNumeroSemana(1);
    hydratedBlueprintRef.current = selectedPlanTemplate.id;
    setSavedBlueprintJson(
      JSON.stringify(
        mergeTemplateBlueprintForSave(
          formStateToBlueprint(state, "Día"),
          loadedBlueprint,
          state.semanasDraft,
        ),
      ),
    );
    lastPlanTemplateIdRef.current = selectedPlanTemplate.id;
  }, [
    isTemplateMode,
    selectedPlanTemplate,
    loadedBlueprint,
    loadingBlueprint,
    ejercicios,
    startDate,
  ]);

  useEffect(() => {
    if (!isAlumnaMode || !existingRutina || loadingAlumnaRutina) return;

    const hasMissingEjercicios = existingRutina.semanas.some((semana) =>
      semana.dias.some((dia) =>
        dia.ejercicios.some((ejercicio) => !ejercicio.id?.trim()),
      ),
    );

    if (
      hydratedRutinaRef.current === existingRutina.id &&
      !hasMissingEjercicios
    ) {
      return;
    }

    const defaultEjercicioId = ejercicios[0]?.id ?? "";
    const state = rutinaDocToFormState(
      existingRutina,
      defaultEjercicioId,
      startDate,
    );
    applyFormState(state, formSetters);
    const today = resolveRutinaDay(existingRutina);
    pendingTodayRef.current = today
      ? { week: today.numeroSemana, dayIndex: today.dayIndex }
      : null;
    setNumeroSemana(today?.numeroSemana ?? 1);
    setAlumnaEditorReady(true);
    hydratedRutinaRef.current = existingRutina.id;
    setSavedAlumnaJson(
      JSON.stringify(
        formStateToBlueprint(
          state,
          state.semanasDraft[0]?.dias[0]?.nombreDia || "Día",
        ),
      ),
    );
    if (existingRutina.planTemplateSnapshot) {
      const match = planTemplates.find(
        (p) => p.nombre === existingRutina.planTemplateSnapshot?.nombre,
      );
      if (match) onSelectPlanTemplate?.(match);
    }
  }, [
    isAlumnaMode,
    existingRutina,
    loadingAlumnaRutina,
    ejercicios,
    startDate,
    planTemplates,
    onSelectPlanTemplate,
  ]);

  useEffect(() => {
    if (!selectedPlanTemplate) return;

    const contentDefaults = planContentDefaultsFromTemplate(selectedPlanTemplate);
    setStoryTitle((current) => current.trim() || selectedPlanTemplate.nombre);
    setStorySubtitle((current) => current.trim() || selectedPlanTemplate.enfoque);
    setPlanContent((current) =>
      mergePlanContentEditorWithDefaults(current, contentDefaults),
    );
  }, [selectedPlanTemplate]);

  useEffect(() => {
    hydratedBlueprintRef.current = null;
  }, [selectedPlanTemplate?.id]);

  useEffect(() => {
    hydratedRutinaRef.current = null;
    setSavedAlumnaJson(null);
    if (!existingRutina) setAlumnaEditorReady(false);
  }, [existingRutina?.id]);

  useEffect(() => {
    if (!isTemplateMode) return;
    if (!selectedPlanTemplate) {
      lastPlanTemplateIdRef.current = null;
      hydratedBlueprintRef.current = null;
    }
  }, [isTemplateMode, selectedPlanTemplate]);

  useEffect(() => {
    const maxDay = Math.max(1, totalDiasPlan);
    setPlanContent((current) => {
      if (current.selectedDayNumber <= maxDay) return current;
      return { ...current, selectedDayNumber: maxDay };
    });
  }, [totalDiasPlan]);

  function updatePlanContentGlobal(
    patch: Partial<Pick<PlanContentEditorState, "title" | "subtitle" | "accentLabel">>,
  ) {
    setPlanContent((current) => ({ ...current, ...patch }));
  }

  function updatePlanDayByNumber(
    dayNumber: number,
    patch: Partial<PlanContentDayDraft>,
  ) {
    setPlanContent((current) => ({
      ...current,
      selectedDayNumber: dayNumber,
      daysByNumber: {
        ...current.daysByNumber,
        [dayNumber]: {
          ...(current.daysByNumber[dayNumber] ??
            createEmptyPlanContentDayDraft()),
          ...patch,
        },
      },
    }));
  }

  function updatePlanWeekByNumber(
    weekNumber: number,
    patch: Partial<PlanContentWeekDraft>,
  ) {
    setPlanContent((current) => ({
      ...current,
      weeksByNumber: {
        ...(current.weeksByNumber ?? {}),
        [weekNumber]: {
          ...(current.weeksByNumber?.[weekNumber] ??
            createEmptyPlanContentWeekDraft()),
          ...patch,
        },
      },
    }));
  }

  const planContentDraft = useMemo(
    () => planContentEditorToDraft(planContent),
    [planContent],
  );

  const currentBlueprintJson = useMemo(() => {
    const state = {
      nombrePlan,
      duracionSemanas,
      diasPorSemana,
      startDate,
      storyMediaType,
      storyBackgroundUrl,
      storyPosterUrl,
      storyTitle,
      storySubtitle,
      storyCtaLabel,
      planContent,
      semanasDraft,
    };
    const blueprint = formStateToBlueprint(
      state,
      diasSemana[0]?.nombreDia || "Día",
    );
    return JSON.stringify(
      isTemplateMode
        ? mergeTemplateBlueprintForSave(
            blueprint,
            loadedBlueprint,
            semanasDraft,
          )
        : blueprint,
    );
  }, [
    nombrePlan,
    duracionSemanas,
    diasPorSemana,
    startDate,
    storyMediaType,
    storyBackgroundUrl,
    storyPosterUrl,
    storyTitle,
    storySubtitle,
    storyCtaLabel,
    planContent,
    semanasDraft,
    diasSemana,
    isTemplateMode,
    loadedBlueprint,
  ]);

  const templateHasUnsavedChanges =
    isTemplateMode &&
    savedBlueprintJson !== null &&
    currentBlueprintJson !== savedBlueprintJson;

  const alumnaHasUnsavedChanges =
    isAlumnaMode &&
    savedAlumnaJson !== null &&
    currentBlueprintJson !== savedAlumnaJson;

  useEffect(() => {
    if (!isAlumnaMode || loadingAlumnaRutina || existingRutina) return;
    if (savedAlumnaJson !== null) return;
    setSavedAlumnaJson(currentBlueprintJson);
  }, [
    isAlumnaMode,
    loadingAlumnaRutina,
    existingRutina,
    savedAlumnaJson,
    currentBlueprintJson,
  ]);

  useEffect(() => {
    if (!isAlumnaMode) return;
    onDirtyChange?.(alumnaHasUnsavedChanges);
  }, [isAlumnaMode, alumnaHasUnsavedChanges, onDirtyChange]);

  async function handleSaveTemplate() {
    if (!selectedPlanTemplate?.id || !canSaveTemplate) return;

    setSaving(true);
    setSaveError(null);
    setSuccessMessage(null);

    const blueprint = mergeTemplateBlueprintForSave(
      formStateToBlueprint(
        {
          nombrePlan,
          duracionSemanas,
          diasPorSemana,
          startDate,
          storyMediaType,
          storyBackgroundUrl,
          storyPosterUrl,
          storyTitle,
          storySubtitle,
          storyCtaLabel,
          planContent,
          semanasDraft,
        },
        diasSemana[0]?.nombreDia || "Día",
      ),
      loadedBlueprint,
      semanasDraft,
    );

    try {
      const result = await savePlanTemplateBlueprint(
        selectedPlanTemplate.id,
        blueprint,
      );
      setSavedBlueprintJson(JSON.stringify(blueprint));
      const syncedCount = result.syncedRutinasCount ?? 0;
      setSuccessMessage(
        syncedCount > 0
          ? `Plantilla guardada correctamente. Videos actualizados en ${syncedCount} rutina${syncedCount === 1 ? "" : "s"} de alumnas.`
          : "Plantilla guardada correctamente.",
      );
      refetchBlueprint();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "No se pudo guardar la plantilla",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleLoadTemplateIntoEditor() {
    const plan =
      planTemplates.find((p) => p.id === templatePickerId) ??
      selectedPlanTemplate;
    if (!plan) return;

    onSelectPlanTemplate?.(plan);
    setTemplatePickerId(plan.id);

    void (async () => {
      try {
        const doc = await apiFetch<{ blueprint?: PlanTemplateBlueprint }>(
          `/api/plan-templates/${plan.id}`,
        );
        const defaultEjercicioId = ejercicios[0]?.id ?? "";
        const state = blueprintToFormState(
          doc.blueprint,
          plan,
          defaultEjercicioId,
          startDate,
        );
        applyFormState(state, formSetters);
        setNumeroSemana(1);
        setAlumnaEditorReady(true);
        setSelectedDiaId(state.semanasDraft[0]?.dias[0]?.localId ?? null);
      } catch (err) {
        setSaveError(
          err instanceof Error ? err.message : "No se pudo cargar la plantilla",
        );
      }
    })();
  }

  const ejerciciosById = useMemo(
    () => new Map(ejercicios.map((ejercicio) => [ejercicio.id, ejercicio])),
    [ejercicios],
  );

  const previewUsesPlanContent = hasPlanContentEditorData(planContent);

  const previewStartDate = isTemplateMode
    ? formatDateInputValue(new Date())
    : startDate;

  const previewRutina = useMemo(() => {
    const challenge28 = previewUsesPlanContent
      ? buildChallenge28FromEditorState(
          planContent,
          diasSemana[0]?.nombreDia || "Día",
        )
      : undefined;

    return buildPreviewRutina({
      nombrePlan: nombrePlan || selectedPlanTemplate?.nombre || "Plan",
      duracionSemanas,
      startDate: previewStartDate,
      planTemplateSnapshot: selectedPlanTemplate
        ? buildPlanTemplateSnapshot(selectedPlanTemplate)
        : undefined,
      challenge28,
      semanas: draftSemanasToRutinaSemanas(semanasDraft, ejerciciosById),
    });
  }, [
    previewUsesPlanContent,
    planContent,
    nombrePlan,
    duracionSemanas,
    previewStartDate,
    selectedPlanTemplate,
    semanasDraft,
    ejerciciosById,
    diasSemana,
  ]);

  useEffect(() => {
    if (selectedPlanTemplate) return;

    setSemanasDraft((current) => {
      const existingByNumber = new Map(
        current.map((s) => [s.numeroSemana, s] as const),
      );

      return Array.from({ length: duracionSemanas }, (_, idx) => {
        const numero = idx + 1;
        const existing = existingByNumber.get(numero);
        if (existing) return existing;

        return {
          numeroSemana: numero,
          dias: Array.from({ length: diasPorSemana }, (_, dayIdx) =>
            createDiaPlanDraft(dayIdx + 1, ejercicios[0]?.id ?? ""),
          ),
        };
      });
    });
  }, [duracionSemanas, selectedPlanTemplate, ejercicios, diasPorSemana]);

  function updateDia(
    weekNumber: number,
    diaLocalId: string,
    patch: Partial<Omit<DiaPlanDraft, "localId">>,
  ) {
    setSemanasDraft((current) =>
      current.map((sem) => {
        if (sem.numeroSemana !== weekNumber) return sem;
        return {
          ...sem,
          dias: sem.dias.map((dia) =>
            dia.localId === diaLocalId ? { ...dia, ...patch } : dia,
          ),
        };
      }),
    );
  }

  function updateDraft(
    weekNumber: number,
    diaLocalId: string,
    draftLocalId: string,
    patch: Partial<Omit<EjercicioRutinaDraft, "localId">>,
  ) {
    setSemanasDraft((current) =>
      current.map((sem) => {
        if (sem.numeroSemana !== weekNumber) return sem;
        return {
          ...sem,
          dias: sem.dias.map((dia) => {
            if (dia.localId !== diaLocalId) return dia;
            return {
              ...dia,
              drafts: dia.drafts.map((draft) =>
                draft.localId === draftLocalId
                  ? { ...draft, ...patch }
                  : draft,
              ),
            };
          }),
        };
      }),
    );
  }

  function addDia(weekNumber: number) {
    const week = semanasDraft.find((sem) => sem.numeroSemana === weekNumber);
    if (!week || week.dias.length >= MAX_DIAS_POR_SEMANA) return;

    const newDia = createDiaPlanDraft(
      week.dias.length + 1,
      ejercicios[0]?.id ?? "",
    );
    setSemanasDraft((current) =>
      current.map((sem) => {
        if (sem.numeroSemana !== weekNumber) return sem;
        return {
          ...sem,
          dias: [...sem.dias, newDia],
        };
      }),
    );
    if (isAlumnaMode) setSelectedDiaId(newDia.localId);
  }

  function removeDia(weekNumber: number, diaLocalId: string) {
    setSemanasDraft((current) =>
      current.map((sem) => {
        if (sem.numeroSemana !== weekNumber) return sem;
        return sem.dias.length > 1
          ? { ...sem, dias: sem.dias.filter((d) => d.localId !== diaLocalId) }
          : sem;
      }),
    );
  }

  function addDraft(weekNumber: number, diaLocalId: string) {
    setSemanasDraft((current) =>
      current.map((sem) => {
        if (sem.numeroSemana !== weekNumber) return sem;
        return {
          ...sem,
          dias: sem.dias.map((dia) => {
            if (dia.localId !== diaLocalId) return dia;
            return {
              ...dia,
              drafts: [
                ...dia.drafts,
                createDraftEjercicio(""),
              ],
            };
          }),
        };
      }),
    );
  }

  function removeDraft(
    weekNumber: number,
    diaLocalId: string,
    draftLocalId: string,
  ) {
    setSemanasDraft((current) =>
      current.map((sem) => {
        if (sem.numeroSemana !== weekNumber) return sem;
        return {
          ...sem,
          dias: sem.dias.map((dia) => {
            if (dia.localId !== diaLocalId) return dia;
            return {
              ...dia,
              drafts:
                dia.drafts.length > 1
                  ? dia.drafts.filter((d) => d.localId !== draftLocalId)
                  : dia.drafts,
            };
          }),
        };
      }),
    );
  }

  function moveDraft(
    weekNumber: number,
    diaLocalId: string,
    draftLocalId: string,
    direction: "up" | "down",
  ) {
    setSemanasDraft((current) =>
      current.map((sem) => {
        if (sem.numeroSemana !== weekNumber) return sem;
        return {
          ...sem,
          dias: sem.dias.map((dia) => {
            if (dia.localId !== diaLocalId) return dia;
            const index = dia.drafts.findIndex((d) => d.localId === draftLocalId);
            if (index < 0) return dia;
            const targetIndex = direction === "up" ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= dia.drafts.length) return dia;
            const nextDrafts = [...dia.drafts];
            const [moved] = nextDrafts.splice(index, 1);
            nextDrafts.splice(targetIndex, 0, moved);
            return { ...dia, drafts: nextDrafts };
          }),
        };
      }),
    );
  }

  function duplicateDia(weekNumber: number, diaLocalId: string) {
    const sourceWeek = semanasDraft.find((sem) => sem.numeroSemana === weekNumber);
    if (!sourceWeek || sourceWeek.dias.length >= MAX_DIAS_POR_SEMANA) return;

    const source = sourceWeek.dias.find((dia) => dia.localId === diaLocalId);
    if (!source) return;
    const clone = cloneDiaForDuplicate(source);
    setSemanasDraft((current) =>
      current.map((sem) => {
        if (sem.numeroSemana !== weekNumber) return sem;
        return {
          ...sem,
          dias: [...sem.dias, clone],
        };
      }),
    );
    if (isAlumnaMode) setSelectedDiaId(clone.localId);
  }

  function copyDiaToAllWeeks(weekNumber: number, diaLocalId: string) {
    setSemanasDraft((current) => {
      const sourceWeek = current.find((sem) => sem.numeroSemana === weekNumber);
      const sourceDia = sourceWeek?.dias.find((dia) => dia.localId === diaLocalId);
      if (!sourceWeek || !sourceDia) return current;

      const sourceIndex = sourceWeek.dias.findIndex(
        (dia) => dia.localId === diaLocalId,
      );

      return current.map((sem) => {
        if (sem.numeroSemana === weekNumber) return sem;
        return {
          ...sem,
          dias: sem.dias.map((dia, index) => {
            if (index !== sourceIndex) return dia;
            return cloneDiaContent(sourceDia, dia);
          }),
        };
      });
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isTemplateMode) {
      await handleSaveTemplate();
      return;
    }

    if (!alumnaIdProp || !canSaveAlumnaRutina) return;

    setSaving(true);
    setSaveError(null);
    setSuccessMessage(null);

    const fallbackDayTitle = diasSemana[0]?.nombreDia || "Día";
    const formState = {
      nombrePlan,
      duracionSemanas,
      diasPorSemana,
      startDate,
      storyMediaType,
      storyBackgroundUrl,
      storyPosterUrl,
      storyTitle,
      storySubtitle,
      storyCtaLabel,
      planContent,
      semanasDraft,
    };
    const previousBlueprint =
      existingRutinaId && existingRutina
        ? rutinaDetailToBlueprint(
            existingRutina,
            ejercicios[0]?.id ?? "",
            startDate,
          )
        : undefined;

    const payload = formStateToRutinaPayload(
      formState,
      alumnaIdProp,
      selectedPlanTemplate,
      buildPlanTemplateSnapshot,
      fallbackDayTitle,
      previousBlueprint ? { previousBlueprint } : undefined,
    );

    if (!existingRutinaId && payload.semanas.length === 0) {
      setSaveError(
        "Completá al menos una semana con ejercicios antes de guardar.",
      );
      setSaving(false);
      return;
    }

    try {
      if (existingRutinaId) {
        await apiFetch(`/api/rutinas/${existingRutinaId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/rutinas", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      invalidateCache("/api/rutinas");
      setSuccessMessage(
        existingRutinaId
          ? "Rutina de la alumna actualizada correctamente."
          : "Rutina de la alumna guardada correctamente.",
      );
      setSavedAlumnaJson(currentBlueprintJson);
      refetchAlumnaRutina();
      hydratedRutinaRef.current = null;
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "No se pudo guardar la rutina",
      );
    } finally {
      setSaving(false);
    }
  }

  const selectedDia =
    semanaActiva?.dias.find((dia) => dia.localId === selectedDiaId) ??
    semanaActiva?.dias[0] ??
    null;
  const selectedDiaIndex = selectedDia
    ? (semanaActiva?.dias.findIndex((dia) => dia.localId === selectedDia.localId) ?? 0)
    : 0;
  const alumnaPlanBadge =
    selectedPlanTemplate?.nombre ??
    existingRutina?.planTemplateSnapshot?.nombre ??
    null;
  const showAlumnaEmpty =
    isAlumnaMode &&
    !loadingAlumnaRutina &&
    !existingRutina &&
    !alumnaEditorReady;
  const showAlumnaEditor =
    isAlumnaMode &&
    !loadingAlumnaRutina &&
    (Boolean(existingRutina) || alumnaEditorReady);
  const canAddDiaToActiveWeek = Boolean(
    semanaActiva && semanaActiva.dias.length < MAX_DIAS_POR_SEMANA,
  );

  function renderDiaCard(dia: DiaPlanDraft, diaIndex: number) {
    if (!semanaActiva) return null;
    const weekNumber = semanaActiva.numeroSemana;
    const planDayNumber = getPlanDayNumberFromSemanas(
      semanasDraft,
      semanaIndex,
      diaIndex,
    );
    const planDayDraft =
      planContent.daysByNumber[planDayNumber] ??
      createEmptyPlanContentDayDraft();
    const canDuplicateDia = semanaActiva.dias.length < MAX_DIAS_POR_SEMANA;

    return (
      <RutinaDiaCard
        key={dia.localId}
        dia={dia}
        diaIndex={diaIndex}
        ejercicios={ejercicios}
        loadingEjercicios={loadingEjercicios}
        isAlumnaMode={isAlumnaMode}
        planDayDraft={planDayDraft}
        canRemoveDia={semanaActiva.dias.length > 1}
        canDuplicateDia={canDuplicateDia}
        onUpdateDia={(patch) => updateDia(weekNumber, dia.localId, patch)}
        onRemoveDia={() => removeDia(weekNumber, dia.localId)}
        onDuplicateDia={() => duplicateDia(weekNumber, dia.localId)}
        onCopyDiaToAllWeeks={() => copyDiaToAllWeeks(weekNumber, dia.localId)}
        onUpdatePlanDay={(patch) => updatePlanDayByNumber(planDayNumber, patch)}
        onAddDraft={() => addDraft(weekNumber, dia.localId)}
        onUpdateDraft={(draftLocalId, patch) =>
          updateDraft(weekNumber, dia.localId, draftLocalId, patch)
        }
        onRemoveDraft={(draftLocalId) =>
          removeDraft(weekNumber, dia.localId, draftLocalId)
        }
        onMoveDraft={(draftLocalId, direction) =>
          moveDraft(weekNumber, dia.localId, draftLocalId, direction)
        }
      />
    );
  }

  function renderWeekMediaFields(weekNumber: number) {
    const weekDraft =
      planContent.weeksByNumber?.[weekNumber] ?? createEmptyPlanContentWeekDraft();

    return (
      <div className="rutina-builder__week-media">
        <p className="rutina-builder__week-media-title">
          Videos de la semana {weekNumber}
        </p>
        <div className="rutina-builder__week-media-grid">
          <Input
            label="Video de presentación de la semana (URL)"
            name={`weekPresentationVideo-${weekNumber}`}
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={weekDraft.presentationVideoUrl}
            onChange={(event) =>
              updatePlanWeekByNumber(weekNumber, {
                presentationVideoUrl: event.target.value,
              })
            }
          />
          <Input
            label="Video de cierre de la semana (URL)"
            name={`weekFarewellVideo-${weekNumber}`}
            type="url"
            placeholder="https://youtu.be/..."
            value={weekDraft.farewellVideoUrl}
            onChange={(event) =>
              updatePlanWeekByNumber(weekNumber, {
                farewellVideoUrl: event.target.value,
              })
            }
          />
        </div>
      </div>
    );
  }

  function handleDuracionChange(nextDuration: number) {
    setDuracionSemanas(nextDuration);
    setNumeroSemana((current) => Math.min(current, nextDuration));
    setSemanasDraft((current) => {
      const existingByNumber = new Map(
        current.map((s) => [s.numeroSemana, s] as const),
      );
      return Array.from({ length: nextDuration }, (_, idx) => {
        const numero = idx + 1;
        const existing = existingByNumber.get(numero);
        if (existing) return existing;
        return {
          numeroSemana: numero,
          dias: Array.from({ length: diasPorSemana }, (_, dayIdx) =>
            createDiaPlanDraft(dayIdx + 1, ejercicios[0]?.id ?? ""),
          ),
        };
      });
    });
  }

  function handleDiasPorSemanaChange(next: number) {
    setDiasPorSemana(next);
    setSemanasDraft((current) =>
      resizeSemanasToDiasPorSemana(
        current.length > 0
          ? current
          : buildSemanasDraftForPlan(
              duracionSemanas,
              next,
              ejercicios[0]?.id ?? "",
            ),
        next,
        ejercicios[0]?.id ?? "",
      ),
    );
  }

  function handleWeekChange(week: number) {
    setNumeroSemana(week);
    if (!isAlumnaMode) return;
    const next = semanasDraft.find((sem) => sem.numeroSemana === week);
    setSelectedDiaId(next?.dias[0]?.localId ?? null);
  }

  const alumnaSaveBlockedReason = !nombrePlan.trim()
    ? "Completá el nombre del plan."
    : !existingRutinaId && !semanasValid
      ? "Completá el nombre de cada día y asigná un ejercicio en cada uno."
      : null;

  const planStructureFields = (
    <>
      <Input
        label="Nombre del plan"
        name="nombrePlan"
        required
        placeholder="Ej: Fuerza tren inferior"
        value={nombrePlan}
        onChange={(event) => setNombrePlan(event.target.value)}
      />
      {isAlumnaMode ? (
        <Input
          label="Inicio"
          name="startDate"
          type="date"
          required
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
      ) : null}
      <Select
        label="Duración"
        name="duracionSemanas"
        value={duracionSemanas}
        onChange={(event) => handleDuracionChange(Number(event.target.value))}
      >
        {duracionOptions.map((duration) => (
          <option key={duration} value={duration}>
            {duration} semanas
          </option>
        ))}
      </Select>
      <Select
        label="Días / semana"
        name="diasPorSemana"
        value={diasPorSemana}
        onChange={(event) =>
          handleDiasPorSemanaChange(Number(event.target.value))
        }
      >
        {DIAS_POR_SEMANA_OPTIONS.map((days) => (
          <option key={days} value={days}>
            {days} {days === 1 ? "día" : "días"}
          </option>
        ))}
      </Select>
    </>
  );

  return (
    <section
      className={
        isAlumnaMode ? "rutina-builder rutina-builder--alumna" : "rutina-builder"
      }
    >
      {!isAlumnaMode ? (
        <div className="rutina-builder__header">
          <div>
            <h2>Editor de plantilla</h2>
            <p>
              Definí la plantilla del plan. La alumna y la fecha de inicio se
              configuran en el perfil de cada alumna.
            </p>
          </div>
          <div className="rutina-builder__refresh">
            <Button type="button" variant="ghost" onClick={refetchEjercicios}>
              Actualizar ejercicios
            </Button>
          </div>
        </div>
      ) : null}

      {ejerciciosError || alumnaRutinaError ? (
        <p className="auth-error">{ejerciciosError ?? alumnaRutinaError}</p>
      ) : null}

      {loadingAlumnaRutina || (isTemplateMode && loadingBlueprint) ? (
        <div aria-busy="true" aria-label="Cargando datos de la rutina">
          <InlineSkeleton />
          <InlineSkeleton />
        </div>
      ) : null}

      {showAlumnaEmpty ? (
        <div className="rutina-builder__empty">
          <h2>Todavía no hay rutina</h2>
          <p>
            Elegí un plan base y cargá la plantilla para personalizarla para{" "}
            {alumnaNombre ?? "esta alumna"}.
          </p>
          <Select
            label="Plan base IVIS"
            name="templatePicker"
            value={templatePickerId || selectedPlanTemplate?.id || ""}
            onChange={(event) => setTemplatePickerId(event.target.value)}
          >
            <option value="">Seleccionar plan</option>
            {planTemplates.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {String(plan.orden).padStart(2, "0")} · {plan.nombre}
              </option>
            ))}
          </Select>
          <Button
            type="button"
            disabled={!templatePickerId && !selectedPlanTemplate?.id}
            onClick={handleLoadTemplateIntoEditor}
          >
            Cargar plantilla
          </Button>
        </div>
      ) : null}

      {!isAlumnaMode || showAlumnaEditor ? (
      <form className="rutina-builder__form" onSubmit={handleSubmit}>
        {isAlumnaMode ? (
          <section className="rutina-builder__toolbar">
            {alumnaPlanBadge ? (
              <span className="rutina-builder__plan-badge">{alumnaPlanBadge}</span>
            ) : null}
            {existingRutina ? (
              <p className="rutina-builder__toolbar-hint">
                Editá la rutina activa de {alumnaNombre ?? "la alumna"} y usá
                &quot;Actualizar rutina&quot; para guardar los cambios.
              </p>
            ) : null}
            <div className="rutina-builder__toolbar-grid">{planStructureFields}</div>
          </section>
        ) : (
          <section className="rutina-builder__config-card glass-surface">
            <div className="rutina-builder__config-header">
              <div>
                <h3>Configuración</h3>
                <p>Definí la estructura base del plan antes de cargar ejercicios.</p>
              </div>
              {selectedPlanTemplate ? (
                <span className="rutina-builder__plan-badge">
                  {selectedPlanTemplate.nombre}
                </span>
              ) : null}
            </div>

            <div className="rutina-builder__config-grid">
              {planStructureFields}
              <Input
                label="Título del contenido"
                name="challengeTitle"
                placeholder="Plan de entrenamiento"
                value={planContent.title}
                onChange={(event) =>
                  updatePlanContentGlobal({ title: event.target.value })
                }
              />
              <Input
                label="Subtítulo del contenido"
                name="challengeSubtitle"
                placeholder="Seguimiento personalizado"
                value={planContent.subtitle}
                onChange={(event) =>
                  updatePlanContentGlobal({ subtitle: event.target.value })
                }
              />
              <Input
                label="Etiqueta destacada"
                name="challengeAccentLabel"
                placeholder="Nivel glow"
                value={planContent.accentLabel}
                onChange={(event) =>
                  updatePlanContentGlobal({ accentLabel: event.target.value })
                }
              />
            </div>
          </section>
        )}

        {!isAlumnaMode ? (
          <details className="rutina-builder__story-details">
            <summary className="rutina-builder__story-summary">
              <span>
                <strong>Story preview</strong>
                <small>Fondo y textos de la vista tipo historia</small>
              </span>
            </summary>
            <div className="rutina-builder__media-panel">
              <div className="rutina-builder__media-grid">
                <Select
                  label="Tipo de fondo"
                  name="storyMediaType"
                  value={storyMediaType}
                  onChange={(event) =>
                    setStoryMediaType(event.target.value as MediaType)
                  }
                >
                  <option value="image">Imagen</option>
                  <option value="video">Video</option>
                  <option value="gif">GIF</option>
                </Select>
                <Input
                  label="URL fondo"
                  name="storyBackgroundUrl"
                  type="url"
                  placeholder="https://..."
                  value={storyBackgroundUrl}
                  onChange={(event) => setStoryBackgroundUrl(event.target.value)}
                />
                <Input
                  label="Poster video"
                  name="storyPosterUrl"
                  type="url"
                  placeholder="https://..."
                  value={storyPosterUrl}
                  onChange={(event) => setStoryPosterUrl(event.target.value)}
                />
                <Input
                  label="Título story"
                  name="storyTitle"
                  placeholder="Entrená fuerte hoy"
                  value={storyTitle}
                  onChange={(event) => setStoryTitle(event.target.value)}
                />
                <Input
                  label="Subtítulo story"
                  name="storySubtitle"
                  placeholder="Piernas + glúteos"
                  value={storySubtitle}
                  onChange={(event) => setStorySubtitle(event.target.value)}
                />
                <Input
                  label="CTA story"
                  name="storyCtaLabel"
                  placeholder="Empezar rutina"
                  value={storyCtaLabel}
                  onChange={(event) => setStoryCtaLabel(event.target.value)}
                />
              </div>
            </div>
          </details>
        ) : null}

        <div className="rutina-builder__exercise-list">
          {!isAlumnaMode ? (
            <div className="rutina-builder__exercise-list-header">
              <div>
                <h3>Ejercicios del plan</h3>
                <p className="rutina-builder__plan-hint">
                  {totalDiasPlan} días en total · {duracionSemanas} semanas ·{" "}
                  {diasPorSemana} {diasPorSemana === 1 ? "día" : "días"} por semana
                </p>
              </div>
            </div>
          ) : null}

          {loadingEjercicios ? (
            <div aria-busy="true" aria-label="Cargando ejercicios">
              <ListSkeleton items={3} />
            </div>
          ) : null}

          {!loadingEjercicios && ejercicios.length === 0 ? (
            <p className="alumnas-panel__status">
              Primero cargá ejercicios en el banco.
            </p>
          ) : null}

          <RutinaSemanaTabs
            semanas={semanasDraft}
            activeWeek={numeroSemana}
            onChange={handleWeekChange}
            isWeekComplete={isSemanaComplete}
          />

          {semanaActiva && isAlumnaMode ? (
            <div
              className="rutina-builder__workspace"
              id={`rutina-semana-${semanaActiva.numeroSemana}`}
            >
              <nav className="rutina-builder__day-rail" aria-label="Días de la semana">
                {semanaActiva.dias.map((dia, diaIndex) => {
                  const isActive = dia.localId === selectedDia?.localId;
                  const isToday =
                    alumnaToday?.numeroSemana === semanaActiva.numeroSemana &&
                    alumnaToday.dayIndex === diaIndex;
                  const exerciseCount = dia.drafts.filter((draft) =>
                    draft.ejercicioId,
                  ).length;
                  return (
                    <button
                      key={dia.localId}
                      type="button"
                      className={
                        isActive
                          ? "rutina-builder__day-rail-item is-active"
                          : "rutina-builder__day-rail-item"
                      }
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => setSelectedDiaId(dia.localId)}
                    >
                      <span className="rutina-builder__day-rail-index">
                        Día {diaIndex + 1}
                        {isToday ? (
                          <span className="rutina-builder__day-rail-today">Hoy</span>
                        ) : null}
                      </span>
                      <span className="rutina-builder__day-rail-name">
                        {dia.nombreDia.trim() || "Sin nombre"}
                      </span>
                      <span className="rutina-builder__day-rail-meta">
                        {exerciseCount}{" "}
                        {exerciseCount === 1 ? "ejercicio" : "ejercicios"}
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="rutina-builder__day-rail-add"
                  onClick={() => addDia(semanaActiva.numeroSemana)}
                  disabled={
                    loadingEjercicios ||
                    ejercicios.length === 0 ||
                    !canAddDiaToActiveWeek
                  }
                >
                  + Agregar día
                </button>
              </nav>

              <div className="rutina-builder__semana-panel">
                {renderWeekMediaFields(semanaActiva.numeroSemana)}
                {selectedDia
                  ? renderDiaCard(selectedDia, selectedDiaIndex)
                  : (
                    <p className="rutina-builder__plan-hint">
                      Seleccioná un día para editar los ejercicios.
                    </p>
                  )}
              </div>
            </div>
          ) : null}

          {semanaActiva && !isAlumnaMode ? (
            <div
              className="rutina-builder__semana-panel"
              id={`rutina-semana-${semanaActiva.numeroSemana}`}
            >
              {renderWeekMediaFields(semanaActiva.numeroSemana)}
              <div className="rutina-builder__semana-actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => addDia(semanaActiva.numeroSemana)}
                  disabled={
                    loadingEjercicios ||
                    ejercicios.length === 0 ||
                    !canAddDiaToActiveWeek
                  }
                >
                  Agregar día
                </Button>
              </div>

              <div className="rutina-builder__dias-grid">
                {semanaActiva.dias.map((dia, diaIndex) =>
                  renderDiaCard(dia, diaIndex),
                )}
              </div>
            </div>
          ) : null}
        </div>

        {!isAlumnaMode ? (
          <PlanContentPreviewLab
            rutina={previewRutina}
            planContentDraft={planContentDraft}
            selectedDayNumber={planContent.selectedDayNumber}
            hasUnsavedTemplate={templateHasUnsavedChanges}
            totalDays={totalDiasPlan}
            showIncompleteWeeksHint={canSaveTemplate && !semanasValid}
          />
        ) : null}

        {isTemplateMode ? (
          <div className="rutina-builder__save-bar">
            <div className="rutina-builder__save-bar-status">
              {templateHasUnsavedChanges ? (
                <p className="rutina-builder__save-bar-pending" role="status">
                  <span className="rutina-builder__save-bar-dot" aria-hidden="true" />
                  Cambios sin guardar
                </p>
              ) : (
                <p className="rutina-builder__save-bar-synced" role="status">
                  Plantilla sincronizada
                </p>
              )}
              {saveError ? <p className="auth-error">{saveError}</p> : null}
              {successMessage ? <p className="auth-hint">{successMessage}</p> : null}
              {templateSaveBlockedReason ? (
                <p className="rutina-builder__save-bar-hint" role="status">
                  {templateSaveBlockedReason}
                </p>
              ) : null}
              {canSaveTemplate && !semanasValid ? (
                <p className="rutina-builder__save-bar-hint">
                  Podés guardar sin completar todos los ejercicios; las semanas
                  incompletas no se sobrescriben.
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              disabled={!canSaveTemplate || saving}
              onClick={() => void handleSaveTemplate()}
            >
              {saving ? "Guardando plantilla..." : "Guardar plantilla"}
            </Button>
          </div>
        ) : null}

        {isAlumnaMode ? (
          <div className="rutina-builder__save-bar">
            <div className="rutina-builder__save-bar-status">
              {alumnaHasUnsavedChanges ? (
                <p className="rutina-builder__save-bar-pending" role="status">
                  <span className="rutina-builder__save-bar-dot" aria-hidden="true" />
                  Cambios sin guardar
                </p>
              ) : (
                <p className="rutina-builder__save-bar-synced" role="status">
                  Rutina sincronizada
                </p>
              )}
              {saveError ? <p className="auth-error">{saveError}</p> : null}
              {successMessage ? <p className="auth-hint">{successMessage}</p> : null}
              {alumnaSaveBlockedReason ? (
                <p className="rutina-builder__save-bar-hint" role="status">
                  {alumnaSaveBlockedReason}
                </p>
              ) : null}
              {existingRutinaId && !semanasValid ? (
                <p className="rutina-builder__save-bar-hint">
                  Podés actualizar aunque no hayas completado todas las semanas;
                  las incompletas conservan su versión guardada.
                </p>
              ) : null}
            </div>
            <Button type="submit" disabled={saving || !canSaveAlumnaRutina}>
              {saving
                ? existingRutinaId
                  ? "Actualizando rutina..."
                  : "Guardando rutina..."
                : existingRutinaId
                  ? "Actualizar rutina"
                  : "Guardar rutina"}
            </Button>
          </div>
        ) : null}
      </form>
      ) : null}
    </section>
  );
}
