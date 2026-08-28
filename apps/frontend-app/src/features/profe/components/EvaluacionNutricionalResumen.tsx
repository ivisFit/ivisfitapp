"use client";

import { useEffect, useState } from "react";
import { Drumstick, Droplets, Flame, Wheat } from "lucide-react";
import { InfoTooltip } from "@/components";
import { FormSkeleton } from "@/components/skeletons/AppSkeleton";
import { apiFetch } from "@/lib/api";
import type { EvaluacionNutricionalApiDoc } from "@/features/alumna/types/evaluacion-nutricional";
import type {
  EvaluacionBriefingResponse,
  MacrosObjetivo,
} from "@/features/alumna/types/plan-nutricional";
import { ComposicionCorporalCard } from "@/features/profe/components/ComposicionCorporalCard";
import {
  formatEvaluacionResumenGroups,
  getEvaluacionAlertas,
  getObjetivoLabel,
  type EvaluacionResumenField,
} from "@/features/profe/lib/nutricion-labels";

type EvaluacionNutricionalResumenProps = {
  alumnaId: string;
  onBriefingLoaded?: (briefing: EvaluacionBriefingResponse) => void;
};

const KCAL_POR_GRAMO = { proteina: 4, carbohidratos: 4, grasas: 9 } as const;

const CHIP_FIELD_LABELS = new Set([
  "Preferencias",
  "Restricciones",
  "Alergias",
  "Alimentos favoritos",
  "Alimentos evitados",
  "Horarios disponibles",
]);

const EMPTY_FIELD_VALUES = new Set([
  "Ninguna",
  "Ninguno",
  "Sin datos",
  "Sin dato",
]);

function isEmptyFieldValue(value: string) {
  return EMPTY_FIELD_VALUES.has(value) || /^(ninguna|ninguno)$/i.test(value.trim());
}

