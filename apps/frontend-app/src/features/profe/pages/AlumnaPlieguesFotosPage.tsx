"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  CardSkeleton,
  PageHeaderSkeleton,
  SkeletonStack,
} from "@/components/skeletons/AppSkeleton";
import {
  FotosAgrupacionToggle,
  PlieguesFotosComparisonGrid,
} from "@/features/profe/components/pliegues/PlieguesFotosComparisonGrid";
import { PlieguesPeriodFilter } from "@/features/profe/components/pliegues/PlieguesPeriodFilter";
import { useAlumna } from "@/features/profe/hooks/useAlumna";
import { useAlumnaMediciones } from "@/features/profe/hooks/useAlumnaMediciones";
import {
  columnasFotosComparacion,
  countMedicionesConFotosProgreso,
  getMedicionesConFotosProgreso,
  type FotosAgrupacion,
} from "@/features/profe/lib/pliegues-fotos-historial";
import { type PlieguesPeriod } from "@/features/profe/utils/pliegues-period";
import {
  profeAlumnaPlieguesRoute,
  profeRoutes,
  profeAlumnaDetailRoute,
} from "@/routes/paths";
import { useMediaQuery, isMobileQuery } from "@/hooks/useMediaQuery";
import "@/styles/pliegues-fotos-historial.css";

function BackIcon() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function FotosNav({
  alumnaId,
  alumnaNombre,
}: {
  alumnaId: string;
  alumnaNombre?: string;
}) {
  return (
    <nav
      className="alumna-detail-hero__nav"
      aria-label="Navegación de fotos de pliegues"
    >
      <Link
        href={profeAlumnaPlieguesRoute(alumnaId)}
        className="alumna-detail-hero__back"
        aria-label="Volver a pliegues"
      >
        <BackIcon />
      </Link>
      <span className="alumna-detail-hero__title">
        {alumnaNombre
          ? `Fotos de progreso · ${alumnaNombre}`
          : "Fotos de progreso"}
      </span>
      <span className="alumna-detail-hero__nav-spacer" aria-hidden />
    </nav>
  );
}

