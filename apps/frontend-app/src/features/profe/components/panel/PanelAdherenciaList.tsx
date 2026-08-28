"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowRight, HeartPulse } from "lucide-react";
import type { PanelAlumnaAtencionItem } from "@/features/profe/types/panel";
import { profeAlumnaDetailRoute } from "@/routes/paths";

type PanelAdherenciaListProps = {
  items: PanelAlumnaAtencionItem[];
};

export const PanelAdherenciaList = memo(function PanelAdherenciaList({
  items,
}: PanelAdherenciaListProps) {
  return (
    <section className="profe-dashboard__card glass-surface glass-surface--elevated">
      <h2 className="profe-dashboard__card-title">
        Alumnas que requieren seguimiento
      </h2>

      {items.length === 0 ? (
        <div className="profe-dashboard__empty-state">
          <HeartPulse size={22} strokeWidth={1.5} aria-hidden />
          <p className="profe-dashboard__empty">
            Ninguna alumna está por debajo del 50% de adherencia. ¡Buen trabajo!
          </p>
        </div>
      ) : (
        <ul className="profe-dashboard__adherencia-list">
          {items.map((item) => (
            <li key={item.id} className="profe-dashboard__adherencia-item">
              <Link
                className="profe-dashboard__adherencia-link"
                href={profeAlumnaDetailRoute(item.id)}
              >
                <span className="profe-dashboard__adherencia-info">
                  <span className="profe-dashboard__adherencia-nombre">
                    {item.nombre}
                  </span>
                  <span className="profe-dashboard__adherencia-bar">
                    <span
                      className="profe-dashboard__adherencia-fill"
                      style={{ width: `${item.adherencia}%` }}
                    />
                  </span>
                </span>
                <span className="profe-dashboard__adherencia-value">
                  {item.adherencia}%
                </span>
                <ArrowRight
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden
                  className="profe-dashboard__adherencia-arrow"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
});
