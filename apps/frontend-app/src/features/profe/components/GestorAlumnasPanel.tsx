"use client";

import { memo, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { ListSkeleton } from "@/components/skeletons/AppSkeleton";
import { UserAvatar } from "@/components/UserAvatar";
import { useProfeCola } from "@/features/profe/hooks/useProfeCola";
import { profeAlumnaDetailRoute, profeRoutes } from "@/routes/paths";
import type { AlumnaListItem, MembresiaEstado } from "@/types/usuario";

export type AlumnaFiltro =
  | "todas"
  | "sin_rutina"
  | "eval_sin_plan"
  | "checkins_hoy"
  | "adherencia_baja"
  | "por_vencer"
  | "vencida"
  | "membresias";

const FILTROS_VALIDOS = new Set<string>([
  "todas",
  "sin_rutina",
  "eval_sin_plan",
  "checkins_hoy",
  "adherencia_baja",
  "por_vencer",
  "vencida",
  "membresias",
]);

function parseFiltro(raw: string | null): AlumnaFiltro {
  if (raw && FILTROS_VALIDOS.has(raw)) return raw as AlumnaFiltro;
  return "todas";
}

interface GestorAlumnasPanelProps {
  alumnas: AlumnaListItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

function ChevronIcon() {
  return (
    <svg
      className="alumnas-list__chevron"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function membresiaLabel(estado?: MembresiaEstado) {
  if (estado === "al_dia") return "Al día";
  if (estado === "por_vencer") return "Por vencer";
  if (estado === "vencida") return "Vencida";
  return null;
}

export const GestorAlumnasPanel = memo(function GestorAlumnasPanel({
  alumnas,
  loading,
  error,
  onRetry,
}: GestorAlumnasPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filtroFromUrl = parseFiltro(searchParams.get("filtro"));
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<AlumnaFiltro>(filtroFromUrl);
  const { cola } = useProfeCola(true);

  useEffect(() => {
    setFiltro(filtroFromUrl);
  }, [filtroFromUrl]);

  function updateFiltro(next: AlumnaFiltro) {
    setFiltro(next);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tab");
    if (next === "todas") {
      params.delete("filtro");
    } else {
      params.set("filtro", next);
    }
    const qs = params.toString();
    router.replace(qs ? `${profeRoutes.alumnas}?${qs}` : profeRoutes.alumnas);
  }

  const checkinIds = useMemo(
    () => new Set((cola?.checkinsAtencion ?? []).map((p) => p.id)),
    [cola?.checkinsAtencion],
  );
  const adherenciaIds = useMemo(
    () => new Set((cola?.adherenciaBaja ?? []).map((p) => p.id)),
    [cola?.adherenciaBaja],
  );

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return alumnas.filter((alumna) => {
      if (q) {
        const hay =
          alumna.nombre.toLowerCase().includes(q) ||
          alumna.email.toLowerCase().includes(q);
        if (!hay) return false;
      }
      if (filtro === "sin_rutina") return alumna.tieneRutina === false;
      if (filtro === "eval_sin_plan") {
        return (
          alumna.tieneEvaluacionNutricional === true &&
          alumna.tienePlanNutricional !== true
        );
      }
      if (filtro === "checkins_hoy") return checkinIds.has(alumna.id);
      if (filtro === "adherencia_baja") return adherenciaIds.has(alumna.id);
      if (filtro === "por_vencer") return alumna.membresia?.estado === "por_vencer";
      if (filtro === "vencida") return alumna.membresia?.estado === "vencida";
      if (filtro === "membresias") {
        const e = alumna.membresia?.estado;
        return e === "por_vencer" || e === "vencida";
      }
      return true;
    });
  }, [alumnas, busqueda, filtro, checkinIds, adherenciaIds]);

  if (loading) {
    return (
      <div aria-busy="true" aria-label="Cargando alumnas">
        <ListSkeleton items={5} withAvatar />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p className="auth-error">{error}</p>
        <Button type="button" variant="ghost" onClick={onRetry}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="alumnas-panel">
      <div className="alumnas-panel__filters">
        <Input
          label="Buscar"
          name="busquedaAlumnas"
          placeholder="Nombre o email..."
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
        />
        <Select
          label="Filtro"
          name="filtroAlumnas"
          value={filtro}
          onChange={(event) => updateFiltro(event.target.value as AlumnaFiltro)}
        >
          <option value="todas">Todas</option>
          <option value="sin_rutina">Sin rutina</option>
          <option value="eval_sin_plan">Eval. lista sin plan</option>
          <option value="checkins_hoy">Check-ins de hoy</option>
          <option value="adherencia_baja">Adherencia baja</option>
          <option value="membresias">Membresía en riesgo</option>
          <option value="por_vencer">Membresía por vencer</option>
          <option value="vencida">Membresía vencida</option>
        </Select>
      </div>

      {filtradas.length === 0 ? (
        <p className="alumnas-panel__status alumnas-panel__status--empty">
          {alumnas.length === 0
            ? "No hay alumnas registradas."
            : "Ninguna alumna coincide con la búsqueda."}
        </p>
      ) : (
        <ul className="alumnas-list">
          {filtradas.map((alumna) => {
            const membresia = membresiaLabel(alumna.membresia?.estado);
            return (
              <li key={alumna.id}>
                <Link
                  href={profeAlumnaDetailRoute(alumna.id)}
                  className="alumnas-list__item"
                  aria-label={`Ver perfil de ${alumna.nombre}`}
                >
                  <UserAvatar
                    name={alumna.nombre}
                    photoUrl={alumna.photoUrl ?? null}
                    className="alumnas-list__avatar"
                  />
                  <span className="alumnas-list__info">
                    <span className="alumnas-list__name">{alumna.nombre}</span>
                    <span className="alumnas-list__email">{alumna.email}</span>
                    <span className="alumnas-list__flags">
                      {membresia ? (
                        <span
                          className={`alumnas-list__badge alumnas-list__badge--${alumna.membresia?.estado}`}
                        >
                          {membresia}
                        </span>
                      ) : null}
                      {alumna.tieneRutina === false ? (
                        <span className="alumnas-list__badge">Sin rutina</span>
                      ) : null}
                      {alumna.tieneEvaluacionNutricional &&
                      !alumna.tienePlanNutricional ? (
                        <span className="alumnas-list__badge">Eval. lista</span>
                      ) : null}
                    </span>
                  </span>
                  <ChevronIcon />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});
