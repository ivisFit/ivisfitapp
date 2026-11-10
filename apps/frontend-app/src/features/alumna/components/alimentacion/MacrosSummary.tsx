"use client";

import { Activity, Droplets, Drumstick, Flame, Percent, Scale, Wheat } from "lucide-react";
import { InfoTooltip } from "@/components";
import { useComposicionResumen } from "@/features/alumna/hooks/useComposicionResumen";
import type { PlanNutricionalApiDoc } from "@/features/alumna/types/plan-nutricional";

type Macros = PlanNutricionalApiDoc["macrosObjetivo"];

const KCAL_POR_GRAMO = { proteina: 4, carbohidratos: 4, grasas: 9 } as const;

export function MacrosSummary({ macros }: { macros: Macros }) {
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
      tooltip: "Proteínas por día: ayudan a conservar y construir músculo.",
      tooltipLabel: "Qué es la proteína",
    },
    {
      key: "carbohidratos",
      label: "Carbohidratos",
      gramos: macros.carbohidratosG,
      kcal: macros.carbohidratosG * KCAL_POR_GRAMO.carbohidratos,
      icon: Wheat,
      tooltip: "Carbohidratos por día: tu principal fuente de energía para entrenar.",
      tooltipLabel: "Qué son los carbohidratos",
    },
    {
      key: "grasas",
      label: "Grasas",
      gramos: macros.grasasG,
      kcal: macros.grasasG * KCAL_POR_GRAMO.grasas,
      icon: Droplets,
      tooltip:
        "Grasas saludables por día: importantes para tus hormonas y tu salud en general.",
      tooltipLabel: "Qué son las grasas",
    },
  ];

  return (
    <section className="alimentacion-macros" aria-labelledby="alimentacion-macros-title">
      <div className="alimentacion-section-heading">
        <h2 id="alimentacion-macros-title">Tu objetivo diario</h2>
        <p>Distribución de energía y macronutrientes de tu plan.</p>
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
            Energía total por día
            <InfoTooltip
              text="Energía diaria total de tu plan, calculada según tu objetivo y tu actividad."
              label="Qué son las calorías"
            />
          </span>
        </div>

        <ul className="alimentacion-macros__list">
          {items.map((item) => {
            const porcentaje =
              kcalMacros > 0 ? Math.round((item.kcal / kcalMacros) * 100) : 0;
            const Icon = item.icon;
            return (
              <li key={item.key} className={`alimentacion-macro alimentacion-macro--${item.key}`}>
                <span className="alimentacion-macro__icon" aria-hidden>
                  <Icon size={18} />
                </span>
                <span className="alimentacion-macro__body">
                  <span className="alimentacion-macro__label">
                    {item.label}
                    <InfoTooltip text={item.tooltip} label={item.tooltipLabel} />
                  </span>
                  <strong className="alimentacion-macro__value">{item.gramos} g</strong>
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

export function ComposicionResumenAlumna() {
  const { composicion, loading } = useComposicionResumen();

  if (loading || !composicion) return null;

  const stats = [
    composicion.pesoKg
      ? { icon: Scale, label: "Peso", value: `${composicion.pesoKg} kg` }
      : null,
    composicion.imc ? { icon: Activity, label: "IMC", value: String(composicion.imc) } : null,
    composicion.porcentajeGrasaCorporal != null
      ? {
          icon: Percent,
          label: "% graso",
          value: `${composicion.porcentajeGrasaCorporal}%`,
        }
      : null,
  ].filter((stat): stat is NonNullable<typeof stat> => Boolean(stat));

  if (stats.length === 0) return null;

  return (
    <ul className="alimentacion-composicion" aria-label="Tu composición corporal">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <li key={stat.label}>
            <Icon size={15} aria-hidden />
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </li>
        );
      })}
    </ul>
  );
}