function MacrosSugeridosKpi({ macros }: { macros: MacrosObjetivo }) {
  const kcalMacros =
    macros.proteinaG * KCAL_POR_GRAMO.proteina +
    macros.carbohidratosG * KCAL_POR_GRAMO.carbohidratos +
    macros.grasasG * KCAL_POR_GRAMO.grasas;

  const items = [
    {
      key: "proteina",
      label: "Proteína",
      gramos: macros.proteinaG,
      kcal: macros.proteinaG * KCAL_POR_GRAMO.proteina,
      icon: Drumstick,
    },
    {
      key: "carbohidratos",
      label: "Carbohidratos",
      gramos: macros.carbohidratosG,
      kcal: macros.carbohidratosG * KCAL_POR_GRAMO.carbohidratos,
      icon: Wheat,
    },
    {
      key: "grasas",
      label: "Grasas",
      gramos: macros.grasasG,
      kcal: macros.grasasG * KCAL_POR_GRAMO.grasas,
      icon: Droplets,
    },
  ];

  return (
    <section
      className="alimentacion-macros evaluacion-nutricional-resumen__kpis"
      aria-labelledby="evaluacion-macros-title"
    >
      <div className="alimentacion-section-heading">
        <h2 id="evaluacion-macros-title">Macros sugeridos</h2>
        <p>Punto de partida para armar el plan de un día tipo.</p>
      </div>

      <div className="alimentacion-macros__grid">
        <div className="alimentacion-macros__kcal">
          <span className="alimentacion-macros__kcal-icon" aria-hidden>
            <Flame size={22} />
          </span>
          <span className="alimentacion-macros__kcal-value">
            {macros.kcal}
            <small>kcal</small>
          </span>
          <span className="alimentacion-macros__kcal-label">
            Energía diaria sugerida
            <InfoTooltip text="P: proteínas · C: carbohidratos · G: grasas. Macros sugeridos para un día tipo de la alumna." />
          </span>
        </div>

        <ul className="alimentacion-macros__list">
          {items.map((item) => {
            const porcentaje =
              kcalMacros > 0 ? Math.round((item.kcal / kcalMacros) * 100) : 0;
            const Icon = item.icon;
            return (
              <li
                key={item.key}
                className={`alimentacion-macro alimentacion-macro--${item.key}`}
              >
                <span className="alimentacion-macro__icon" aria-hidden>
                  <Icon size={18} />
                </span>
                <span className="alimentacion-macro__body">
                  <span className="alimentacion-macro__label">{item.label}</span>
                  <strong className="alimentacion-macro__value">
                    {item.gramos} g
                  </strong>
                </span>
                <span className="alimentacion-macro__share">{porcentaje}%</span>
              </li>
            );
          })}
        </ul>
      </div>

      {kcalMacros > 0 ? (
        <div
          className="alimentacion-macros__split"
          role="img"
          aria-label={`Distribución de calorías: ${Math.round((macros.proteinaG * KCAL_POR_GRAMO.proteina * 100) / kcalMacros)}% proteína, ${Math.round((macros.carbohidratosG * KCAL_POR_GRAMO.carbohidratos * 100) / kcalMacros)}% carbohidratos, ${Math.round((macros.grasasG * KCAL_POR_GRAMO.grasas * 100) / kcalMacros)}% grasas`}
        >
          {items.map((item) => (
            <span
              key={item.key}
              className={`alimentacion-macros__split-segment alimentacion-macros__split-segment--${item.key}`}
              style={{ width: `${(item.kcal / kcalMacros) * 100}%` }}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function GroupField({ field }: { field: EvaluacionResumenField }) {
  const asChips = CHIP_FIELD_LABELS.has(field.label);
  const empty = isEmptyFieldValue(field.value);
  const chips = empty
    ? []
    : field.value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  return (
    <div
      className={`evaluacion-nutricional-resumen__fact${asChips ? " evaluacion-nutricional-resumen__fact--wide" : ""}`}
    >
      <dt>{field.label}</dt>
      <dd>
        {asChips && chips.length > 0 ? (
          <ul className="evaluacion-nutricional-resumen__chips">
            {chips.map((chip) => (
              <li key={`${field.label}-${chip}`}>{chip}</li>
            ))}
          </ul>
        ) : (
          <span
            className={
              empty ? "evaluacion-nutricional-resumen__muted" : undefined
            }
          >
            {field.value}
          </span>
        )}
      </dd>
    </div>
  );
}

export function EvaluacionNutricionalResumen({
  alumnaId,
  onBriefingLoaded,
}: EvaluacionNutricionalResumenProps) {
  const [evaluacion, setEvaluacion] = useState<EvaluacionNutricionalApiDoc | null>(
    null,
  );
  const [briefing, setBriefing] = useState<EvaluacionBriefingResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [evaluaciones, briefingData] = await Promise.all([
          apiFetch<EvaluacionNutricionalApiDoc[]>(
            `/api/evaluacion-nutricional?alumnaId=${encodeURIComponent(alumnaId)}`,
            { signal: controller.signal },
          ),
          apiFetch<EvaluacionBriefingResponse>(
            `/api/plan-nutricional/briefing?alumnaId=${encodeURIComponent(alumnaId)}`,
            { signal: controller.signal },
          ),
        ]);

        setEvaluacion(evaluaciones[0] ?? null);
        setBriefing(briefingData);
        onBriefingLoaded?.(briefingData);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar la evaluación",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [alumnaId]);

  if (loading) {
    return (
      <div className="sk sk--card-elevated" aria-busy="true" aria-label="Cargando evaluación">
        <FormSkeleton fields={2} />
      </div>
    );
  }

  if (error) {
    return <p className="auth-error">{error}</p>;
  }

  if (!evaluacion) {
    return (
      <div className="evaluacion-nutricional-resumen evaluacion-nutricional-resumen--empty">
        <p>La alumna aún no completó la evaluación nutricional.</p>
      </div>
    );
  }

  const groups = formatEvaluacionResumenGroups(evaluacion);
  const alertas = getEvaluacionAlertas(evaluacion);
  const objetivo = getObjetivoLabel(evaluacion);
  const briefingLines = briefing?.briefing
    ? briefing.briefing
        .split(/\r?\n/)
        .map((line) => line.replace(/^[-*•]\s*/, "").trim())
        .filter(Boolean)
    : [];
  const macros = briefing?.macrosSugeridos;
  const summaryMeta = [
    objetivo,
    alertas[0],
    macros
      ? `${macros.kcal} kcal · P ${macros.proteinaG}g · C ${macros.carbohidratosG}g · G ${macros.grasasG}g`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <details className="evaluacion-nutricional-resumen">
      <summary className="evaluacion-nutricional-resumen__summary">
        <span>
          <strong>Evaluación nutricional</strong>
          <small>{summaryMeta}</small>
        </span>
      </summary>

      <div className="evaluacion-nutricional-resumen__body">
        {alertas.length > 0 ? (
          <ul className="evaluacion-nutricional-resumen__alertas">
            {alertas.map((alerta) => (
              <li key={alerta}>{alerta}</li>
            ))}
          </ul>
        ) : null}

        {macros ? <MacrosSugeridosKpi macros={macros} /> : null}

        <div className="evaluacion-nutricional-resumen__main">
          {briefing ? (
            <section className="evaluacion-nutricional-resumen__briefing">
              <div className="evaluacion-nutricional-resumen__briefing-heading">
                <h3>Resumen IA para la profe</h3>
                <InfoTooltip text="Análisis automático de la evaluación de la alumna: datos a considerar, sugerencias y macros recomendados como punto de partida para armar el plan." />
              </div>
              {briefingLines.length > 1 ? (
                <ul className="evaluacion-nutricional-resumen__briefing-list">
                  {briefingLines.map((line, index) => (
                    <li key={`${index}-${line.slice(0, 24)}`}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="evaluacion-nutricional-resumen__briefing-text">
                  {briefing.briefing}
                </p>
              )}
            </section>
          ) : null}

          <ComposicionCorporalCard
            alumnaId={alumnaId}
            composicion={briefing?.composicionCorporal}
          />
        </div>

        <div className="evaluacion-nutricional-resumen__groups">
          {groups.map((group) => (
            <section
              className="evaluacion-nutricional-resumen__group"
              key={group.title}
            >
              <h3>{group.title}</h3>
              <dl
                className={`evaluacion-nutricional-resumen__facts${
                  group.title === "Perfil"
                    ? " evaluacion-nutricional-resumen__facts--perfil"
                    : ""
                }`}
              >
                {group.fields.map((field) => (
                  <GroupField key={field.label} field={field} />
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>
    </details>
  );
}
