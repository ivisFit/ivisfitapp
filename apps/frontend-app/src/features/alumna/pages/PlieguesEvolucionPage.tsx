"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { IvisContentLoader } from "@/components/IvisContentLoader";
import {
  FotosAgrupacionToggle,
  PlieguesFotosComparisonGrid,
} from "@/features/profe/components/pliegues/PlieguesFotosComparisonGrid";
import { PlieguesPeriodFilter } from "@/features/profe/components/pliegues/PlieguesPeriodFilter";
import { useMisPliegues } from "@/features/alumna/hooks/useMisPliegues";
import {
  columnasFotosComparacion,
  countMedicionesConFotosProgreso,
  getMedicionesConFotosProgreso,
  type FotosAgrupacion,
} from "@/features/profe/lib/pliegues-fotos-historial";
import {
  filterMedicionesByPeriod,
  formatGrasaCorporal,
  formatMedicionDate,
  type PlieguesPeriod,
} from "@/features/profe/utils/pliegues-period";
import { alumnaRoutes } from "@/routes/paths";
import "@/styles/pliegues-fotos-historial.css";

const PlieguesEvolucionChart = dynamic(
  () =>
    import("@/features/alumna/components/PlieguesEvolucionChart").then(
      (mod) => mod.PlieguesEvolucionChart,
    ),
  {
    ssr: false,
    loading: () => (
      <IvisContentLoader variant="section" label="Cargando gráfico" />
    ),
  },
);

function formatDelta(delta: number) {
  const prefix = delta > 0 ? "+" : "";
  return `${prefix}${delta.toLocaleString("es-UY", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} pp`;
}

function formatPeso(value?: number) {
  if (value == null) return null;
  return `${value.toLocaleString("es-UY", { maximumFractionDigits: 1 })} kg`;
}

