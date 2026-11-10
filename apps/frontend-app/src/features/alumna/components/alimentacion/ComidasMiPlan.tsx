"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Clock, MessageSquareQuote } from "lucide-react";
import {
  ComidaLeaders,
  ComidaNotas,
} from "@/features/alumna/components/alimentacion/ComidaLeaders";
import {
  ComposicionResumenAlumna,
  MacrosSummary,
} from "@/features/alumna/components/alimentacion/MacrosSummary";
import type {
  ComidaPlan,
  DiaPlanNutricional,
  PlanNutricionalApiDoc,
} from "@/features/alumna/types/plan-nutricional";

function kcalDelDia(dia: DiaPlanNutricional) {
  const total = dia.comidas.reduce(
    (sum, comida) => sum + (comida.macrosComida?.kcal ?? 0),
    0,
  );
  return total > 0 ? total : null;
}

function ComidaDiaMeal({ comida }: { comida: ComidaPlan }) {
  return (
    <div className="comida-dia__meal">
      <div className="comida-dia__meal-head">
        <strong>{comida.nombre}</strong>
        {comida.horario ? (
          <span className="comida-dia__meal-time">
            <Clock size={12} aria-hidden />
            {comida.horario}
          </span>
        ) : null}
        {comida.macrosComida ? (
          <span className="comida-dia__meal-kcal">
            {comida.macrosComida.kcal} kcal
          </span>
        ) : null}
      </div>
      <ComidaLeaders comida={comida} />
      <ComidaNotas comida={comida} />
    </div>
  );
}

export function ComidasMiPlan({
  plan,
  diaHoyIndex,
  anchor,
}: {
  plan: PlanNutricionalApiDoc;
  diaHoyIndex: number;
  anchor?: "macros";
}) {
  const defaultIndex = plan.dias.length <= 1 ? 0 : diaHoyIndex;
  const [openIndex, setOpenIndex] = useState<number | null>(defaultIndex);
  const [activeIndex, setActiveIndex] = useState<number>(defaultIndex);

  useEffect(() => {
    if (anchor !== "macros") return;
    document.getElementById("alimentacion-macros")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [anchor]);

  const activeDia = plan.dias[activeIndex] ?? plan.dias[0];
  const activeKcal = activeDia ? kcalDelDia(activeDia) : null;
  const activeIsToday = activeIndex === diaHoyIndex;

  return (
    <div className="comida-plan">
      <header className="comida-plan__intro">
        <p className="comida-kicker">Tu plan</p>
        <h2>{plan.titulo}</h2>
        {plan.publicadoAt ? (
          <p>
            Publicado el{" "}
            {new Date(plan.publicadoAt).toLocaleDateString("es-UY", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        ) : null}
      </header>

      {plan.observacionesProfe ? (
        <blockquote className="comida-nota">
          <footer>
            <MessageSquareQuote size={15} aria-hidden />
            Nota de tu profesora
          </footer>
          <p>{plan.observacionesProfe}</p>
        </blockquote>
      ) : null}

      <div id="alimentacion-macros" className="comida-plan__anchor">
        <MacrosSummary macros={plan.macrosObjetivo} />
        <ComposicionResumenAlumna />
      </div>

      <section className="comida-dias" aria-labelledby="comida-dias-title">
        <div className="comida-plan__heading">
          <h2 id="comida-dias-title">Tus días</h2>
          <p>Abrí un día para ver el menú completo.</p>
        </div>
        {plan.dias.length === 0 ? (
          <p className="comida-vacio">Este plan todavía no tiene días.</p>
        ) : (
          <div className="comida-dias__layout">
            <div className="comida-dias__list">
              {plan.dias.map((dia, index) => {
                const open = openIndex === index;
                const active = activeIndex === index;
                const kcal = kcalDelDia(dia);
                const isToday = index === diaHoyIndex;
                return (
                  <article
                    key={`${dia.nombre}-${index}`}
                    className={`comida-dia${isToday ? " is-today" : ""}${
                      open ? " is-open" : ""
                    }${active ? " is-active" : ""}`}
                  >
                    <h3 className="comida-dia__heading">
                      <button
                        type="button"
                        className="comida-dia__toggle"
                        aria-expanded={open}
                        aria-current={active ? "true" : undefined}
                        onClick={(event) => {
                          const willOpen = openIndex !== index;
                          setActiveIndex(index);
                          setOpenIndex(willOpen ? index : null);
                          if (!willOpen) return;
                          const article = event.currentTarget.closest("article");
                          requestAnimationFrame(() => {
                            const narrow = window.matchMedia("(max-width: 1023px)").matches;
                            article?.scrollIntoView({
                              behavior: "smooth",
                              block: narrow ? "start" : "nearest",
                            });
                          });
                        }}
                      >
                        <span className="comida-dia__main">
                          <span className="comida-dia__name">
                            <strong>{dia.nombre}</strong>
                            {isToday ? <em className="comida-dia__badge">Hoy</em> : null}
                          </span>
                          <span className="comida-dia__aside">
                            {kcal ? <span className="comida-dia__kcal">{kcal} kcal</span> : null}
                            <ChevronDown size={18} aria-hidden />
                          </span>
                        </span>
                        <span className="comida-dia__resumen">
                          {dia.comidas.map((comida) => comida.nombre).join(" · ") ||
                            "Sin comidas"}
                        </span>
                      </button>
                    </h3>
                    {open ? (
                      <div className="comida-dia__body">
                        {dia.comidas.length === 0 ? (
                          <p className="comida-vacio">Sin comidas en este día.</p>
                        ) : (
                          dia.comidas.map((comida, comidaIndex) => (
                            <ComidaDiaMeal
                              key={`${comida.nombre}-${comidaIndex}`}
                              comida={comida}
                            />
                          ))
                        )}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>

            {activeDia ? (
              <div
                key={`${activeDia.nombre}-${activeIndex}`}
                className="comida-dia-panel"
                aria-live="polite"
              >
                <header className="comida-dia-panel__head">
                  <div className="comida-dia-panel__titles">
                    <div className="comida-dia-panel__name">
                      <h3>{activeDia.nombre}</h3>
                      {activeIsToday ? <em className="comida-dia__badge">Hoy</em> : null}
                    </div>
                    <p className="comida-dia-panel__meta">
                      {activeDia.comidas.length}{" "}
                      {activeDia.comidas.length === 1 ? "comida" : "comidas"} en el día
                    </p>
                  </div>
                  {activeKcal ? (
                    <span className="comida-dia-panel__kcal">
                      <strong>{activeKcal}</strong> kcal
                    </span>
                  ) : null}
                </header>

                {activeDia.comidas.length === 0 ? (
                  <p className="comida-vacio">Sin comidas en este día.</p>
                ) : (
                  <div className="comida-dia__meals-grid">
                    {activeDia.comidas.map((comida, comidaIndex) => (
                      <ComidaDiaMeal
                        key={`${comida.nombre}-${comidaIndex}`}
                        comida={comida}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
