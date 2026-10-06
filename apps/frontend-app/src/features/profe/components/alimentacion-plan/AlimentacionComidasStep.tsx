"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import {
  ArrowRight,
  Bookmark,
  CalendarDays,
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
import { Button } from "@/components";
import { useAppDialog } from "@/components/AppDialogProvider";
import {
  AlimentacionStepFooter,
  AlimentacionStepHeader,
} from "@/features/profe/components/alimentacion-plan/AlimentacionStepChrome";
import { useAlimentacionPlan } from "@/features/profe/context/AlimentacionPlanProvider";
import { PlanNutricionalComidaCard } from "@/features/profe/components/PlanNutricionalComidaCard";
import { IaAplicacionModal } from "@/features/profe/components/alimentacion-plan/IaAplicacionModal";
import { MacrosProgressBar } from "@/features/profe/components/MacrosProgressBar";
import { AlimentacionOrigenGate } from "@/features/profe/components/alimentacion-plan/AlimentacionOrigenGate";
import { useAlimentacionStepSave } from "@/features/profe/hooks/useAlimentacionStepSave";
import {
  applyMacrosComidaToComida,
  defaultMealName,
  diasDesincronizadosConEstructura,
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
  return (
    estructuraComidas[comidaIndex]?.nombre?.trim() ||
    comida.nombre?.trim() ||
    defaultMealName(comidaIndex)
  );
}

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
    refetch,
  } = useAlimentacionPlan();
  const dialog = useAppDialog();

  const stepSave = useAlimentacionStepSave();
  const comidaFlushHandlersRef = useRef(new Set<() => void>());

  const registerComidaFlush = useCallback((flush: () => void) => {
    comidaFlushHandlersRef.current.add(flush);
    return () => {
      comidaFlushHandlersRef.current.delete(flush);
    };
  }, []);

  const flushAllComidaEditors = useCallback(() => {
    flushSync(() => {
      comidaFlushHandlersRef.current.forEach((flush) => flush());
    });
  }, []);

  const handleStepLinkClick = useCallback(
    (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      event.preventDefault();
      flushAllComidaEditors();
      void stepSave.navigateWithSave(href);
    },
    [flushAllComidaEditors, stepSave],
  );

  useEffect(() => {
    if (!estructuraComidas.length || !planDiasTienenEstructura(dias)) return;
    if (!diasDesincronizadosConEstructura(dias, estructuraComidas)) return;

    setDias(syncDiasConEstructura(dias, estructuraComidas, macrosObjetivo));
  }, [dias, estructuraComidas, macrosObjetivo, setDias]);
  const [selectedDiaIndex, setSelectedDiaIndex] = useState(0);
  const [showGate, setShowGate] = useState(
    () => !planDiasTienenEstructura(dias),
  );
  const [generatingWeek, setGeneratingWeek] = useState(false);
  const [generatingComida, setGeneratingComida] = useState(false);
  const [iaChoice, setIaChoice] = useState<{ comidaIndex: number; modo: IaModo } | null>(
    null,
  );
  const [revision, setRevision] = useState<RevisionSugerencia | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const planId = plan?._id ?? plan?.id;
  const selectedDia = dias[selectedDiaIndex] ?? dias[0];
  const selectedDiaMacros = selectedDia ? sumDiaMacros(selectedDia) : null;
  const diasConContenido = dias.filter((dia) => sumDiaMacros(dia).kcal > 0).length;

  async function handleSaveDraft() {
    setMessage(null);
    flushAllComidaEditors();
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

  function updateComida(
    diaIndex: number,
    comidaIndex: number,
    patch: Partial<ComidaPlan>,
  ) {
    setDias((current) =>
      applyMacrosComidaToDias(
        current.map((dia, dIndex) =>
          dIndex !== diaIndex
            ? dia
            : {
                ...dia,
                comidas: dia.comidas.map((comida, cIndex) =>
                  cIndex !== comidaIndex
                    ? { ...comida, ...patch }
                    : applyMacrosComidaToComida({ ...comida, ...patch }),
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

  function copyComidaToDay(fromDia: number, comidaIndex: number, toDia: number) {
    setDias((current) => {
      const source = current[fromDia]?.comidas[comidaIndex];
      if (!source) return current;
      return current.map((dia, index) =>
        index !== toDia
          ? dia
          : {
              ...dia,
              comidas: dia.comidas.map((comida, cIndex) =>
                cIndex !== comidaIndex
                  ? comida
                  : {
                      ...source,
                      ingredientes: source.ingredientes.map((ing) => ({ ...ing })),
                    },
              ),
            },
      );
    });
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

  async function handleGenerateWeek() {
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
      const data = await generarBorradorSemana({
        alumnaId,
        planId,
        diasPlantilla: dias.map((d) => ({ nombre: d.nombre })),
        estructuraComidas,
        macrosObjetivo,
      });
      if (data?.dias) {
        setDias(
          syncDiasConEstructura(data.dias, estructuraComidas, macrosObjetivo),
        );
      }
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
                onClick={() => void handleGenerateWeek()}
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
                key={`${dia.nombre}-${diaIndex}`}
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
          <MacrosProgressBar objetivo={macrosObjetivo} actual={selectedDiaMacros} />
        </section>
      ) : null}

      {selectedDia?.comidas.map((comida, comidaIndex) => {
        const actual = sumComidaMacros(comida);
        const objetivo = comida.macrosObjetivo;
        const comidaNombre = resolveComidaNombre(
          estructuraComidas,
          comidaIndex,
          comida,
        );
        const comidaHorario =
          estructuraComidas[comidaIndex]?.horario ?? comida.horario;
        const comidaParaEditor =
          comida.nombre === comidaNombre && comida.horario === comidaHorario
            ? comida
            : { ...comida, nombre: comidaNombre, horario: comidaHorario };
        return (
          <article
            key={`${selectedDiaIndex}-${comidaIndex}`}
            className="alimentacion-comida-block"
          >
            <header className="alimentacion-comida-block__header">
              <span className="alimentacion-comida-block__icon" aria-hidden="true">
                {getMealIcon(comidaNombre)}
              </span>
              <div className="alimentacion-comida-block__heading">
                <h4 className="alimentacion-comida-block__title">
                  {comidaNombre}
                </h4>
                <p className="alimentacion-comida-block__subtitle">
                  {comidaHorario ? `${comidaHorario} · ` : ""}
                  {actual.kcal > 0 ? `${actual.kcal} kcal` : "Sin ingredientes"}
                </p>
              </div>
              {objetivo ? (
                <span className="ap-badge ap-badge--gold">
                  Meta {objetivo.kcal} kcal
                </span>
              ) : null}
            </header>
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
                  onClick={() => requestGenerateComida(comidaIndex, "alternativa")}
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
                <select
                  className="alimentacion-comida-block__copy"
                  aria-label="Copiar comida a otro día"
                  defaultValue=""
                  onChange={(event) => {
                    const to = Number(event.target.value);
                    if (!Number.isNaN(to)) {
                      copyComidaToDay(selectedDiaIndex, comidaIndex, to);
                      event.target.value = "";
                    }
                  }}
                >
                  <option value="">Copiar a día…</option>
                  {dias.map((dia, index) =>
                    index === selectedDiaIndex ? null : (
                      <option key={dia.nombre} value={index}>
                        {dia.nombre}
                      </option>
                    ),
                  )}
                </select>
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
              comida={comidaParaEditor}
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
                        if (cIndex !== comidaIndex || c.ingredientes.length <= 1) {
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
          </article>
        );
      })}

      {draftError ? (
        <p className="auth-error" role="alert">
          {draftError}
        </p>
      ) : null}
      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="ap-inline-note ap-inline-note--success" role="status">
          {message}
        </p>
      ) : null}

      <IaAplicacionModal
        open={iaChoice !== null}
        onCancel={() => setIaChoice(null)}
        onApplyAll={() => void runGenerateComida("toda")}
        onReviewEach={() => void runGenerateComida("individual")}
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
            flushAllComidaEditors();
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
