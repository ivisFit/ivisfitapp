"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CardSkeleton } from "@/components/skeletons/AppSkeleton";
import {
  FotosAgrupacionToggle,
  PlieguesFotosComparisonGrid,
} from "@/features/profe/components/pliegues/PlieguesFotosComparisonGrid";
import { PlieguesPeriodFilter } from "@/features/profe/components/pliegues/PlieguesPeriodFilter";
import { useAlumnaMediciones } from "@/features/profe/hooks/useAlumnaMediciones";
import {
  columnasFotosComparacion,
  countMedicionesConFotosProgreso,
  getMedicionesConFotosProgreso,
  type FotosAgrupacion,
} from "@/features/profe/lib/pliegues-fotos-historial";
import type { PlieguesPeriod } from "@/features/profe/utils/pliegues-period";
import {
  profeAlumnaPlieguesFotosRoute,
  profeAlumnaPlieguesRoute,
} from "@/routes/paths";
import "@/styles/pliegues-fotos-historial.css";

type AlumnaFotosEvolucionProps = {
  alumnaId: string;
  refreshToken?: number;
};

export function AlumnaFotosEvolucion({
  alumnaId,
  refreshToken = 0,
}: AlumnaFotosEvolucionProps) {
  const [period, setPeriod] = useState<PlieguesPeriod>("365d");
  const [agrupacion, setAgrupacion] = useState<FotosAgrupacion>("mes");
  const { mediciones, loading, error, refetch } = useAlumnaMediciones(alumnaId);
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  useEffect(() => {
    if (refreshToken === 0) return;
    void refetchRef.current();
  }, [refreshToken]);

  useEffect(() => {
    if (loading) return;
    if (window.location.hash !== "#evolucion-fotos") return;
    document.getElementById("evolucion-fotos")?.scrollIntoView({
      block: "start",
    });
  }, [loading]);

  const totalConFotos = useMemo(
    () => countMedicionesConFotosProgreso(mediciones),
    [mediciones],
  );
  const medicionesConFotos = useMemo(
    () => getMedicionesConFotosProgreso(mediciones, period),
    [mediciones, period],
  );
  const columnas = useMemo(
    () => columnasFotosComparacion(medicionesConFotos, agrupacion),
    [medicionesConFotos, agrupacion],
  );

  const hint =
    agrupacion === "mes"
      ? "Cada columna es un mes. Si hubo varias mediciones, queda la foto más reciente de cada ángulo."
      : "Cada columna es una medición, de la más antigua a la más reciente.";

  return (
    <div id="evolucion-fotos" className="alumna-fotos-evolucion">
      <div className="alumna-fotos-evolucion__head">
        <div>
          <h3>Evolución en fotos</h3>
          <p>
            Compará frente, espalda, perfil izquierdo y perfil derecho, mes a
            mes.
          </p>
        </div>
        <Link
          href={profeAlumnaPlieguesFotosRoute(alumnaId)}
          className="pliegues-fotos-historial-link"
        >
          Pantalla completa
        </Link>
      </div>

      {loading ? (
        <CardSkeleton lines={3} />
      ) : error ? (
        <p className="auth-error">{error}</p>
      ) : totalConFotos === 0 ? (
        <div>
          <p className="pliegues-fotos-historial__empty">
            Todavía no hay fotos de progreso. Subilas al cargar una medición de
            pliegues.
          </p>
          <div className="pliegues-fotos-historial__empty-actions">
            <Link
              href={profeAlumnaPlieguesRoute(alumnaId)}
              className="btn btn--primary"
            >
              Ir a pliegues
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="alumna-fotos-evolucion__tools">
            <FotosAgrupacionToggle value={agrupacion} onChange={setAgrupacion} />
            <PlieguesPeriodFilter value={period} onChange={setPeriod} />
          </div>
          {columnas.length === 0 ? (
            <p className="pliegues-fotos-historial__empty">
              No hay fotos en el período seleccionado. Probá ampliar el rango,
              por ejemplo «Todo».
            </p>
          ) : (
            <>
              <p className="pliegues-fotos-historial__card-hint">{hint}</p>
              <PlieguesFotosComparisonGrid
                key={agrupacion}
                columnas={columnas}
                modo={agrupacion}
                compact
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
