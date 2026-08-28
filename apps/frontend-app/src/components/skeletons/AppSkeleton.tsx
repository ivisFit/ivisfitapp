"use client";

import { memo } from "react";
import { PanelSkeleton } from "@/features/profe/components/panel/PanelSkeleton";

/**
 * Primitivas de skeleton del app. Reutilizan las clases `.sk` de
 * `app-skeletons.css` para mantener el mismo lenguaje visual del shell.
 */

type SkeletonLineProps = {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  width?: "w-25" | "w-32" | "w-40" | "w-48" | "w-50" | "w-56" | "w-60" | "w-75" | "w-90" | "full";
  gold?: boolean;
  pill?: boolean;
  className?: string;
};

export function SkeletonLine({
  size = "md",
  width = "w-75",
  gold = false,
  pill = false,
  className = "",
}: SkeletonLineProps) {
  const classes = [
    "sk",
    `sk--${size}`,
    `sk--${width}`,
    gold ? "sk--gold" : "",
    pill ? "sk--pill" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <span className={classes} aria-hidden />;
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <span className={`sk sk--block ${className}`} aria-hidden />;
}

export function SkeletonCard({
  elevated = false,
  className = "",
  children,
}: {
  elevated?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`${elevated ? "sk--card-elevated" : "sk--card"} ${className}`}
      aria-hidden
    >
      {children}
    </div>
  );
}

export function CardSkeleton({
  lines = 3,
  elevated = false,
}: {
  lines?: number;
  elevated?: boolean;
}) {
  return (
    <SkeletonCard elevated={elevated}>
      <SkeletonLine size="md" width="w-40" gold />
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLine
          key={index}
          size={index === 0 ? "lg" : "sm"}
          width={index === 0 ? "w-90" : index % 2 === 0 ? "w-60" : "w-75"}
        />
      ))}
    </SkeletonCard>
  );
}

export function ListSkeleton({
  items = 4,
  withAvatar = false,
  className = "",
}: {
  items?: number;
  withAvatar?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className={withAvatar ? "sk--avatar-list-item" : "sk--row"}
          style={{ padding: withAvatar ? undefined : "0.5rem 0" }}
          aria-hidden
        >
          {withAvatar ? <span className="sk sk--avatar-sm" /> : null}
          <SkeletonLine size="md" width="w-90" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = "chart" }: { height?: "chart" | "chart-md" }) {
  return (
    <div className="sk--card-elevated" aria-hidden>
      <SkeletonLine size="md" width="w-40" gold />
      <span className={`sk sk--${height} sk--full`} />
    </div>
  );
}

export function TableSkeleton({
  rows = 4,
  columns = ["2rem", "1fr", "6rem"],
}: {
  rows?: number;
  columns?: string[];
}) {
  return (
    <div aria-hidden>
      <div
        className="sk--table-row"
        style={{ gridTemplateColumns: columns.join(" ") }}
      >
        <span className="sk sk--sm sk--w-40" />
        <SkeletonLine size="md" width="w-75" />
        <span className="sk sk--sm sk--w-75" />
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="sk--table-row"
          style={{ gridTemplateColumns: columns.join(" ") }}
        >
          <span className="sk sk--circle sk--avatar-sm" />
          <SkeletonLine size="md" width="w-90" />
          <span className="sk sk--pill sk--sm sk--w-75" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className="sk--row" style={{ gap: "1rem" }} aria-hidden>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="sk--row">
          <SkeletonLine size="sm" width="w-40" />
          <span className="sk sk--input" />
        </div>
      ))}
      <span className="sk sk--button" />
    </div>
  );
}

export function HeroSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <div className="sk sk--hero">
        <SkeletonLine size="lg" width="w-40" gold />
      </div>
      <div style={{ display: "grid", gap: "0.625rem", paddingTop: "1rem" }}>
        <SkeletonLine size="md" width="w-60" />
        <SkeletonLine size="sm" width="w-90" />
      </div>
    </div>
  );
}

export function InlineSkeleton({
  lines = 2,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={className} style={{ display: "grid", gap: "0.75rem" }} aria-hidden>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLine key={index} size={index === 0 ? "lg" : "md"} width="w-90" />
      ))}
    </div>
  );
}

