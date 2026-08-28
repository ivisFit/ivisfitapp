"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useGamificacion } from "@/features/gamificacion/hooks/useGamificacion";
import { xpProgresoPorcentaje } from "@/features/gamificacion/types";
import { alumnaRoutes } from "@/routes/paths";

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`gamif-widget__chevron${expanded ? " gamif-widget__chevron--open" : ""}`}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function GamificacionWidget() {
  const detailsId = useId();
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading } = useGamificacion();

  if (isLoading || !data) {
    return (
      <section
        className="gamif-widget gamif-widget--collapsible feature-card"
        aria-busy="true"
        aria-label="Cargando logros"
      >
        <div className="gamif-widget__skeleton gamif-widget__skeleton--thin" />
      </section>
    );
  }

  const unlocked = data.badges.filter((badge) => badge.desbloqueado);
  const progreso = xpProgresoPorcentaje(data);

  return (
    <section
      className={`gamif-widget gamif-widget--collapsible feature-card${
        expanded ? " gamif-widget--expanded" : ""
      }`}
    >
      <button
        type="button"
        className="gamif-widget__toggle"
        aria-expanded={expanded}
        aria-controls={detailsId}
        onClick={() => setExpanded((open) => !open)}
      >
        <span className="gamif-widget__level-pill" aria-hidden>
          <span className="gamif-widget__level-pill-value">{data.nivel}</span>
          <span className="gamif-widget__level-pill-label">Nv</span>
        </span>

        <span className="gamif-widget__summary-xp">
          <span className="gamif-widget__summary-xp-bar" aria-hidden>
            <span
              className="gamif-widget__summary-xp-fill"
              style={{ width: `${progreso}%` }}
            />
          </span>
          <span className="gamif-widget__summary-xp-text">
            {data.xpTotal.toLocaleString("es-UY")} XP
          </span>
        </span>

        <span className="gamif-widget__summary-stats" aria-hidden>
          <span className="gamif-widget__summary-stat">🔥 {data.rachaActual}</span>
          <span className="gamif-widget__summary-stat">🏅 {data.rachaMaxima}</span>
        </span>

        {unlocked.length > 0 ? (
          <span className="gamif-widget__summary-badges" aria-hidden>
            {unlocked.slice(0, 2).map((badge) => (
              <span key={badge.codigo} className="gamif-widget__summary-badge">
                {badge.icono}
              </span>
            ))}
            {unlocked.length > 2 ? (
              <span className="gamif-widget__summary-badge-more">
                +{unlocked.length - 2}
              </span>
            ) : null}
          </span>
        ) : null}

        <ChevronIcon expanded={expanded} />
      </button>

      <div
        id={detailsId}
        className="gamif-widget__details"
        aria-hidden={!expanded}
      >
        <div className="gamif-widget__details-inner">
          <div className="gamif-widget__header">
            <span className="gamif-widget__eyebrow">Tu racha y logros</span>
            <Link href={alumnaRoutes.logros} className="gamif-widget__link">
              Ver logros
            </Link>
          </div>

          <div className="gamif-widget__body">
            <div className="gamif-widget__level">
              <span className="gamif-widget__level-number">{data.nivel}</span>
              <span className="gamif-widget__level-label">Nivel</span>
            </div>

            <div className="gamif-widget__xp">
              <div className="gamif-widget__xp-row">
                <span>{data.xpTotal.toLocaleString("es-UY")} XP</span>
                <span>
                  {data.xpProgresoNivel}/{data.xpSiguiente} XP
                </span>
              </div>
              <div className="gamif-widget__xp-bar">
                <div
                  className="gamif-widget__xp-bar-fill"
                  style={{ width: `${progreso}%` }}
                />
              </div>
            </div>

            <div className="gamif-widget__stats">
              <span className="gamif-widget__stat" title="Racha actual">
                <span aria-hidden>🔥</span> {data.rachaActual} días
              </span>
              <span className="gamif-widget__stat" title="Mejor racha">
                <span aria-hidden>🏅</span> {data.rachaMaxima} máx
              </span>
            </div>
          </div>

          <div className="gamif-widget__badges" aria-label="Logros desbloqueados">
            {unlocked.slice(0, 5).map((badge) => (
              <span
                key={badge.codigo}
                className="gamif-widget__badge"
                title={`${badge.nombre}: ${badge.descripcion}`}
              >
                {badge.icono}
              </span>
            ))}
            {unlocked.length > 5 ? (
              <span className="gamif-widget__badge-more">+{unlocked.length - 5}</span>
            ) : unlocked.length === 0 ? (
              <span className="gamif-widget__badges-empty">
                Completá tus primeros entrenamientos para ganar logros.
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
