"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clock3,
  Droplets,
  Drumstick,
  Flame,
  Scale,
  Sparkles,
  Target,
  UtensilsCrossed,
  Wheat,
} from "lucide-react";
import { Button, Input } from "@/components";
import { useAppDialog } from "@/components/AppDialogProvider";
import { useAlimentacionPlan } from "@/features/profe/context/AlimentacionPlanProvider";
import {
  AlimentacionStepFooter,
  AlimentacionStepHeader,
} from "@/features/profe/components/alimentacion-plan/AlimentacionStepChrome";
import { useAlimentacionStepSave } from "@/features/profe/hooks/useAlimentacionStepSave";
import {
  buildEmptyWeek,
  defaultWeekDayNames,
  macrosFromPorcentaje,
  planDiasTienenEstructura,
  syncDiasConEstructura,
} from "@/features/profe/lib/plan-macros";
import { profeAlumnaAlimentacionStepRoute } from "@/routes/paths";
import type { EstructuraComida } from "@/features/alumna/types/plan-nutricional";
import { apiFetch } from "@/lib/api";
import type { EvaluacionNutricionalApiDoc } from "@/features/alumna/types/evaluacion-nutricional";
import { buildDefaultEstructura } from "@/features/profe/lib/plan-macros";

const MACRO_FIELDS = [
  { key: "kcal", label: "Kcal", tone: "kcal", icon: Flame },
  { key: "proteinaG", label: "Proteína (g)", tone: "proteina", icon: Drumstick },
  { key: "carbohidratosG", label: "Carbos (g)", tone: "carbohidratos", icon: Wheat },
  { key: "grasasG", label: "Grasas (g)", tone: "grasas", icon: Droplets },
] as const;