/* Skeleton del sidebar (desktop) mientras resuelve la sesión */
export const AppSidebarSkeleton = memo(function AppSidebarSkeleton() {
  return (
    <aside
      className="app-sidebar app-sidebar--skeleton"
      aria-label="Cargando navegación"
    >
      <div className="app-sidebar-skeleton__greeting">
        <span className="sk sk--avatar" aria-hidden />
        <div style={{ display: "grid", gap: "0.5rem", minWidth: 0 }}>
          <SkeletonLine size="md" width="w-90" />
          <SkeletonLine size="sm" width="w-60" />
        </div>
      </div>

      <div className="app-sidebar-skeleton__nav">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="app-sidebar-skeleton__link">
            <span className="sk sk--gold sk--pill app-sidebar-skeleton__link-icon" />
            <SkeletonLine size="md" width={index % 3 === 0 ? "w-75" : "w-50"} />
          </div>
        ))}
      </div>

      <div className="app-sidebar-skeleton__footer">
        <span className="sk sk--pill sk--button sk--full" />
      </div>
    </aside>
  );
});

/* Home de la alumna (/rutina) */
export const AlumnaRutinaSkeleton = memo(function AlumnaRutinaSkeleton() {
  return (
    <div className="alumna-rutina-skeleton" aria-busy="true" aria-label="Cargando rutina">
      <div className="sk sk--banner sk--gold" aria-hidden />

      <section className="feature-card alumna-rutina alumna-rutina--experience">
        <div className="alumna-rutina__tabs" aria-hidden>
          <span className="sk sk--tab" />
          <span className="sk sk--tab" />
        </div>

        <div className="sk--card-elevated" aria-hidden>
          <SkeletonLine size="md" width="w-60" gold />
          <span className="sk sk--block sk--full" />
          <SkeletonLine size="sm" width="w-90" />
          <SkeletonLine size="sm" width="w-75" />
          <span className="sk sk--button" />
        </div>

        <div className="sk--card" aria-hidden>
          <SkeletonLine size="md" width="w-40" gold />
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="sk--avatar-list-item"
              style={{ gridTemplateColumns: "2.75rem 1fr 4rem" }}
            >
              <span className="sk sk--avatar-sm" />
              <SkeletonLine size="md" width="w-90" />
              <span className="sk sk--pill sk--sm sk--w-75" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
});

/* Página de ajustes */
export const SettingsSkeleton = memo(function SettingsSkeleton() {
  return (
    <div className="page" aria-busy="true" aria-label="Cargando ajustes">
      <SkeletonLine size="2xl" width="w-40" gold />

      <div className="sk--card-elevated" aria-hidden>
        <SkeletonLine size="md" width="w-40" gold />
        <SkeletonLine size="sm" width="w-60" />
        <div className="sk--avatar-list-item" style={{ gridTemplateColumns: "4rem 1fr" }}>
          <span className="sk sk--avatar" />
          <div style={{ display: "grid", gap: "0.5rem" }}>
            <SkeletonLine size="md" width="w-75" />
            <SkeletonLine size="sm" width="w-50" />
          </div>
        </div>
      </div>

      <div className="sk--card-elevated" aria-hidden>
        <SkeletonLine size="md" width="w-40" gold />
        <SkeletonLine size="sm" width="w-75" />
        <FormSkeleton fields={3} />
      </div>
    </div>
  );
});

/* Skeleton genérico de página (lista + tarjetas) */
export const GenericPageSkeleton = memo(function GenericPageSkeleton() {
  return (
    <div className="page" aria-busy="true" aria-label="Cargando página">
      <SkeletonLine size="2xl" width="w-40" gold />
      <SkeletonLine size="sm" width="w-60" />
      <CardSkeleton lines={3} elevated />
      <CardSkeleton lines={2} elevated />
      <CardSkeleton lines={4} elevated />
    </div>
  );
});

/* Skeleton por rol para la carga inicial del shell */
export function RouteSkeleton({ role }: { role: "profe" | "alumna" | "generic" }) {
  if (role === "profe") return <PanelSkeleton />;
  if (role === "alumna") return <AlumnaRutinaSkeleton />;
  return <GenericPageSkeleton />;
}
