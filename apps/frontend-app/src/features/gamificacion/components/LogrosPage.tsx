"use client";

import { Button } from "@/components/Button";
import { SkeletonLine } from "@/components/skeletons/AppSkeleton";
import { useGamificacion } from "@/features/gamificacion/hooks/useGamificacion";
import {
  xpProgresoPorcentaje,
  type GamificacionBadge,
  type GamificacionCategoriaResumen,
} from "@/features/gamificacion/types";

const CATEGORIA_LABELS: Record<string, string> = {
  entrenamiento: "Entrenamiento",
  alimentacion: "Alimentación",
  medicion: "Medición",
  fuerza: "Fuerza",
  nivel: "Nivel",
  app: "Tu perfil y la app",
  combo: "Combos",
};

const CATEGORIA_ORDEN = [
  "entrenamiento",
  "alimentacion",
  "medicion",
  "fuerza",
  "nivel",
  "combo",
  "app",
];

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

function resolveCategorias(
  badges: GamificacionBadge[],
  fromApi?: GamificacionCategoriaResumen[],
): GamificacionCategoriaResumen[] {
  if (fromApi && fromApi.length > 0) return fromApi;
  const map = new Map<string, { total: number; desbloqueados: number }>();
  for (const badge of badges) {
    const current = map.get(badge.categoria) ?? { total: 0, desbloqueados: 0 };
    current.total += 1;
    if (badge.desbloqueado) current.desbloqueados += 1;
    map.set(badge.categoria, current);
  }
  return CATEGORIA_ORDEN.filter((id) => map.has(id)).map((id) => ({
    id,
    label: CATEGORIA_LABELS[id] ?? id,
    total: map.get(id)?.total ?? 0,
    desbloqueados: map.get(id)?.desbloqueados ?? 0,
  }));
}

function badgesPorCategoria(
  badges: GamificacionBadge[],
  categoriaId: string,
): GamificacionBadge[] {
  return badges.filter((badge) => badge.categoria === categoriaId);
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
            <SkeletonLine size="sm" width="w-40" />
            <span className="sk sk--pill sk--xs sk--full" />
            <SkeletonLine size="xs" width="w-56" />
          </div>
        </section>
        {Array.from({ length: 3 }).map((_, sectionIndex) => (
          <section key={sectionIndex} className="gamif-section gamif-category-block" aria-hidden>
            <SkeletonLine size="md" width="w-40" />
            <ul className="gamif-badges-grid">
              {Array.from({ length: 4 }).map((__, index) => (
                <li key={index} className="gamif-badge gamif-badge--locked">
                  <span className="sk sk--avatar-sm" aria-hidden />
                  <span className="gamif-badge__info" aria-hidden>
                    <SkeletonLine size="sm" width="w-60" />
                    <SkeletonLine size="xs" width="w-90" />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
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
  const proximos = data.proximosLogros.slice(0, 3);
  const categorias = resolveCategorias(data.badges, data.categorias);

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
          <h2>Resumen</h2>
          <span className="gamif-section__count">
            {desbloqueados.length}/{data.badges.length}
          </span>
        </div>
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

      {categorias.map((categoria) => {
        const items = badgesPorCategoria(data.badges, categoria.id);
        if (items.length === 0) return null;
        return (
          <section key={categoria.id} className="gamif-section gamif-category-block">
            <div className="gamif-section__header gamif-category__header">
              <h2 className="gamif-category__title">{categoria.label}</h2>
              <span className="gamif-section__count">
                {categoria.desbloqueados}/{categoria.total}
              </span>
            </div>
            <ul className="gamif-badges-grid">
              {items.map((badge) => (
                <BadgeCard key={badge.codigo} badge={badge} />
              ))}
            </ul>
          </section>
        );
      })}

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