export function AlimentacionObjetivosStep() {
  const {
    alumnaId,
    macrosObjetivo,
    setMacrosObjetivo,
    estructuraComidas,
    setEstructuraComidas,
    dias,
    setDias,
    macrosSugeridos,
    saveDraft,
    saving,
    error,
  } = useAlimentacionPlan();
  const { handleStepLinkClick } = useAlimentacionStepSave();
  const router = useRouter();
  const dialog = useAppDialog();
  const [cantidadComidas, setCantidadComidas] = useState(4);
  const [continueBlocked, setContinueBlocked] = useState(false);
  const [continuing, setContinuing] = useState(false);

  useEffect(() => {
    void apiFetch<EvaluacionNutricionalApiDoc[]>(
      `/api/evaluacion-nutricional?alumnaId=${encodeURIComponent(alumnaId)}`,
    ).then((items) => {
      const ev = items[0];
      if (ev?.cantidadComidas) setCantidadComidas(ev.cantidadComidas);
      if (!estructuraComidas.length && ev) {
        setEstructuraComidas(buildDefaultEstructura(ev.cantidadComidas));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alumnaId]);

  function updateEstructura(index: number, patch: Partial<EstructuraComida>) {
    setEstructuraComidas(
      estructuraComidas.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    );
  }

  function rebalancePorcentajes() {
    const n = estructuraComidas.length;
    if (n === 0) return;
    const each = Math.floor(100 / n);
    const rest = 100 - each * n;
    setEstructuraComidas(
      estructuraComidas.map((item, index) => ({
        ...item,
        porcentajeKcal: each + (index === 0 ? rest : 0),
      })),
    );
  }

  const totalPct = estructuraComidas.reduce((s, c) => s + c.porcentajeKcal, 0);
  const pctOk = totalPct === 100;

  async function handleContinue(): Promise<boolean> {
    if (totalPct !== 100) {
      setContinueBlocked(true);
      return false;
    }
    setContinueBlocked(false);

    const week = defaultWeekDayNames();
    const comidasEnSemana = dias[0]?.comidas.length ?? 0;
    const semanaArmada = planDiasTienenEstructura(dias);
    const cambioCantidadComidas =
      semanaArmada && comidasEnSemana !== estructuraComidas.length;

    let nextDias = dias;
    if (!semanaArmada) {
      nextDias = buildEmptyWeek(week, estructuraComidas, macrosObjetivo);
    } else if (cambioCantidadComidas) {
      const confirmed = await dialog.confirm({
        title: "Rearmar semana",
        message:
          "Cambiaste la cantidad de comidas del día. Se va a rearmar la semana con slots vacíos y se perderá el contenido actual de las comidas. ¿Continuar?",
        tone: "warning",
        confirmLabel: "Continuar",
      });
      if (!confirmed) return false;
      nextDias = buildEmptyWeek(week, estructuraComidas, macrosObjetivo);
    } else {
      nextDias = syncDiasConEstructura(dias, estructuraComidas, macrosObjetivo);
    }

    const saved = await saveDraft({ dias: nextDias, estructuraComidas, macrosObjetivo });
    if (!saved) return false;
    return true;
  }

  async function handleContinueToComidas() {
    if (continuing || saving) return;
    setContinuing(true);
    try {
      const ok = await handleContinue();
      if (ok) router.push(comidasHref);
    } finally {
      setContinuing(false);
    }
  }

  const perfilHref = profeAlumnaAlimentacionStepRoute(alumnaId, "perfil");
  const comidasHref = profeAlumnaAlimentacionStepRoute(alumnaId, "comidas");

  const kcalProteina = macrosObjetivo.proteinaG * 4;
  const kcalCarbos = macrosObjetivo.carbohidratosG * 4;
  const kcalGrasas = macrosObjetivo.grasasG * 9;
  const kcalMacrosTotal = kcalProteina + kcalCarbos + kcalGrasas;
  const share = (value: number) =>
    kcalMacrosTotal > 0 ? Math.round((value / kcalMacrosTotal) * 100) : 0;

  return (
    <div className="alimentacion-plan-step">
      <section className="ap-card">
        <AlimentacionStepHeader
          icon={<Target size={20} />}
          title="Objetivos diarios"
          description="Gramos exactos por día. Son la meta que va a seguir cada comida."
          aside={
            macrosSugeridos ? (
              <Button
                type="button"
                variant="ghost"
                className="ap-btn-sm"
                onClick={() => setMacrosObjetivo(macrosSugeridos)}
              >
                <Sparkles size={15} aria-hidden="true" />
                Usar sugeridos por IA
              </Button>
            ) : null
          }
        />

        <div className="plan-nutricional-macros ap-macro-grid">
          {MACRO_FIELDS.map(({ key, label, tone, icon: Icon }) => (
            <div key={key} className={`ap-macro-tile ap-macro-tile--${tone}`}>
              <span className="ap-macro-tile__icon" aria-hidden="true">
                <Icon size={18} />
              </span>
              <Input
                label={label}
                name={`macro-${key}`}
                type="number"
                value={macrosObjetivo[key]}
                onChange={(event) =>
                  setMacrosObjetivo({
                    ...macrosObjetivo,
                    [key]: Number(event.target.value) || 0,
                  })
                }
              />
            </div>
          ))}
        </div>

        {kcalMacrosTotal > 0 ? (
          <div className="ap-split">
            <div
              className="alimentacion-macros__split"
              role="img"
              aria-label={`Reparto calórico: proteína ${share(kcalProteina)}%, carbohidratos ${share(kcalCarbos)}%, grasas ${share(kcalGrasas)}%`}
            >
              <span
                className="alimentacion-macros__split-segment alimentacion-macros__split-segment--proteina"
                style={{ width: `${share(kcalProteina)}%` }}
              />
              <span
                className="alimentacion-macros__split-segment alimentacion-macros__split-segment--carbohidratos"
                style={{ width: `${share(kcalCarbos)}%` }}
              />
              <span
                className="alimentacion-macros__split-segment alimentacion-macros__split-segment--grasas"
                style={{ width: `${share(kcalGrasas)}%` }}
              />
            </div>
            <ul className="ap-split__legend">
              <li className="ap-split__legend-item ap-split__legend-item--proteina">
                Proteína <strong>{share(kcalProteina)}%</strong>
              </li>
              <li className="ap-split__legend-item ap-split__legend-item--carbohidratos">
                Carbohidratos <strong>{share(kcalCarbos)}%</strong>
              </li>
              <li className="ap-split__legend-item ap-split__legend-item--grasas">
                Grasas <strong>{share(kcalGrasas)}%</strong>
              </li>
              <li className="ap-split__legend-total">
                <Scale size={14} aria-hidden="true" />
                Los macros suman <strong>{kcalMacrosTotal} kcal</strong>
              </li>
            </ul>
          </div>
        ) : null}
      </section>

      <section className="ap-card">
        <AlimentacionStepHeader
          icon={<UtensilsCrossed size={20} />}
          title="Estructura del día"
          description={`Repartí las kcal entre las ${estructuraComidas.length || cantidadComidas} comidas del día.`}
          aside={
            <div className="ap-header-actions">
              <span
                className={`ap-badge ${pctOk ? "ap-badge--success" : "ap-badge--danger"}`}
                role="status"
              >
                Total {totalPct}%
              </span>
              <Button
                type="button"
                variant="ghost"
                className="ap-btn-sm"
                onClick={rebalancePorcentajes}
              >
                Repartir automáticamente
              </Button>
            </div>
          }
        />

        {(!pctOk || continueBlocked) && estructuraComidas.length > 0 ? (
          <p className="ap-inline-note ap-inline-note--warning" role="status">
            El reparto suma {totalPct}% y debería sumar 100% para continuar.
          </p>
        ) : null}

        <ol className="ap-slots">
          {estructuraComidas.map((slot, index) => {
            const meta = macrosFromPorcentaje(macrosObjetivo, slot.porcentajeKcal);
            return (
              <li
                key={`${slot.nombre}-${index}`}
                className="alimentacion-estructura-row"
              >
                <span className="alimentacion-estructura-row__index" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="alimentacion-estructura-row__fields">
                  <Input
                    label="Comida"
                    name={`estructura-nombre-${index}`}
                    value={slot.nombre}
                    onChange={(e) => updateEstructura(index, { nombre: e.target.value })}
                  />
                  <Input
                    label="Horario"
                    name={`estructura-horario-${index}`}
                    value={slot.horario ?? ""}
                    placeholder="08:00"
                    onChange={(e) => updateEstructura(index, { horario: e.target.value })}
                  />
                  <Input
                    label="% kcal"
                    name={`estructura-pct-${index}`}
                    type="number"
                    min={0}
                    max={100}
                    value={slot.porcentajeKcal}
                    onChange={(e) =>
                      updateEstructura(index, {
                        porcentajeKcal: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <ul className="alimentacion-estructura-row__meta" aria-label="Meta de la comida">
                  <li className="ap-chip ap-chip--kcal">
                    <Flame size={13} aria-hidden="true" />
                    {meta.kcal} kcal
                  </li>
                  <li className="ap-chip ap-chip--proteina">P {meta.proteinaG} g</li>
                  <li className="ap-chip ap-chip--carbohidratos">
                    C {meta.carbohidratosG} g
                  </li>
                  <li className="ap-chip ap-chip--grasas">G {meta.grasasG} g</li>
                  {slot.horario ? (
                    <li className="ap-chip ap-chip--muted">
                      <Clock3 size={13} aria-hidden="true" />
                      {slot.horario}
                    </li>
                  ) : null}
                </ul>
              </li>
            );
          })}
        </ol>
      </section>

      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}

      <AlimentacionStepFooter
        backHref={perfilHref}
        onBackClick={handleStepLinkClick(perfilHref)}
        hint="Vas a armar la semana con esta estructura."
      >
        <button
          type="button"
          className="btn btn--primary ap-footer__cta"
          disabled={continuing || saving}
          onClick={() => void handleContinueToComidas()}
        >
          <span>Continuar a comidas</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </AlimentacionStepFooter>
    </div>
  );
}
