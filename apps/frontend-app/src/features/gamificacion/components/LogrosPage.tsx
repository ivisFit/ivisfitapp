"use client";

import { Button } from "@/components/Button";
import { SkeletonLine } from "@/components/skeletons/AppSkeleton";
import { useGamificacion } from "@/features/gamificacion/hooks/useGamificacion";
import { xpProgresoPorcentaje, type GamificacionBadge } from "@/features/gamificacion/types";

function formatFecha(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-UY", {
    day: "numeric",
    month: "short",
  }).format(date);
}

const EVENTO_ICONOS: Record<string, string> = {
  entrenamiento: "🏋️",
  checkin_alimentacion: "🍽️",
  medicion: "📏",
  peso: "🎯",
  racha_3: "🔥",
  racha_7: "🔥",
  racha_14: "🔥",
  racha_28: "💪",
  desafio: "🏆",
  logro: "🏅",
};

function BadgeCard({ badge }: { badge: GamificacionBadge }) {
  const { desbloqueado } = badge;
  return (
    <li
      className={`gamif-badge${desbloqueado ? "" : " gamif-badge--locked"}`}
      title={desbloqueado ? `${badge.nombre} · ${badge.descripcion}` : "Aún no desbloqueado"}
    >
      <span className="gamif-badge__icon" aria-hidden>
        {desbloqueado ? badge.icono : "🔒"}
      </span>
      <span className="gamif-badge__info">
        <span className="gamif-badge__name">{badge.nombre}</span>
        <span className="gamif-badge__desc">{badge.descripcion}</span>
        {desbloqueado && badge.desbloqueadoAt ? (
          <span className="gamif-badge__date">Desbloqueado {formatFecha(badge.desbloqueadoAt)}</span>
        ) : null}
      </span>
    </li>
  );
}

export function LogrosPage() {
  const { data, isLoading, error } = useGamificacion();

  if (isLoading) {
    return (
      <div className="logros-page page" aria-busy="true" aria-label="Cargando tus logros">
        <div className="pliegues-hero">
          <span className="pliegues-hero__eyebrow">Gamificación</span>
          <h1>Logros</h1>
        </div>
        <section className="feature-card gamif-level-card gamif-level-card--loading">
          <div className="gamif-level-card__level" aria-hidden>
            <SkeletonLine size="2xl" width="w-25" gold />
            <span className="gamif-level-card__label">Nivel</span>
          </div>
          <div className="gamif-level-card__main" aria-hidden>
            <SkeletonLine size="md" width="w-60" />
            <SkeletonLine size="lg" width="w-90" />
            <SkeletonLine size="sm" width="w-75" />
          </div>
        </section>
        <section className="gamif-section" aria-hidden>
          <ul className="gamif-badges-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <li key={index} className="gamif-badge gamif-badge--locked">
                <SkeletonLine size="lg" width="w-40" />
                <SkeletonLine size="sm" width="w-75" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="logros-page page">
        <section className="pliegues-hero">
          <span className="pliegues-hero__eyebrow">Gamificación</span>
          <h1>Logros</h1>
        </section>
        <div className="feature-card gamif-error" role="alert">
          <p>No se pudieron cargar tus logros.</p>
          <Button type="button" variant="ghost" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const progreso = xpProgresoPorcentaje(data);
  const desbloqueados = data.badges.filter((badge) => badge.desbloqueado);
  const bloqueados = data.badges.filter((badge) => !badge.desbloqueado);
  const proximos = data.proximosLogros.filter((badge) => !badge.desbloqueado).slice(0, 3);

  return (
    <div className="logros-page page">
      <section className="pliegues-hero">
        <div className="pliegues-hero__copy">
          <span className="pliegues-hero__eyebrow">Gamificación</span>
          <h1>Logros y recompensas</h1>
          <p>
            Cada entrenamiento, check-in y medición suma XP. Acumulá rachas,
            subí de nivel y desbloqueá logros mientras avanzás.
          </p>
        </div>
      </section>

      <section className="gamif-level-card feature-card">
        <div className="gamif-level-card__level">
          <span className="gamif-level-card__number">{data.nivel}</span>
          <span className="gamif-level-card__label">Nivel</span>
        </div>
        <div className="gamif-level-card__main">
          <div className="gamif-level-card__xp-row">
            <span>{data.xpTotal} XP totales</span>
            <span>
              {data.xpProgresoNivel}/{data.xpSiguiente} XP para el próximo nivel
            </span>
          </div>
          <div className="gamif-level-card__bar">
            <div
              className="gamif-level-card__bar-fill"
              style={{ width: `${progreso}%` }}
            />
          </div>
          <div className="gamif-level-card__stats">
            <span title="Racha actual">
              <span aria-hidden>🔥</span> Racha actual: {data.rachaActual} días
            </span>
            <span title="Mejor racha">
              <span aria-hidden>🏅</span> Mejor racha: {data.rachaMaxima} días
            </span>
          </div>
        </div>
      </section>

      <section className="gamif-section">
        <div className="gamif-section__header">
          <h2>Logros desbloqueados</h2>
          <span className="gamif-section__count">
            {desbloqueados.length}/{data.badges.length}
          </span>
        </div>
        {desbloqueados.length > 0 ? (
          <ul className="gamif-badges-grid">
            {desbloqueados.map((badge) => (
              <BadgeCard key={badge.codigo} badge={badge} />
            ))}
          </ul>
        ) : (
          <p className="gamif-empty">
            Todavía no desbloqueaste logros. ¡Completá tu primer entrenamiento!
          </p>
        )}
      </section>

      {proximos.length > 0 ? (
        <section className="gamif-section">
          <div className="gamif-section__header">
            <h2>Próximos logros</h2>
          </div>
          <ul className="gamif-badges-grid">
            {proximos.map((badge) => (
              <BadgeCard key={badge.codigo} badge={badge} />
            ))}
          </ul>
        </section>
      ) : null}

      {bloqueados.length > 0 ? (
        <section className="gamif-section">
          <div className="gamif-section__header">
            <h2>Por descubrir</h2>
          </div>
          <ul className="gamif-badges-grid">
            {bloqueados.slice(0, 6).map((badge) => (
              <BadgeCard key={badge.codigo} badge={badge} />
            ))}
          </ul>
        </section>
      ) : null}

      {data.eventosRecientes.length > 0 ? (
        <section className="gamif-section">
          <div className="gamif-section__header">
            <h2>Actividad reciente</h2>
          </div>
          <ul className="gamif-activity">
            {data.eventosRecientes.map((evento) => (
              <li key={evento._id} className="gamif-activity__item">
                <span className="gamif-activity__icon" aria-hidden>
                  {EVENTO_ICONOS[evento.tipo] ?? "✨"}
                </span>
                <span className="gamif-activity__desc">{evento.descripcion}</span>
                {evento.puntos > 0 ? (
                  <span className="gamif-activity__xp">+{evento.puntos} XP</span>
                ) : null}
                <span className="gamif-activity__date">
                  {formatFecha(evento.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
