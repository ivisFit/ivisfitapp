"use client";

import { memo } from "react";
import Link from "next/link";
import { FlaskConical, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/Button";
import { profeRoutes } from "@/routes/paths";

type PanelHeaderProps = {
  nombre: string;
  onRefresh: () => void;
  refreshing: boolean;
};

function firstWord(nombre: string): string {
  const trimmed = nombre.trim();
  if (!trimmed) return "Profesora";
  return trimmed.split(/\s+/)[0];
}

function todayLabel(): string {
  return new Intl.DateTimeFormat("es-UY", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export const PanelHeader = memo(function PanelHeader({
  nombre,
  onRefresh,
  refreshing,
}: PanelHeaderProps) {
  return (
    <div className="profe-dashboard__header">
      <div className="profe-dashboard__header-copy">
        <p className="profe-dashboard__eyebrow">Panel del profe</p>
        <h1>Hola, {firstWord(nombre)}</h1>
        <p className="profe-dashboard__date">{todayLabel()}</p>
      </div>

      <div className="profe-dashboard__header-actions">
        <Link className="btn btn--ghost profe-dashboard__header-link" href={profeRoutes.alumnas}>
          <Users size={16} strokeWidth={1.75} aria-hidden />
          Ver alumnas
        </Link>
        <Link className="btn btn--ghost profe-dashboard__header-link" href={profeRoutes.nuevaRutina}>
          <FlaskConical size={16} strokeWidth={1.75} aria-hidden />
          Nuevo plan
        </Link>
        <Button
          type="button"
          variant="ghost"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Actualizar panel"
        >
          <RefreshCw
            size={16}
            strokeWidth={1.75}
            aria-hidden
            className={refreshing ? "profe-dashboard__refresh-icon is-spinning" : "profe-dashboard__refresh-icon"}
          />
        </Button>
      </div>
    </div>
  );
});