function FotosHistorialContent({
  alumnaId,
  alumnaNombre,
}: {
  alumnaId: string;
  alumnaNombre: string;
}) {
  const [period, setPeriod] = useState<PlieguesPeriod>("365d");
  const [agrupacion, setAgrupacion] = useState<FotosAgrupacion>("mes");
  const { mediciones, loading, error } = useAlumnaMediciones(alumnaId);

  const medicionesConFotos = useMemo(
    () => getMedicionesConFotosProgreso(mediciones, period),
    [mediciones, period],
  );
  const columnas = useMemo(
    () => columnasFotosComparacion(medicionesConFotos, agrupacion),
    [medicionesConFotos, agrupacion],
  );

  const totalConFotos = useMemo(
    () => countMedicionesConFotosProgreso(mediciones),
    [mediciones],
  );

  const summary = useMemo(() => {
    const first = columnas[0];
    const last = columnas[columnas.length - 1];
    if (!first || !last) return null;

    const grasaFirst = first.porcentajeGrasaCorporal;
    const grasaLast = last.porcentajeGrasaCorporal;
    const delta =
      columnas.length > 1 && grasaFirst != null && grasaLast != null
        ? grasaLast - grasaFirst
        : null;

    return {
      count: columnas.length,
      countLabel: agrupacion === "mes" ? "Meses con fotos" : "Mediciones con fotos",
      range:
        columnas.length > 1 ? `${first.titulo} → ${last.titulo}` : first.titulo,
      delta,
    };
  }, [agrupacion, columnas]);

  if (loading) {
    return (
      <SkeletonStack aria-busy={true} aria-label="Cargando fotos de progreso">
        <PageHeaderSkeleton titleWidth="w-56" subtitle={false} />
        <CardSkeleton lines={4} elevated />
      </SkeletonStack>
    );
  }

  if (error) {
    return <p className="auth-error">{error}</p>;
  }

  return (
    <>
      <section className="pliegues-fotos-historial-hero">
        <div className="pliegues-fotos-historial-hero__top">
          <div className="pliegues-fotos-historial-hero__copy">
            <span className="pliegues-fotos-historial-hero__eyebrow">
              Composición corporal
            </span>
            <h1>{alumnaNombre}</h1>
            <p>
              Compará la evolución mes a mes. Cada fila es un ángulo — frente,
              espalda, perfil izquierdo y perfil derecho — y cada columna un
              mes.
            </p>
          </div>
          <PlieguesPeriodFilter value={period} onChange={setPeriod} />
        </div>

        {summary ? (
          <div className="pliegues-fotos-historial-summary">
            <div className="pliegues-fotos-historial-summary__card">
              <span className="pliegues-fotos-historial-summary__label">
                {summary.countLabel}
              </span>
              <span className="pliegues-fotos-historial-summary__value">
                {summary.count}
              </span>
            </div>
            <div className="pliegues-fotos-historial-summary__card">
              <span className="pliegues-fotos-historial-summary__label">
                Período
              </span>
              <span className="pliegues-fotos-historial-summary__value">
                {summary.range}
              </span>
            </div>
            <div className="pliegues-fotos-historial-summary__card">
              <span className="pliegues-fotos-historial-summary__label">
                Variación % grasa
              </span>
              <span
                className={`pliegues-fotos-historial-summary__value${
                  summary.delta == null
                    ? ""
                    : summary.delta <= 0
                      ? " pliegues-fotos-historial-summary__value--down"
                      : " pliegues-fotos-historial-summary__value--up"
                }`}
              >
                {summary.delta == null
                  ? "—"
                  : `${summary.delta > 0 ? "+" : ""}${summary.delta.toLocaleString(
                      "es-UY",
                      { minimumFractionDigits: 1, maximumFractionDigits: 1 },
                    )} pp`}
              </span>
            </div>
          </div>
        ) : null}
      </section>

      <section className="pliegues-fotos-historial__card">
        {medicionesConFotos.length > 0 ? (
          <div className="pliegues-fotos-historial__card-head">
            <div>
              <h2>Evolución por ángulo</h2>
              <p className="pliegues-fotos-historial__card-hint">
                {agrupacion === "mes"
                  ? "Cada fila es un ángulo y cada columna un mes. Tocá una foto para verla junto a la anterior."
                  : "Cada fila es un ángulo y cada columna una medición. Tocá una foto para verla junto a la anterior."}
              </p>
            </div>
            <FotosAgrupacionToggle
              value={agrupacion}
              onChange={setAgrupacion}
            />
          </div>
        ) : null}
        {totalConFotos === 0 ? (
          <div>
            <p className="pliegues-fotos-historial__empty">
              Todavía no hay fotos de progreso registradas. Subilas al cargar una
              nueva medición de pliegues.
            </p>
            <div className="pliegues-fotos-historial__empty-actions">
              <Link
                href={profeAlumnaPlieguesRoute(alumnaId)}
                className="btn btn--primary"
              >
                Volver a pliegues
              </Link>
            </div>
          </div>
        ) : medicionesConFotos.length === 0 ? (
          <div>
            <p className="pliegues-fotos-historial__empty">
              No hay mediciones con fotos en el período seleccionado. Probá
              ampliar el rango (por ejemplo, «Todo»).
            </p>
          </div>
        ) : (
          <PlieguesFotosComparisonGrid
            key={agrupacion}
            columnas={columnas}
            modo={agrupacion}
          />
        )}
      </section>
    </>
  );
}

export function AlumnaPlieguesFotosPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : undefined;
  const { alumna, loading: alumnaLoading, error: alumnaError } = useAlumna(id);
  const isMobile = useMediaQuery(isMobileQuery);

  if (!id) {
    return <p className="auth-error">Alumna no encontrada</p>;
  }

  const alumnaNombre = alumna?.nombre ?? "Alumna";

  if (alumnaLoading) {
    return (
      <div className="pliegues-fotos-historial-page page">
        <PageHeaderSkeleton titleWidth="w-48" subtitle={false} />
      </div>
    );
  }

  if (alumnaError) {
    return <p className="auth-error">{alumnaError}</p>;
  }

  if (isMobile) {
    return (
      <div className="alumna-pliegues-mobile pliegues-fotos-historial-page page">
        <div
          className="alumna-detail-hero-fixed pliegues-hero-fixed"
          aria-hidden
        >
          <div className="pliegues-hero-fixed__glow" />
        </div>
        <FotosNav alumnaId={id} alumnaNombre={alumna?.nombre} />
        <div className="alumna-detail-hero-spacer" aria-hidden />
        <div className="alumna-pliegues-body">
          <FotosHistorialContent alumnaId={id} alumnaNombre={alumnaNombre} />
        </div>
      </div>
    );
  }

  return (
    <div className="alumna-pliegues-desktop pliegues-fotos-historial-page page">
      <p className="page__back">
        <Link href={profeAlumnaPlieguesRoute(id)}>← Pliegues</Link>
        <span aria-hidden> · </span>
        <Link href={profeAlumnaDetailRoute(id)}>Perfil de {alumnaNombre}</Link>
        <span aria-hidden> · </span>
        <Link href={profeRoutes.alumnas}>Alumnas</Link>
      </p>
      <FotosHistorialContent alumnaId={id} alumnaNombre={alumnaNombre} />
    </div>
  );
}