export function PlieguesEvolucionPage() {
  const [period, setPeriod] = useState<PlieguesPeriod>("all");
  const [agrupacion, setAgrupacion] = useState<FotosAgrupacion>("mes");
  const { mediciones, loading, error, refetch } = useMisPliegues();

  const medicionesPliegues = useMemo(
    () =>
      mediciones.filter(
        (medicion) =>
          medicion.metodoCalculo === "jp3" || medicion.metodoCalculo === "jp7",
      ),
    [mediciones],
  );
  const enPeriodo = useMemo(
    () => filterMedicionesByPeriod(medicionesPliegues, period),
    [medicionesPliegues, period],
  );
  const medicionesConFotos = useMemo(
    () => getMedicionesConFotosProgreso(mediciones, period),
    [mediciones, period],
  );
  const columnas = useMemo(
    () => columnasFotosComparacion(medicionesConFotos, agrupacion),
    [agrupacion, medicionesConFotos],
  );
  const totalConFotos = useMemo(
    () => countMedicionesConFotosProgreso(mediciones),
    [mediciones],
  );

  const summary = useMemo(() => {
    const first = enPeriodo[0];
    const latest = enPeriodo[enPeriodo.length - 1];
    if (!first || !latest) return null;

    const grasaFirst = first.metricas?.porcentajeGrasaCorporal ?? null;
    const grasaLatest = latest.metricas?.porcentajeGrasaCorporal ?? null;
    const delta =
      enPeriodo.length > 1 && grasaFirst != null && grasaLatest != null
        ? grasaLatest - grasaFirst
        : null;

    return {
      grasaLatest,
      fecha: formatMedicionDate(latest.fecha),
      delta,
      peso: formatPeso(latest.pesoCorporalKg),
      count: enPeriodo.length,
    };
  }, [enPeriodo]);

  return (
    <div className="pliegues-evolucion-page page alumna-pliegues-view">
      <div className="alumna-pliegues-body">
        <section className="pliegues-hero">
          <div className="pliegues-hero__copy">
            <span className="pliegues-hero__eyebrow">Tu evolución</span>
            <h1>Pliegues</h1>
            <p>
              Las mediciones que toma tu profesora, con el porcentaje de grasa
              corporal y las fotos de cada control.
            </p>
          </div>
          {!loading && mediciones.length > 0 ? (
            <PlieguesPeriodFilter value={period} onChange={setPeriod} />
          ) : null}
        </section>

        {loading ? (
          <IvisContentLoader variant="section" label="Cargando tu evolución" />
        ) : error ? (
          <div className="feature-card circunferencias-state" role="alert">
            <p className="auth-error">{error}</p>
            <Button type="button" variant="ghost" onClick={() => void refetch()}>
              Reintentar
            </Button>
          </div>
        ) : mediciones.length === 0 ? (
          <div className="feature-card circunferencias-state">
            <p>
              Todavía no hay mediciones de pliegues en tu cuenta. Cuando tu
              profesora registre la primera, vas a ver acá la evolución y las
              fotos.
            </p>
            <Link className="btn btn--ghost" href={alumnaRoutes.progreso}>
              Volver a Progreso
            </Link>
          </div>
        ) : enPeriodo.length === 0 && medicionesConFotos.length === 0 ? (
          <section className="pliegues-fotos-historial__card">
            <p className="pliegues-fotos-historial__empty">
              No hay mediciones en este período. Probá ampliar el rango, por
              ejemplo «Todo».
            </p>
          </section>
        ) : (
          <>
            {enPeriodo.length > 0 && summary ? (
              <div className="pliegues-evolucion-summary">
                <article className="pliegues-fotos-historial-summary__card">
                  <span className="pliegues-fotos-historial-summary__label">
                    Grasa corporal
                  </span>
                  <strong className="pliegues-fotos-historial-summary__value">
                    {formatGrasaCorporal(summary.grasaLatest)}
                  </strong>
                  <span className="pliegues-evolucion-summary__meta">
                    {summary.fecha}
                  </span>
                </article>
                <article className="pliegues-fotos-historial-summary__card">
                  <span className="pliegues-fotos-historial-summary__label">
                    Variación
                  </span>
                  <strong
                    className={`pliegues-fotos-historial-summary__value${
                      summary.delta == null
                        ? ""
                        : summary.delta <= 0
                          ? " pliegues-fotos-historial-summary__value--down"
                          : " pliegues-fotos-historial-summary__value--up"
                    }`}
                  >
                    {summary.delta == null ? "—" : formatDelta(summary.delta)}
                  </strong>
                  <span className="pliegues-evolucion-summary__meta">
                    {summary.delta == null
                      ? "El cambio aparece con la próxima medición"
                      : "Respecto de la primera del período"}
                  </span>
                </article>
                {summary.peso ? (
                  <article className="pliegues-fotos-historial-summary__card">
                    <span className="pliegues-fotos-historial-summary__label">
                      Peso
                    </span>
                    <strong className="pliegues-fotos-historial-summary__value">
                      {summary.peso}
                    </strong>
                    <span className="pliegues-evolucion-summary__meta">
                      Último control
                    </span>
                  </article>
                ) : null}
                <article className="pliegues-fotos-historial-summary__card">
                  <span className="pliegues-fotos-historial-summary__label">
                    Mediciones
                  </span>
                  <strong className="pliegues-fotos-historial-summary__value">
                    {summary.count}
                  </strong>
                  <span className="pliegues-evolucion-summary__meta">
                    En el período elegido
                  </span>
                </article>
              </div>
            ) : null}

            {enPeriodo.length > 0 ? (
              <PlieguesEvolucionChart mediciones={enPeriodo} />
            ) : null}

            <section className="pliegues-fotos-historial__card">
              {medicionesConFotos.length > 0 ? (
                <div className="pliegues-fotos-historial__card-head">
                  <div>
                    <h2>Evolución por ángulo</h2>
                    <p className="pliegues-fotos-historial__card-hint">
                      {agrupacion === "mes"
                        ? "Cada fila es un ángulo y cada columna un mes. Tocá una foto para compararla con la anterior."
                        : "Cada fila es un ángulo y cada columna una medición. Tocá una foto para compararla con la anterior."}
                    </p>
                  </div>
                  <FotosAgrupacionToggle
                    value={agrupacion}
                    onChange={setAgrupacion}
                  />
                </div>
              ) : (
                <div className="pliegues-fotos-historial__card-head">
                  <div>
                    <h2>Evolución por ángulo</h2>
                  </div>
                </div>
              )}

              {totalConFotos === 0 ? (
                <p className="pliegues-fotos-historial__empty">
                  Tu profesora todavía no cargó fotos de esta evolución. Cuando
                  las haya, vas a ver el antes y el después por ángulo.
                </p>
              ) : medicionesConFotos.length === 0 ? (
                <p className="pliegues-fotos-historial__empty">
                  No hay fotos en el período seleccionado. Probá ampliar el
                  rango, por ejemplo «Todo».
                </p>
              ) : (
                <PlieguesFotosComparisonGrid
                  key={agrupacion}
                  columnas={columnas}
                  modo={agrupacion}
                />
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
