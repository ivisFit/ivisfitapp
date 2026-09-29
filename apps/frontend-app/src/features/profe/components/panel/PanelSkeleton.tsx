"use client";

import { memo } from "react";

export const PanelSkeleton = memo(function PanelSkeleton() {
  return (
    <div className="profe-dashboard" aria-busy="true" aria-label="Cargando panel">
      <div className="profe-dashboard__header">
        <div className="sk-header">
          <span className="sk sk--xl sk--gold sk--w-48" />
          <span className="sk sk--sm sk--w-40" />
        </div>
      </div>

      <div className="profe-dashboard__metrics">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="profe-dashboard__skeleton-card glass-surface glass-surface--elevated sk--metric-card"
          >
            <span className="sk sk--xs sk--w-50" />
            <span className="sk sk--2xl sk--gold sk--w-60" />
            <span className="sk sk--xs sk--w-40" />
            <span className="sk sk--sm sk--full" style={{ height: "2rem", marginTop: "0.25rem" }} />
          </div>
        ))}
      </div>

      <div className="profe-dashboard__row">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="profe-dashboard__skeleton-card glass-surface glass-surface--elevated"
          >
            <div className="sk-card__head">
              <span className="sk sk--sm sk--gold sk--w-40" />
            </div>
            {Array.from({ length: 3 }).map((_, row) => (
              <div key={row} className="sk--avatar-list-item">
                <span className="sk sk--avatar-sm" />
                <div className="sk--avatar-list-item__text">
                  <span className="sk sk--sm sk--w-75" />
                  <span className="sk sk--xs sk--w-40" />
                </div>
              </div>
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
            <div className="sk-card__head">
              <span className="sk sk--sm sk--gold sk--w-48" />
            </div>
            <div className="sk-chart-body sk-chart-body--chart-md">
              {[42, 68, 55, 82, 48, 72, 38, 64].map((height, bar) => (
                <span
                  key={bar}
                  className="sk sk--gold sk-chart-body__bar"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
