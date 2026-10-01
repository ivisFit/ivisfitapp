"use client";

import { useState } from "react";
import {
  Activity,
  Apple,
  CalendarDays,
  ChefHat,
  CheckCheck,
  CheckCircle2,
  Clock3,
  Cookie,
  Croissant,
  Droplets,
  Drumstick,
  Flame,
  MoonStar,
  Percent,
  Quote,
  Scale,
  StickyNote,
  Utensils,
  Wheat,
  XCircle,
} from "lucide-react";
import type {
  ComidaPlan,
  DiaPlanNutricional,
  PlanNutricionalApiDoc,
} from "@/features/alumna/types/plan-nutricional";
import { useComposicionResumen } from "@/features/alumna/hooks/useComposicionResumen";
import { useCheckinsAlimentacionSemana } from "@/features/alumna/hooks/useCheckinsAlimentacionSemana";
import { InfoTooltip } from "@/components";
import { ProximaComida } from "@/features/alumna/components/alimentacion/ProximaComida";
import { ListaComprasAlumna } from "@/features/alumna/components/alimentacion/ListaComprasAlumna";
import { getDiaHoyIndex } from "@/features/alumna/lib/alimentacion-dia-hoy";

type Macros = PlanNutricionalApiDoc["macrosObjetivo"];

const KCAL_POR_GRAMO = { proteina: 4, carbohidratos: 4, grasas: 9 } as const;

function getMealIcon(nombre: string) {
  const value = nombre.toLowerCase();
  if (value.includes("desayuno")) return Croissant;
  if (value.includes("almuerzo")) return Utensils;
  if (value.includes("merienda")) return Apple;
  if (value.includes("cena")) return MoonStar;
  if (value.includes("snack") || value.includes("colación") || value.includes("colacion")) {
    return Cookie;
  }
  return Utensils;
}

function getCheckinIcon(estado?: string) {
  switch (estado) {
    case "cumpli":
      return <CheckCircle2 size={14} className="checkin-icon--cumpli" aria-hidden />;
    case "parcial":
      return <CheckCheck size={14} className="checkin-icon--parcial" aria-hidden />;
    case "no_pude":
      return <XCircle size={14} className="checkin-icon--no-pude" aria-hidden />;
    default:
      return null;
  }
}

function getCheckinLabel(estado?: string) {
  switch (estado) {
    case "cumpli":
      return "Cumplí";
    case "parcial":
      return "Parcial";
    case "no_pude":
      return "No pude";
    default:
      return null;
  }
}

