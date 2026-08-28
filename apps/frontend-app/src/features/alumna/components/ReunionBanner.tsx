"use client";

import Link from "next/link";
import { useProximaReunion } from "@/features/alumna/hooks/useProximaReunion";
import { formatReunionDate } from "@/features/profe/types/reunion";
import { alumnaRoutes } from "@/routes/paths";

export function ReunionBanner() {
  const { reunion, esHoy, loading } = useProximaReunion();

  if (loading || !reunion) return null;

  if (esHoy) {
    return (
      <div className="reunion-banner reunion-banner--today" role="status" aria-live="polite">
        <div className="reunion-banner__content">
          <p className="reunion-banner__eyebrow">Reunión de hoy</p>
          <p className="reunion-banner__title">
            Tenés reunión a las {reunion.hora}
          </p>
          <p className="reunion-banner__meta">{reunion.titulo}</p>
        </div>
        <Link className="reunion-banner__cta" href={alumnaRoutes.reunion}>
          Ver detalles
        </Link>
      </div>
    );
  }

  return (
    <div className="reunion-banner reunion-banner--upcoming" role="status" aria-live="polite">
      <div className="reunion-banner__content">
        <p className="reunion-banner__eyebrow">Próxima reunión</p>
        <p className="reunion-banner__title">
          {formatReunionDate(reunion.fecha)} a las {reunion.hora}
        </p>
      </div>
      <Link className="reunion-banner__link" href={alumnaRoutes.reunion}>
        Ver info
      </Link>
    </div>
  );
}
