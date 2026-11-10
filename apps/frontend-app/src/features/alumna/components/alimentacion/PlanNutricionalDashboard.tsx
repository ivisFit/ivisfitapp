"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { CalendarDays, MessageSquareQuote, ShoppingBasket, Utensils } from "lucide-react";
import { ComidasMiPlan } from "@/features/alumna/components/alimentacion/ComidasMiPlan";
import { ListaComprasAlumna } from "@/features/alumna/components/alimentacion/ListaComprasAlumna";
import { ProximaComida } from "@/features/alumna/components/alimentacion/ProximaComida";
import {
  getTodayDateKey,
  resolveDiaHoyIndex,
} from "@/features/alumna/lib/alimentacion-dia-hoy";
import type { PlanNutricionalApiDoc } from "@/features/alumna/types/plan-nutricional";

export { ComposicionResumenAlumna, MacrosSummary } from "./MacrosSummary";

export type AlimentacionVista = "hoy" | "plan" | "compras";

const VISTAS: AlimentacionVista[] = ["hoy", "plan", "compras"];

export function PlanNutricionalDashboard({
  plan,
  preview = false,
  initialView = "hoy",
  planAnchor,
}: {
  plan: PlanNutricionalApiDoc;
  preview?: boolean;
  initialView?: AlimentacionVista;
  planAnchor?: "macros" | "compras";
}) {
  const resolvedInitial: AlimentacionVista =
    planAnchor === "compras" ? "compras" : initialView;
  const [view, setView] = useState<AlimentacionVista>(resolvedInitial);
  const hoyRef = useRef<HTMLButtonElement>(null);
  const planRef = useRef<HTMLButtonElement>(null);
  const comprasRef = useRef<HTMLButtonElement>(null);
  const diaHoyIndex = resolveDiaHoyIndex(plan.dias, plan.publicadoAt);
  const diaHoy = plan.dias[diaHoyIndex];
  const planId = plan._id ?? plan.id ?? "plan";
  const storageKey = `ivis-comidas-${planId}-${getTodayDateKey()}`;

  useEffect(() => {
    setView(planAnchor === "compras" ? "compras" : initialView);
  }, [initialView, planAnchor]);

  const tabRefs = { hoy: hoyRef, plan: planRef, compras: comprasRef } as const;

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, current: AlimentacionVista) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const index = VISTAS.indexOf(current);
    const next =
      VISTAS[(index + (event.key === "ArrowRight" ? 1 : VISTAS.length - 1)) % VISTAS.length];
    setView(next);
    tabRefs[next].current?.focus();
  };

  const tabPanelLabel =
    view === "hoy"
      ? "comida-tab-hoy"
      : view === "plan"
        ? "comida-tab-plan"
        : "comida-tab-compras";

  return (
    <div className={`comida-menu${preview ? " comida-menu--preview" : ""}`}>
      <div
        className="comida-menu__nav comida-menu__nav--three"
        role="tablist"
        aria-label="Alimentación"
      >
        <button
          ref={hoyRef}
          type="button"
          role="tab"
          id="comida-tab-hoy"
          aria-selected={view === "hoy"}
          aria-controls="comida-panel"
          tabIndex={view === "hoy" ? 0 : -1}
          className={view === "hoy" ? "is-active" : undefined}
          onClick={() => setView("hoy")}
          onKeyDown={(e) => onTabKeyDown(e, "hoy")}
        >
          <Utensils size={16} aria-hidden />
          Hoy
        </button>
        <button
          ref={planRef}
          type="button"
          role="tab"
          id="comida-tab-plan"
          aria-selected={view === "plan"}
          aria-controls="comida-panel"
          tabIndex={view === "plan" ? 0 : -1}
          className={view === "plan" ? "is-active" : undefined}
          onClick={() => setView("plan")}
          onKeyDown={(e) => onTabKeyDown(e, "plan")}
        >
          <CalendarDays size={16} aria-hidden />
          Tu plan
        </button>
        <button
          ref={comprasRef}
          type="button"
          role="tab"
          id="comida-tab-compras"
          aria-selected={view === "compras"}
          aria-controls="comida-panel"
          tabIndex={view === "compras" ? 0 : -1}
          className={view === "compras" ? "is-active" : undefined}
          onClick={() => setView("compras")}
          onKeyDown={(e) => onTabKeyDown(e, "compras")}
        >
          <ShoppingBasket size={16} aria-hidden />
          Compras
        </button>
      </div>

      {view === "hoy" && plan.observacionesProfe ? (
        <button type="button" className="comida-nota-link" onClick={() => setView("plan")}>
          <MessageSquareQuote size={16} aria-hidden />
          <span>Tu profesora dejó una nota</span>
          <strong>Ver en Tu plan</strong>
        </button>
      ) : null}

      <div id="comida-panel" role="tabpanel" aria-labelledby={tabPanelLabel}>
      {view === "hoy" ? (
        diaHoy && diaHoy.comidas.length > 0 ? (
          <ProximaComida dia={diaHoy} storageKey={storageKey} preview={preview} />
        ) : (
          <div className="comida-vacio-panel">
            <p className="comida-kicker">Hoy</p>
            <h2>Este día todavía no tiene comidas</h2>
            <p>
              Cuando tu profesora cargue el menú, vas a ver cada comida acá.
              Mientras tanto podés mirar el resto de la semana.
            </p>
            <button type="button" className="btn btn--primary" onClick={() => setView("plan")}>
              Ir a Tu plan
            </button>
          </div>
        )
      ) : view === "plan" ? (
        <ComidasMiPlan
          plan={plan}
          diaHoyIndex={diaHoyIndex}
          anchor={planAnchor === "macros" ? "macros" : undefined}
        />
      ) : (
        <div className="comida-compras-panel">
          <ListaComprasAlumna
            dias={plan.dias}
            diaHoy={diaHoy}
            semanas={plan.listasComprasSemanas}
          />
        </div>
      )}
      </div>
    </div>
  );
}