function getDiaKcal(dia: DiaPlanNutricional) {
  const total = dia.comidas.reduce(
    (sum, comida) => sum + (comida.macrosComida?.kcal ?? 0),
    0,
  );
  return total > 0 ? total : null;
}

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
      tooltip:
        "Proteínas por día: ayudan a conservar y construir músculo.",
      tooltipLabel: "Qué es la proteína",
    },
    {
      key: "carbohidratos",
      label: "Carbohidratos",
      gramos: macros.carbohidratosG,
      kcal: macros.carbohidratosG * KCAL_POR_GRAMO.carbohidratos,
      icon: Wheat,
      tooltip:
        "Carbohidratos por día: tu principal fuente de energía para entrenar.",
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
    <section
      className="alimentacion-macros"
      aria-labelledby="alimentacion-macros-title"
    >
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
              <li
                key={item.key}
                className={`alimentacion-macro alimentacion-macro--${item.key}`}
              >
                <span className="alimentacion-macro__icon" aria-hidden>
                  <Icon size={18} />
                </span>
                <span className="alimentacion-macro__body">
                  <span className="alimentacion-macro__label">
                    {item.label}
                    <InfoTooltip text={item.tooltip} label={item.tooltipLabel} />
                  </span>
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

export function ComposicionResumenAlumna() {
  const { composicion, loading } = useComposicionResumen();

  if (loading || !composicion) return null;

  const stats = [
    composicion.pesoKg
      ? { icon: Scale, label: "Peso", value: `${composicion.pesoKg} kg` }
      : null,
    composicion.imc
      ? { icon: Activity, label: "IMC", value: String(composicion.imc) }
      : null,
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

function ComidaCard({ comida }: { comida: ComidaPlan }) {
  const Icon = getMealIcon(comida.nombre);

  return (
    <article className="alimentacion-comida">
      <header className="alimentacion-comida__header">
        <span className="alimentacion-comida__icon" aria-hidden>
          <Icon size={18} />
        </span>
        <div className="alimentacion-comida__title">
          <h3>{comida.nombre}</h3>
          {comida.horario ? (
            <span className="alimentacion-comida__horario">
              <Clock3 size={13} aria-hidden />
              {comida.horario}
            </span>
          ) : null}
        </div>
        {comida.macrosComida ? (
          <span className="alimentacion-comida__kcal">
            {comida.macrosComida.kcal} kcal
          </span>
        ) : null}
      </header>

      <ul className="alimentacion-comida__ingredientes">
        {comida.ingredientes.map((ingrediente, ingredienteIndex) => (
          <li key={`${ingrediente.nombre}-${ingredienteIndex}`}>
            <span className="alimentacion-comida__ingrediente-nombre">
              {ingrediente.nombre}
            </span>
            <span className="alimentacion-comida__ingrediente-cantidad">
              {ingrediente.cantidad}
              {ingrediente.unidad}
              {ingrediente.kcal !== undefined ? (
                <small>{ingrediente.kcal} kcal</small>
              ) : null}
            </span>
          </li>
        ))}
      </ul>

      {comida.preparacion ? (
        <p className="alimentacion-comida__callout alimentacion-comida__callout--prep">
          <ChefHat size={15} aria-hidden />
          <span>{comida.preparacion}</span>
        </p>
      ) : null}
      {comida.notas ? (
        <p className="alimentacion-comida__callout alimentacion-comida__callout--nota">
          <StickyNote size={15} aria-hidden />
          <span>{comida.notas}</span>
        </p>
      ) : null}
    </article>
  );
}

function PlanDias({
  dias,
  checkins,
  getDateKeyForDia,
}: {
  dias: DiaPlanNutricional[];
  checkins: Record<string, { estado: string }>;
  getDateKeyForDia: (diaIndex: number) => string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const safeIndex = Math.min(selectedIndex, dias.length - 1);
  const dia = dias[safeIndex];
  const diaKcal = dia ? getDiaKcal(dia) : null;
  const selectedDateKey = dia ? getDateKeyForDia(safeIndex) : null;
  const selectedCheckin = selectedDateKey ? checkins[selectedDateKey] : null;

  if (!dia) return null;

  return (
    <section
      className="alimentacion-plan"
      aria-labelledby="alimentacion-plan-title"
    >
      <div className="alimentacion-section-heading">
        <h2 id="alimentacion-plan-title">Tu plan día a día</h2>
        <p>
          {dias.length === 1
            ? "Un día de comidas planificado para vos."
            : `${dias.length} días de comidas planificados para vos.`}
        </p>
      </div>

      {dias.length > 1 ? (
        <div
          className="alimentacion-plan__tabs"
          role="tablist"
          aria-label="Días del plan"
        >
          {dias.map((diaTab, index) => {
            const selected = index === safeIndex;
            const kcal = getDiaKcal(diaTab);
            const dateKey = getDateKeyForDia(index);
            const checkin = checkins[dateKey];
            return (
              <button
                key={diaTab.nombre}
                type="button"
                role="tab"
                id={`alimentacion-dia-tab-${index}`}
                aria-selected={selected}
                aria-controls={`alimentacion-dia-panel-${index}`}
                tabIndex={selected ? 0 : -1}
                className={`alimentacion-plan__tab${selected ? " is-active" : ""}`}
                onClick={() => setSelectedIndex(index)}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
                    return;
                  }
                  event.preventDefault();
                  const delta = event.key === "ArrowRight" ? 1 : -1;
                  const next =
                    (safeIndex + delta + dias.length) % dias.length;
                  setSelectedIndex(next);
                  document
                    .getElementById(`alimentacion-dia-tab-${next}`)
                    ?.focus();
                }}
              >
                <span className="alimentacion-plan__tab-name">
                  {diaTab.nombre}
                </span>
                {kcal ? (
                  <span className="alimentacion-plan__tab-kcal">
                    {kcal} kcal
                  </span>
                ) : null}
                {checkin ? (
                  <span className={`alimentacion-plan__tab-checkin checkin-${checkin.estado}`}>
                    {getCheckinIcon(checkin.estado)}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {selectedCheckin && (
        <div className="alimentacion-plan__checkin-banner" role="status">
          <span className={`checkin-badge checkin-${selectedCheckin.estado}`}>
            {getCheckinIcon(selectedCheckin.estado)}
            {getCheckinLabel(selectedCheckin.estado)} hoy
          </span>
        </div>
      )}

      <div
        className="alimentacion-plan__panel"
        role={dias.length > 1 ? "tabpanel" : undefined}
        id={dias.length > 1 ? `alimentacion-dia-panel-${safeIndex}` : undefined}
        aria-labelledby={
          dias.length > 1 ? `alimentacion-dia-tab-${safeIndex}` : undefined
        }
      >
        <div className="alimentacion-plan__panel-header">
          <h3>{dia.nombre}</h3>
          {diaKcal ? (
            <span className="alimentacion-plan__panel-kcal">
              <Flame size={14} aria-hidden />
              {diaKcal} kcal totales
            </span>
          ) : null}
        </div>

        <div className="alimentacion-plan__comidas">
          {dia.comidas.map((comida, index) => (
            <ComidaCard key={`${comida.nombre}-${index}`} comida={comida} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function PlanNutricionalDashboard({
  plan,
  preview = false,
}: {
  plan: PlanNutricionalApiDoc;
  preview?: boolean;
}) {
  const { checkins, loading: checkinsLoading } = useCheckinsAlimentacionSemana();
  const diaHoy = plan.dias[getDiaHoyIndex(plan.dias.length, plan.publicadoAt)];

  // Calcular dateKey para cada día del plan (asumiendo que día 0 = fecha de publicación o hoy)
  const getDateKeyForDia = (diaIndex: number): string => {
    const baseDate = plan.publicadoAt ? new Date(plan.publicadoAt) : new Date();
    const targetDate = new Date(baseDate);
    targetDate.setDate(targetDate.getDate() + diaIndex);
    return targetDate.toISOString().split("T")[0];
  };

  return (
    <div className="alimentacion-dashboard alimentacion-dashboard--with-plan">
      {preview ? (
        <header className="alimentacion-hero">
          <div className="alimentacion-hero__top">
            <span className="nutricion-wizard__eyebrow">Plan nutricional</span>
          </div>
          <h1>{plan.titulo}</h1>
          {plan.publicadoAt ? (
            <p className="alimentacion-hero__meta">
              <CalendarDays size={14} aria-hidden />
              Publicado el{" "}
              {new Date(plan.publicadoAt).toLocaleDateString("es-UY", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          ) : null}
          {plan.observacionesProfe ? (
            <blockquote className="alimentacion-hero__notes">
              <Quote size={16} aria-hidden />
              <p>{plan.observacionesProfe}</p>
              <footer>Nota de tu profesora</footer>
            </blockquote>
          ) : null}
        </header>
      ) : null}

      {preview || !diaHoy ? null : (
        <ProximaComida
          dia={diaHoy}
          storageKey={`ivis-comidas-${plan._id ?? plan.id}-${new Date().toLocaleDateString("en-CA")}`}
        />
      )}

      {preview ? <MacrosSummary macros={plan.macrosObjetivo} /> : null}

      {preview ? (
        <>
          <PlanDias
            dias={plan.dias}
            checkins={checkins}
            getDateKeyForDia={getDateKeyForDia}
          />
          <ListaComprasAlumna dias={plan.dias} semanas={plan.listasComprasSemanas} />
        </>
      ) : null}
    </div>
  );
}
