"use client";

import { memo } from "react";

export const PanelSkeleton = memo(function PanelSkeleton() {
  return (
    <div className="profe-dashboard" aria-busy="true" aria-label="Cargando panel">
      <div className="profe-dashboard__header">
        <div className="profe-dashboard__skeleton profe-dashboard__skeleton--title" />
      </div>

      <div className="profe-dashboard__metrics">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="profe-dashboard__skeleton-card glass-surface glass-surface--elevated"
          >
            <div className="profe-dashboard__skeleton profe-dashboard__skeleton--line-sm" />
            <div className="profe-dashboard__skeleton profe-dashboard__skeleton--line-lg" />
            <div className="profe-dashboard__skeleton profe-dashboard__skeleton--line-sm" />
          </div>
        ))}
      </div>

      <div className="profe-dashboard__row">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="profe-dashboard__skeleton-card glass-surface glass-surface--elevated"
          >
            <div className="profe-dashboard__skeleton profe-dashboard__skeleton--line-md" />
            {Array.from({ length: 3 }).map((_, row) => (
              <div
                key={row}
                className="profe-dashboard__skeleton profe-dashboard__skeleton--line-sm"
              />
            ))}
          </div>
        ))}
      </div>

      <div className="profe-dashboard__charts">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="profe-dashboard__skeleton-card glass-surface glass-surface--elevated"
          >
            <div className="profe-dashboard__skeleton profe-dashboard__skeleton--line-md" />
            <div className="profe-dashboard__skeleton profe-dashboard__skeleton--chart" />
          </div>
        ))}
      </div>
    </div>
  );
});
