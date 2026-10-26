"use client";
import { FeedbackModal } from "@/components/FeedbackModal";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  Copy,
  Cookie,
  Croissant,
  LoaderCircle,
  MoonStar,
  Salad,
  Save,
  Sparkles,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";
import { Button, Input } from "@/components";
import { useAppDialog } from "@/components/AppDialogProvider";
import {
  AlimentacionStepFooter,
  AlimentacionStepHeader,
} from "@/features/profe/components/alimentacion-plan/AlimentacionStepChrome";
import { useAlimentacionPlan } from "@/features/profe/context/AlimentacionPlanProvider";
import { PlanNutricionalComidaCard } from "@/features/profe/components/PlanNutricionalComidaCard";
import { CopiarComidaADiasModal } from "@/features/profe/components/alimentacion-plan/CopiarComidaADiasModal";
import { GenerarSemanaIaChatDialog } from "@/features/profe/components/alimentacion-plan/GenerarSemanaIaChatDialog";
import { IaAplicacionModal } from "@/features/profe/components/alimentacion-plan/IaAplicacionModal";
import { MacrosProgressBar } from "@/features/profe/components/MacrosProgressBar";
import { AlimentacionOrigenGate } from "@/features/profe/components/alimentacion-plan/AlimentacionOrigenGate";
import { ComidaDiaSortableBlock } from "@/features/profe/components/alimentacion-plan/ComidaDiaSortableBlock";
import { ComidasDiaSortableList } from "@/features/profe/components/alimentacion-plan/ComidasDiaSortableList";
import { arrayMove } from "@dnd-kit/sortable";
import { useAlimentacionStepSave } from "@/features/profe/hooks/useAlimentacionStepSave";
import {
  applyMacrosComidaToComida,
  cloneComidaPlan,
  cloneDiaPlanComidas,
  comidaPlanTieneContenido,
  createComidaParaDia,
  defaultMealName,
  diaPlanTieneContenido,
  diasDesincronizadosConEstructura,
  diasPermitenSyncConEstructura,
  planDiasTienenContenido,
  planDiasTienenEstructura,
  syncDiasConEstructura,
  sumComidaMacros,
  sumDiaMacros,
} from "@/features/profe/lib/plan-macros";
import { profeAlumnaAlimentacionStepRoute } from "@/routes/paths";
import type {
  ComidaPlan,
  DiaPlanNutricional,
  IngredientePlan,
} from "@/features/alumna/types/plan-nutricional";
import { calcularMacrosPorCantidad, type Alimento } from "@/features/profe/types/alimento";
import { generarBorradorSemana, generarComidaIa } from "@/features/profe/hooks/useNutricionIaJobs";
import {
  diffIngredientesSugerencia,
  quitarSugerencia,
  type SugerenciaIngrediente,
} from "@/features/profe/lib/sugerencia-ingredientes";
import { apiFetch } from "@/lib/api";

function createEmptyIngrediente(): IngredientePlan {
  return { nombre: "", cantidad: 100, unidad: "g" };
}

function getMealIcon(nombre: string): ReactNode {
  const value = nombre.toLowerCase();
  if (value.includes("desayuno")) return <Croissant size={18} />;
  if (value.includes("almuerzo")) return <Utensils size={18} />;
  if (value.includes("merienda") || value.includes("colaci") || value.includes("snack")) {
    return <Cookie size={18} />;
  }
  if (value.includes("cena")) return <MoonStar size={18} />;
  return <Salad size={18} />;
}

function resolveComidaNombre(
  estructuraComidas: { nombre: string }[],
  comidaIndex: number,
  comida: ComidaPlan,
) {
  if (comida.nombre?.trim()) return comida.nombre.trim();
  return (
    estructuraComidas[comidaIndex]?.nombre?.trim() ||
    defaultMealName(comidaIndex)
  );
}

function resolveComidaHorario(
  estructuraComidas: { horario?: string }[],
  comidaIndex: number,
  comida: ComidaPlan,
) {
  if (comida.horario?.trim()) return comida.horario;
  return estructuraComidas[comidaIndex]?.horario ?? "";
}

const MIN_COMIDAS_POR_DIA = 1;
const MAX_COMIDAS_POR_DIA = 10;

type IaModo = "sugerir" | "alternativa" | "ajustar";

type RevisionSugerencia = {
  diaIndex: number;
  comidaIndex: number;
  items: SugerenciaIngrediente[];
};

export function AlimentacionComidasStep() {
  const {
    alumnaId,
    plan,
    dias,
    setDias,
    macrosObjetivo,
    estructuraComidas,
    isPublicado,
    saving,
    error: draftError,
    saveDraft,
    registerComidaFlush,
    flushPendingEdits,
    refetch,
  } = useAlimentacionPlan();
  const dialog = useAppDialog();

  const stepSave = useAlimentacionStepSave();
  const { handleStepLinkClick } = stepSave;

  useEffect(() => {
    if (!estructuraComidas.length || !planDiasTienenEstructura(dias)) return;
    if (!diasPermitenSyncConEstructura(dias, estructuraComidas)) return;
    if (!diasDesincronizadosConEstructura(dias, estructuraComidas)) return;

    setDias(syncDiasConEstructura(dias, estructuraComidas, macrosObjetivo));
  }, [dias, estructuraComidas, macrosObjetivo, setDias]);
  const [selectedDiaIndex, setSelectedDiaIndex] = useState(0);
  const [showGate, setShowGate] = useState(
    () => !planDiasTienenEstructura(dias),
  );
  const [generatingWeek, setGeneratingWeek] = useState(false);
  const [weekChatOpen, setWeekChatOpen] = useState(false);
  const [generatingComida, setGeneratingComida] = useState(false);
  const [iaChoice, setIaChoice] = useState<{ comidaIndex: number; modo: IaModo } | null>(
    null,
  );
  const [revision, setRevision] = useState<RevisionSugerencia | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copyModal, setCopyModal] = useState<
    { kind: "comida"; comidaIndex: number } | { kind: "dia" } | null
  >(null);

  const planId = plan?._id ?? plan?.id;
  const selectedDia = dias[selectedDiaIndex] ?? dias[0];
  const selectedDiaMacros = selectedDia ? sumDiaMacros(selectedDia) : null;
  const diasConContenido = dias.filter((dia) => sumDiaMacros(dia).kcal > 0).length;

  async function handleSaveDraft() {
    setMessage(null);
    flushPendingEdits();
    const saved = await saveDraft();
    if (saved) {
      setMessage(isPublicado ? "Cambios guardados." : "Borrador guardado.");
    }
  }

  async function openOrigenGate() {
    if (planDiasTienenContenido(dias)) {
      const confirmed = await dialog.confirm({
        title: "Nuevo origen",
        message:
          "Vas a elegir un nuevo origen para la semana. Si elegís de cero, clonar o plantilla, se reemplazará el contenido actual. ¿Continuar?",
        tone: "warning",
        confirmLabel: "Continuar",
      });
      if (!confirmed) return;
    }
    setShowGate(true);
  }

  if (showGate) {
    return (
      <AlimentacionOrigenGate
        onReady={() => {
          setShowGate(false);
        }}
      />
    );
  }

  function reorderComidasEnDia(fromIndex: number, toIndex: number) {
    setDias((current) =>
      current.map((dia, dIndex) => {
        if (dIndex !== selectedDiaIndex) return dia;
        return {
          ...dia,
          comidas: arrayMove(dia.comidas, fromIndex, toIndex),
        };
      }),
    );
    setRevision((current) => {
      if (!current || current.diaIndex !== selectedDiaIndex) return current;
      if (current.comidaIndex === fromIndex) {
        return { ...current, comidaIndex: toIndex };
      }
      if (
        fromIndex < current.comidaIndex &&
        toIndex >= current.comidaIndex
      ) {
        return { ...current, comidaIndex: current.comidaIndex - 1 };
      }
      if (
        fromIndex > current.comidaIndex &&
        toIndex <= current.comidaIndex
      ) {
        return { ...current, comidaIndex: current.comidaIndex + 1 };
      }
      return current;
    });
  }

  function insertComidaAfter(afterIndex: number) {
    setDias((current) =>
      current.map((dia, dIndex) => {
        if (dIndex !== selectedDiaIndex) return dia;
        if (dia.comidas.length >= MAX_COMIDAS_POR_DIA) return dia;
        const nueva = createComidaParaDia(macrosObjetivo, dia.comidas.length);
        const comidas = [...dia.comidas];
        comidas.splice(afterIndex + 1, 0, {
          ...nueva,
          ingredientes: nueva.ingredientes.map((ing) => ({ ...ing })),
        });
        return { ...dia, comidas };
      }),
    );
  }

  async function removeComidaEnDia(comidaIndex: number) {
    const dia = dias[selectedDiaIndex];
    const comida = dia?.comidas[comidaIndex];
    if (!comida || dia.comidas.length <= MIN_COMIDAS_POR_DIA) return;

    if (comidaPlanTieneContenido(comida)) {
      const nombre = resolveComidaNombre(estructuraComidas, comidaIndex, comida);
      const confirmed = await dialog.confirm({
        title: "Quitar comida",
        message: `«${nombre}» tiene ingredientes o notas. Si la quitás, se pierde el contenido de esta comida en ${dia.nombre}. ¿Continuar?`,
        tone: "warning",
        confirmLabel: "Quitar comida",
      });
      if (!confirmed) return;
    }

    setDias((current) =>
      current.map((d, dIndex) => {
        if (dIndex !== selectedDiaIndex) return d;
        return {
          ...d,
          comidas: d.comidas.filter((_, i) => i !== comidaIndex),
        };
      }),
    );
    setRevision((current) => {
      if (!current || current.diaIndex !== selectedDiaIndex) return null;
      if (current.comidaIndex === comidaIndex) return null;
      if (current.comidaIndex > comidaIndex) {
        return { ...current, comidaIndex: current.comidaIndex - 1 };
      }
      return current;
    });
  }

  function updateComida(
    diaIndex: number,
    comidaIndex: number,
    patch: Partial<ComidaPlan>,
  ) {
    const patchForComida =
      patch.ingredientes != null
        ? {
            ...patch,
            ingredientes: patch.ingredientes.map((ing) => ({ ...ing })),
          }
        : patch;

    setDias((current) =>
      applyMacrosComidaToDias(
        current.map((dia, dIndex) =>
          dIndex !== diaIndex
            ? dia
            : {
                ...dia,
                comidas: dia.comidas.map((comida, cIndex) =>
                  cIndex !== comidaIndex
                    ? comida
                    : applyMacrosComidaToComida({
                        ...comida,
                        ...patchForComida,
                      }),
                ),
              },
        ),
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
            const ingredientes = comida.ingredientes.map((ing, iIndex) =>
              iIndex !== ingredienteIndex ? ing : { ...ing, ...patch },
            );
            return applyMacrosComidaToComida({ ...comida, ingredientes });
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
    const macros = calcularMacrosPorCantidad(
      alimento,
      alimento.porcionReferencia.cantidad,
    );
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
        carbohidratosG:
          Math.round((ingrediente.carbohidratosG ?? 0) * factor * 10) / 10,
        grasasG: Math.round((ingrediente.grasasG ?? 0) * factor * 10) / 10,
      });
    } else {
      updateIngrediente(diaIndex, comidaIndex, ingredienteIndex, {
        cantidad: nuevaCantidad,
      });
    }
  }

  function copyComidaToDays(
    fromDia: number,
    comidaIndex: number,
    targetDiaIndexes: number[],
  ) {
    const targetSet = new Set(
      targetDiaIndexes.filter(
        (index) =>
          index !== fromDia &&
          index >= 0 &&
          Number.isInteger(index),
      ),
    );
    if (targetSet.size === 0) return;

    setDias((current) => {
      const source = current[fromDia]?.comidas[comidaIndex];
      if (!source) return current;
      return current.map((dia, index) => {
        if (!targetSet.has(index)) return dia;
        return {
          ...dia,
          comidas: dia.comidas.map((comida, cIndex) =>
            cIndex !== comidaIndex ? comida : cloneComidaPlan(source),
          ),
        };
      });
    });
  }

  async function handleConfirmCopyComida(targetDiaIndexes: number[]) {
    if (!copyModal || copyModal.kind !== "comida") return;
    const { comidaIndex } = copyModal;
    const fromDia = selectedDiaIndex;

    const destinosConContenido = targetDiaIndexes.filter((toDia) => {
      const comida = dias[toDia]?.comidas[comidaIndex];
      return comida && comidaPlanTieneContenido(comida);
    });

    if (destinosConContenido.length > 0) {
      const nombres = destinosConContenido
        .map((index) => dias[index]?.nombre ?? `Día ${index + 1}`)
        .join(", ");
      const confirmed = await dialog.confirm({
        title: "Reemplazar comidas",
        message:
          destinosConContenido.length === 1
            ? `La comida en ${nombres} ya tiene contenido. Se va a reemplazar por la copia. ¿Continuar?`
            : `Las comidas en ${nombres} ya tienen contenido. Se van a reemplazar por la copia. ¿Continuar?`,
        tone: "warning",
        confirmLabel: "Reemplazar y copiar",
      });
      if (!confirmed) return;
    }

    copyComidaToDays(fromDia, comidaIndex, targetDiaIndexes);
    setCopyModal(null);
    setMessage(
      targetDiaIndexes.length === 1
        ? "Comida copiada a 1 día."
        : `Comida copiada a ${targetDiaIndexes.length} días.`,
    );
  }

  function copyDiaToDays(fromDia: number, targetDiaIndexes: number[]) {
    const targetSet = new Set(
      targetDiaIndexes.filter(
        (index) =>
          index !== fromDia &&
          index >= 0 &&
          Number.isInteger(index),
      ),
    );
    if (targetSet.size === 0) return;

    setDias((current) => {
      const source = current[fromDia];
      if (!source) return current;
      return current.map((dia, index) => {
        if (!targetSet.has(index)) return dia;
        return {
          ...dia,
          comidas: cloneDiaPlanComidas(source),
        };
      });
    });
  }

  async function handleConfirmCopyDia(targetDiaIndexes: number[]) {
    const fromDia = selectedDiaIndex;
    const destinosConContenido = targetDiaIndexes.filter((toDia) => {
      const dia = dias[toDia];
      return dia && diaPlanTieneContenido(dia);
    });

    if (destinosConContenido.length > 0) {
      const nombres = destinosConContenido
        .map((index) => dias[index]?.nombre ?? `Día ${index + 1}`)
        .join(", ");
      const confirmed = await dialog.confirm({
        title: "Reemplazar días",
        message:
          destinosConContenido.length === 1
            ? `${nombres} ya tiene comidas cargadas. Se van a reemplazar por la copia del día entero. ¿Continuar?`
            : `${nombres} ya tienen comidas cargadas. Se van a reemplazar por la copia del día entero. ¿Continuar?`,
        tone: "warning",
        confirmLabel: "Reemplazar y copiar",
      });
      if (!confirmed) return;
    }

    copyDiaToDays(fromDia, targetDiaIndexes);
    setCopyModal(null);
    setMessage(
      targetDiaIndexes.length === 1
        ? "Día copiado a 1 día."
        : `Día copiado a ${targetDiaIndexes.length} días.`,
    );
  }

  async function copyDiaCompletoAlResto() {
    const fromDia = selectedDiaIndex;
    const origen = dias[fromDia];
    if (!origen || !diaPlanTieneContenido(origen)) {
      setMessage(null);
      setError("Este día no tiene comidas para copiar.");
      return;
    }

    const targets = dias
      .map((_, index) => index)
      .filter((index) => index !== fromDia);
    if (targets.length === 0) return;

    const hayDestinoConContenido = targets.some((index) => {
      const dia = dias[index];
      return dia && diaPlanTieneContenido(dia);
    });
    if (hayDestinoConContenido) {
      const confirmed = await dialog.confirm({
        title: "Copiar día completo",
        message: `Se van a copiar todas las comidas de ${origen.nombre} al resto de la semana. Los días que ya tienen comidas se reemplazan. ¿Continuar?`,
        tone: "warning",
        confirmLabel: "Copiar al resto",
      });
      if (!confirmed) return;
    }

    copyDiaToDays(fromDia, targets);
    setError(null);
    setMessage(`Comidas de ${origen.nombre} copiadas al resto de la semana.`);
  }

  async function saveComidaAsTemplate(comida: ComidaPlan) {
    const titulo = await dialog.prompt({
      title: "Guardar plantilla",
      inputLabel: "Nombre de la plantilla de comida",
      defaultValue: comida.nombre,
      confirmLabel: "Guardar",
    });
    if (!titulo?.trim()) return;
    await apiFetch("/api/plan-nutricional/plantillas", {
      method: "POST",
      body: JSON.stringify({
        titulo,
        macrosObjetivo: comida.macrosObjetivo ?? macrosObjetivo,
        dias: [{ nombre: "Día tipo", comidas: [comida] }],
      }),
    });
    setMessage("Comida guardada como plantilla.");
  }

  async function handleGenerateWeek(instruccion: string) {
    if (
      planDiasTienenContenido(dias) &&
      !(await dialog.confirm({
        title: "Regenerar semana",
        message: "Se regenerará la semana con IA. ¿Continuar?",
        tone: "warning",
        confirmLabel: "Continuar",
      }))
    ) {
      return;
    }
    setGeneratingWeek(true);
    setError(null);
    try {
      const trimmed = instruccion.trim();
      const data = await generarBorradorSemana({
        alumnaId,
        planId,
        diasPlantilla: dias.map((d) => ({ nombre: d.nombre })),
        estructuraComidas,
        macrosObjetivo,
        ...(trimmed ? { instruccion: trimmed } : {}),
      });
      if (data?.dias) {
        setDias(
          syncDiasConEstructura(data.dias, estructuraComidas, macrosObjetivo),
        );
      }
      setWeekChatOpen(false);
      setMessage("Semana generada con IA. Revisá cada día.");
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar");
    } finally {
      setGeneratingWeek(false);
    }
  }

  function requestGenerateComida(comidaIndex: number, modo: IaModo) {
    setIaChoice({ comidaIndex, modo });
  }

  function mapIngredientesComida(
    diaIndex: number,
    comidaIndex: number,
    map: (ingredientes: IngredientePlan[]) => IngredientePlan[],
  ) {
    setDias((current) =>
      current.map((dia, dIndex) => {
        if (dIndex !== diaIndex) return dia;
        return {
          ...dia,
          comidas: dia.comidas.map((comida, cIndex) => {
            if (cIndex !== comidaIndex) return comida;
            const ingredientes = map(comida.ingredientes);
            return applyMacrosComidaToComida({
              ...comida,
              ingredientes:
                ingredientes.length > 0 ? ingredientes : [createEmptyIngrediente()],
            });
          }),
        };
      }),
    );
  }

  function acceptSugerencia(item: SugerenciaIngrediente) {
    if (!revision) return;
    const { diaIndex, comidaIndex } = revision;
    mapIngredientesComida(diaIndex, comidaIndex, (ingredientes) => {
      if (item.kind === "add" && item.after) {
        return [...ingredientes, { ...item.after }];
      }
      if (item.currentIndex == null) return ingredientes;
      if (item.kind === "remove") {
        return ingredientes.filter((_, index) => index !== item.currentIndex);
      }
      if (!item.after) return ingredientes;
      return ingredientes.map((ingrediente, index) =>
        index === item.currentIndex ? { ...item.after! } : ingrediente,
      );
    });
    setRevision((prev) => {
      if (!prev) return null;
      const items = quitarSugerencia(prev.items, item, true);
      return items.length ? { ...prev, items } : null;
    });
  }

  function rejectSugerencia(item: SugerenciaIngrediente) {
    setRevision((prev) => {
      if (!prev) return null;
      const items = quitarSugerencia(prev.items, item, false);
      return items.length ? { ...prev, items } : null;
    });
  }

  async function runGenerateComida(alcance: "toda" | "individual") {
    if (!iaChoice || !selectedDia) return;
    const { comidaIndex, modo } = iaChoice;
    const comida = selectedDia.comidas[comidaIndex];
    if (!comida) return;

    setIaChoice(null);
    setRevision(null);
    setGeneratingComida(true);
    setError(null);
    try {
      const result = await generarComidaIa({
        alumnaId,
        planId,
        diaIndex: selectedDiaIndex,
        comidaIndex,
        modo,
        comidaActual: comida,
        proteinaObjetivoG: comida.macrosObjetivo?.proteinaG,
      });
      if (!result) return;

      const slot = estructuraComidas[comidaIndex];
      if (alcance === "toda") {
        updateComida(selectedDiaIndex, comidaIndex, {
          ...result,
          nombre: slot?.nombre ?? resolveComidaNombre(estructuraComidas, comidaIndex, comida),
          horario: slot?.horario ?? comida.horario,
          macrosObjetivo: comida.macrosObjetivo ?? result.macrosObjetivo,
        });
        return;
      }

      const items = diffIngredientesSugerencia(
        comida.ingredientes,
        result.ingredientes ?? [],
      );
      if (!items.length) {
        setMessage("La sugerencia no cambia ningún alimento.");
        return;
      }
      setMessage(null);
      setRevision({
        diaIndex: selectedDiaIndex,
        comidaIndex,
        items,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar la comida");
    } finally {
      setGeneratingComida(false);
    }
  }

  return (
    <div className="alimentacion-plan-step">
      <section className="ap-card ap-card--week">
        <AlimentacionStepHeader
          icon={<UtensilsCrossed size={20} />}
          title="Comidas de la semana"
          description="Armá cada día con gramos exactos. Los macros se calculan en vivo."
          aside={
            <div className="ap-header-actions alimentacion-plan-step__toolbar">
              <Button
                type="button"
                variant="ghost"
                className="ap-btn-sm ap-btn-ai"
                disabled={generatingWeek}
                onClick={() => {
                  setError(null);
                  setWeekChatOpen(true);
                }}
              >
                {generatingWeek ? (
                  <LoaderCircle size={15} className="ap-spin" aria-hidden="true" />
                ) : (
                  <Sparkles size={15} aria-hidden="true" />
                )}
                {generatingWeek ? "Generando semana…" : "Generar semana con IA"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="ap-btn-sm"
                disabled={saving}
                onClick={() => void handleSaveDraft()}
              >
                <Save size={15} aria-hidden="true" />
                {saving
                  ? "Guardando…"
                  : isPublicado
                    ? "Guardar cambios"
                    : "Guardar borrador"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="ap-btn-sm"
                onClick={openOrigenGate}
              >
                Cambiar origen de la semana…
              </Button>
            </div>
          }
        />

        <nav className="ap-days" aria-label="Días del plan">
          {dias.map((dia, diaIndex) => {
            const diaMacros = sumDiaMacros(dia);
            const isActive = diaIndex === selectedDiaIndex;
            const progress =
              macrosObjetivo.kcal > 0
                ? Math.min(100, Math.round((diaMacros.kcal / macrosObjetivo.kcal) * 100))
                : 0;
            return (
              <button
                key={diaIndex}
                type="button"
                className={isActive ? "ap-day-tab is-active" : "ap-day-tab"}
                aria-pressed={isActive}
                onClick={() => {
                  setRevision((current) =>
                    current && current.diaIndex !== diaIndex ? null : current,
                  );
                  setSelectedDiaIndex(diaIndex);
                }}
              >
                <span className="ap-day-tab__name">{dia.nombre}</span>
                <span className="ap-day-tab__meta">
                  {diaMacros.kcal > 0 ? `${diaMacros.kcal} kcal` : "Sin cargar"}
                </span>
                <span className="ap-day-tab__bar" aria-hidden="true">
                  <span
                    className="ap-day-tab__bar-fill"
                    style={{ width: `${progress}%` }}
                  />
                </span>
              </button>
            );
          })}
        </nav>
      </section>

      {selectedDia && selectedDiaMacros ? (
        <section className="ap-day-summary" aria-label={`Resumen de ${selectedDia.nombre}`}>
          <div className="ap-day-summary__head">
            <div className="ap-day-summary__head-main">
              <span className="ap-day-summary__icon" aria-hidden="true">
                <CalendarDays size={18} />
              </span>
              <div>
                <h3 className="ap-day-summary__title">{selectedDia.nombre}</h3>
                <p className="ap-day-summary__meta">
                  {selectedDia.comidas.length} comidas · progreso vs objetivo diario
                </p>
              </div>
            </div>
            {dias.length > 1 ? (
              <div className="ap-day-summary__actions">
                <Button
                  type="button"
                  variant="ghost"
                  className="ap-btn-sm"
                  title={`Copia todas las comidas de ${selectedDia.nombre} al resto de la semana`}
                  onClick={() => void copyDiaCompletoAlResto()}
                >
                  <Copy size={15} aria-hidden="true" />
                  Copiar día completo
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="ap-btn-sm"
                  onClick={() => setCopyModal({ kind: "dia" })}
                >
                  <Copy size={15} aria-hidden="true" />
                  Copiar día a otros días
                </Button>
              </div>
            ) : null}
          </div>
          <MacrosProgressBar objetivo={macrosObjetivo} actual={selectedDiaMacros} />
        </section>
      ) : null}

      {selectedDia ? (
        <ComidasDiaSortableList
          diaIndex={selectedDiaIndex}
          itemCount={selectedDia.comidas.length}
          onReorder={reorderComidasEnDia}
          onInsertAfter={insertComidaAfter}
          renderBlock={(comidaIndex, sortableId) => {
            const comida = selectedDia.comidas[comidaIndex];
            if (!comida) return null;
            const actual = sumComidaMacros(comida);
            const objetivo = comida.macrosObjetivo;
            const comidaNombre = resolveComidaNombre(
              estructuraComidas,
              comidaIndex,
              comida,
            );
            const nombrePlaceholder = resolveComidaNombre(
              estructuraComidas,
              comidaIndex,
              { ...comida, nombre: "" },
            );
            const horarioPlaceholder =
              estructuraComidas[comidaIndex]?.horario?.trim() || "08:00";
            const canRemoveComida = selectedDia.comidas.length > MIN_COMIDAS_POR_DIA;
            return (
              <ComidaDiaSortableBlock
                sortableId={sortableId}
                dragLabel={`Reordenar ${comidaNombre}`}
                canRemove={canRemoveComida}
                onRemove={() => void removeComidaEnDia(comidaIndex)}
                header={
                  <header className="alimentacion-comida-block__header alimentacion-comida-block__header--editable">
                    <span
                      className="alimentacion-comida-block__icon"
                      aria-hidden="true"
                    >
                      {getMealIcon(comida.nombre?.trim() || comidaNombre)}
                    </span>
                    <div className="alimentacion-comida-block__heading alimentacion-comida-block__heading--meta">
                      <Input
                        label="Comida"
                        name={`comida-nombre-${selectedDiaIndex}-${comidaIndex}`}
                        value={comida.nombre}
                        placeholder={nombrePlaceholder}
                        onChange={(e) =>
                          updateComida(selectedDiaIndex, comidaIndex, {
                            nombre: e.target.value,
                          })
                        }
                      />
                      <Input
                        label="Horario"
                        name={`comida-horario-${selectedDiaIndex}-${comidaIndex}`}
                        value={comida.horario ?? ""}
                        placeholder={horarioPlaceholder}
                        onChange={(e) =>
                          updateComida(selectedDiaIndex, comidaIndex, {
                            horario: e.target.value,
                          })
                        }
                      />
                      <p className="alimentacion-comida-block__subtitle">
                        {actual.kcal > 0
                          ? `${actual.kcal} kcal`
                          : "Sin ingredientes"}
                      </p>
                    </div>
                    {objetivo ? (
                      <span className="ap-badge ap-badge--gold">
                        Meta {objetivo.kcal} kcal
                      </span>
                    ) : null}
                  </header>
                }
              >
                {objetivo ? (
                  <MacrosProgressBar objetivo={objetivo} actual={actual} />
                ) : null}
                <div className="alimentacion-comida-block__tools">
                  <div
                    className="alimentacion-comida-block__ia"
                    role="group"
                    aria-label="Asistente IA"
                  >
                    <span className="ap-toolgroup__label">
                      <Sparkles size={14} aria-hidden="true" />
                      IA
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      className="ap-btn-sm"
                      disabled={generatingComida}
                      onClick={() => requestGenerateComida(comidaIndex, "sugerir")}
                    >
                      Sugerir
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="ap-btn-sm"
                      disabled={generatingComida}
                      onClick={() =>
                        requestGenerateComida(comidaIndex, "alternativa")
                      }
                    >
                      Alternativa
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="ap-btn-sm"
                      disabled={generatingComida}
                      onClick={() => requestGenerateComida(comidaIndex, "ajustar")}
                    >
                      Ajustar proteína
                    </Button>
                  </div>
                  <div
                    className="alimentacion-comida-block__actions"
                    role="group"
                    aria-label="Acciones de la comida"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      className="ap-btn-sm"
                      onClick={() => setCopyModal({ kind: "comida", comidaIndex })}
                    >
                      <Copy size={15} aria-hidden="true" />
                      Copiar a otros días
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="ap-btn-sm"
                      onClick={() => void saveComidaAsTemplate(comida)}
                    >
                      <Bookmark size={15} aria-hidden="true" />
                      Guardar plantilla
                    </Button>
                  </div>
                </div>
                <PlanNutricionalComidaCard
                  comida={comida}
                  diaIndex={selectedDiaIndex}
                  comidaIndex={comidaIndex}
                  canRemove={false}
                  lockMealMeta
                  registerFlush={registerComidaFlush}
                  sugerencias={
                    revision &&
                    revision.diaIndex === selectedDiaIndex &&
                    revision.comidaIndex === comidaIndex
                      ? revision.items
                      : undefined
                  }
                  onAcceptSugerencia={acceptSugerencia}
                  onRejectSugerencia={rejectSugerencia}
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
                    setDias((current) =>
                      current.map((dia, dIndex) => {
                        if (dIndex !== selectedDiaIndex) return dia;
                        return {
                          ...dia,
                          comidas: dia.comidas.map((c, cIndex) =>
                            cIndex !== comidaIndex
                              ? c
                              : {
                                  ...c,
                                  ingredientes: [
                                    ...c.ingredientes,
                                    createEmptyIngrediente(),
                                  ],
                                },
                          ),
                        };
                      }),
                    )
                  }
                  onRemoveIngrediente={(ingredienteIndex) =>
                    setDias((current) =>
                      current.map((dia, dIndex) => {
                        if (dIndex !== selectedDiaIndex) return dia;
                        return {
                          ...dia,
                          comidas: dia.comidas.map((c, cIndex) => {
                            if (
                              cIndex !== comidaIndex ||
                              c.ingredientes.length <= 1
                            ) {
                              return c;
                            }
                            return {
                              ...c,
                              ingredientes: c.ingredientes.filter(
                                (_, i) => i !== ingredienteIndex,
                              ),
                            };
                          }),
                        };
                      }),
                    )
                  }
                  onRemoveComida={() => undefined}
                />
              </ComidaDiaSortableBlock>
            );
          }}
        />
      ) : null}

      <FeedbackModal message={draftError} />
      <FeedbackModal message={weekChatOpen ? null : error} />
      <FeedbackModal message={message} tone="success" />

      <GenerarSemanaIaChatDialog
        open={weekChatOpen}
        generating={generatingWeek}
        error={error}
        onCancel={() => {
          if (generatingWeek) return;
          setWeekChatOpen(false);
        }}
        onGenerate={handleGenerateWeek}
      />

      <IaAplicacionModal
        open={iaChoice !== null}
        onCancel={() => setIaChoice(null)}
        onApplyAll={() => void runGenerateComida("toda")}
        onReviewEach={() => void runGenerateComida("individual")}
      />

      <CopiarComidaADiasModal
        open={copyModal !== null}
        dias={dias}
        fromDiaIndex={selectedDiaIndex}
        title={
          copyModal?.kind === "dia"
            ? "Copiar día a otros días"
            : "Copiar comida a otros días"
        }
        description={
          copyModal?.kind === "dia" ? (
            <>
              Se van a copiar todas las comidas de{" "}
              <strong>{selectedDia?.nombre ?? "este día"}</strong>. Elegí los
              días destino.
            </>
          ) : (
            <>
              <strong>
                {copyModal?.kind === "comida"
                  ? resolveComidaNombre(
                      estructuraComidas,
                      copyModal.comidaIndex,
                      selectedDia?.comidas[copyModal.comidaIndex] ?? {
                        nombre: "",
                        ingredientes: [],
                      },
                    )
                  : ""}
              </strong>{" "}
              desde <strong>{selectedDia?.nombre ?? "este día"}</strong>. Elegí
              los días destino.
            </>
          )
        }
        onCancel={() => setCopyModal(null)}
        onConfirm={(targetDiaIndexes) => {
          if (copyModal?.kind === "dia") {
            void handleConfirmCopyDia(targetDiaIndexes);
            return;
          }
          void handleConfirmCopyComida(targetDiaIndexes);
        }}
      />

      <AlimentacionStepFooter
        backHref={profeAlumnaAlimentacionStepRoute(alumnaId, "objetivos")}
        onBackClick={handleStepLinkClick(
          profeAlumnaAlimentacionStepRoute(alumnaId, "objetivos"),
        )}
        hint={`${diasConContenido} de ${dias.length} días con comidas cargadas`}
      >
        <button
          type="button"
          className="btn btn--primary ap-footer__cta"
          onClick={() => {
            void stepSave.navigateWithSave(
              profeAlumnaAlimentacionStepRoute(alumnaId, "revisar"),
            );
          }}
        >
          <span>Ir a revisar</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </AlimentacionStepFooter>
    </div>
  );
}

function applyMacrosComidaToDias(dias: DiaPlanNutricional[]) {
  return dias.map((dia) => ({
    ...dia,
    comidas: dia.comidas.map(applyMacrosComidaToComida),
  }));
}
