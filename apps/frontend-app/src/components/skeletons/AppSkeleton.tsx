"use client";

import { memo, type ReactNode } from "react";
import { IvisContentLoader } from "@/components/IvisContentLoader";

/**
 * Primitivas de skeleton del app. Reutilizan las clases `.sk` de
 * `app-skeletons.css` para mantener el mismo lenguaje visual del shell.
 */

type SkeletonWidth =
  | "w-25"
  | "w-32"
  | "w-40"
  | "w-48"
  | "w-50"
  | "w-56"
  | "w-60"
  | "w-75"
  | "w-90"
  | "full";

type SkeletonLineProps = {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  width?: SkeletonWidth;
  gold?: boolean;
  pill?: boolean;
  className?: string;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function SkeletonLine({
  size = "md",
  width = "w-75",
  gold = false,
  pill = false,
  className = "",
}: SkeletonLineProps) {
  return (
    <span
      className={cx(
        "sk",
        `sk--${size}`,
        `sk--${width}`,
        gold && "sk--gold",
        pill && "sk--pill",
        className,
      )}
      aria-hidden
    />
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <span className={cx("sk", "sk--block", className)} aria-hidden />;
}

export function SkeletonStack({
  className = "",
  tight = false,
  children,
  ...aria
}: {
  className?: string;
  tight?: boolean;
  children?: ReactNode;
  "aria-busy"?: boolean;
  "aria-label"?: string;
}) {
  return (
    <div
      className={cx("sk-stack", tight && "sk-stack--tight", className)}
      {...aria}
    >
      {children}
    </div>
  );
}

export function PageHeaderSkeleton({
  titleWidth = "w-40",
  subtitle = true,
  subtitleWidth = "w-60",
  eyebrow = false,
}: {
  titleWidth?: SkeletonWidth;
  subtitle?: boolean;
  subtitleWidth?: SkeletonWidth;
  eyebrow?: boolean;
}) {
  return (
    <header className="sk-header" aria-hidden>
      {eyebrow ? <span className="sk sk--xs sk--gold sk--pill sk--w-32" /> : null}
      <SkeletonLine size="xl" width={titleWidth} gold />
      {subtitle ? <SkeletonLine size="sm" width={subtitleWidth} /> : null}
    </header>
  );
}

export function SkeletonCard({
  elevated = false,
  className = "",
  children,
}: {
  elevated?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(elevated ? "sk--card-elevated" : "sk--card", className)}
      aria-hidden
    >
      {children}
    </div>
  );
}

const CARD_LINE_WIDTHS: SkeletonWidth[] = ["w-90", "w-75", "w-60", "w-75", "w-50"];

export function CardSkeleton({
  lines = 3,
  elevated = false,
}: {
  lines?: number;
  elevated?: boolean;
}) {
  return (
    <SkeletonCard elevated={elevated}>
      <div className="sk-card__head">
        <SkeletonLine size="sm" width="w-32" gold />
      </div>
      <div className="sk-card__body">
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonLine
            key={index}
            size="sm"
            width={CARD_LINE_WIDTHS[index % CARD_LINE_WIDTHS.length]}
          />
        ))}
      </div>
    </SkeletonCard>
  );
}

export function ListSkeleton({
  items = 4,
  withAvatar = false,
  surface = true,
  className = "",
}: {
  items?: number;
  withAvatar?: boolean;
  surface?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cx("sk--list", surface && "sk--card", className)}
      aria-hidden
    >
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className={withAvatar ? "sk--avatar-list-item" : "sk--list-item"}
        >
          {withAvatar ? <span className="sk sk--avatar-sm" /> : null}
          <div
            className={
              withAvatar ? "sk--avatar-list-item__text" : "sk--list-item__text"
            }
          >
            <SkeletonLine size="md" width={index % 2 === 0 ? "w-75" : "w-60"} />
            <SkeletonLine size="sm" width={index % 3 === 0 ? "w-50" : "w-40"} />
          </div>
          <span className="sk sk--chip sk--pill" />
        </div>
      ))}
    </div>
  );
}

const CHART_BAR_HEIGHTS = [42, 68, 55, 82, 48, 72, 38, 64];

export function ChartSkeleton({ height = "chart" }: { height?: "chart" | "chart-md" }) {
  return (
    <SkeletonCard elevated>
      <div className="sk-card__head">
        <SkeletonLine size="sm" width="w-40" gold />
        <SkeletonLine size="xs" width="w-56" />
      </div>
      <div className={cx("sk-chart-body", height === "chart-md" && "sk-chart-body--chart-md")}>
        {CHART_BAR_HEIGHTS.map((barHeight, index) => (
          <span
            key={index}
            className="sk sk--gold sk-chart-body__bar"
            style={{ height: `${barHeight}%` }}
          />
        ))}
      </div>
    </SkeletonCard>
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
    <div className="sk--table" aria-hidden>
      <div
        className="sk--table-row"
        style={{ gridTemplateColumns: columns.join(" ") }}
      >
        <span className="sk sk--xs sk--w-40" />
        <SkeletonLine size="xs" width="w-32" />
        <span className="sk sk--xs sk--w-50" />
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="sk--table-row"
          style={{ gridTemplateColumns: columns.join(" ") }}
        >
          <span className="sk sk--sm sk--w-75" />
          <SkeletonLine size="sm" width="w-90" />
          <span className="sk sk--pill sk--xs sk--w-75" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton({
  fields = 3,
  showButton = true,
}: {
  fields?: number;
  showButton?: boolean;
}) {
  return (
    <div className="sk-form" aria-hidden>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="sk-field">
          <SkeletonLine size="xs" width={index % 2 === 0 ? "w-32" : "w-40"} />
          <span className="sk sk--input" />
        </div>
      ))}
      {showButton ? (
        <div className="sk-form__actions">
          <span className="sk sk--button sk--gold sk--pill" />
        </div>
      ) : null}
    </div>
  );
}

export function HeroSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <span className="sk sk--hero sk--full" />
      <div className="sk-header" style={{ paddingTop: "1rem" }}>
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
    <div className={cx("sk-card__body", className)} aria-hidden>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLine
          key={index}
          size={index === 0 ? "md" : "sm"}
          width={index === 0 ? "w-75" : "w-90"}
        />
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
        <div className="sk-header">
          <SkeletonLine size="md" width="w-90" />
          <SkeletonLine size="sm" width="w-60" />
        </div>
      </div>

      <div className="app-sidebar-skeleton__nav">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="app-sidebar-skeleton__link">
            <span className="sk sk--gold sk--pill app-sidebar-skeleton__link-icon" />
            <SkeletonLine size="sm" width={index % 3 === 0 ? "w-75" : "w-50"} />
          </div>
        ))}
      </div>

      <div className="app-sidebar-skeleton__footer">
        <span className="sk sk--pill sk--button sk--full" />
      </div>
    </aside>
  );
});

export const AlumnaRutinaSkeleton = memo(function AlumnaRutinaSkeleton() {
  return <IvisContentLoader label="Cargando rutina" />;
});

export const AlumnaAlimentacionSkeleton = memo(function AlumnaAlimentacionSkeleton() {
  return <IvisContentLoader label="Cargando alimentación" />;
});

export const AlumnaProgresoSkeleton = memo(function AlumnaProgresoSkeleton() {
  return <IvisContentLoader label="Cargando progreso" />;
});

export const SettingsSkeleton = memo(function SettingsSkeleton() {
  return <IvisContentLoader label="Cargando ajustes" />;
});

export const GenericPageSkeleton = memo(function GenericPageSkeleton() {
  return <IvisContentLoader label="Cargando página" />;
});

type RouteSkeletonRole = "profe" | "alumna" | "generic";

function routeLoaderLabel(pathname: string): string {
  if (pathname.includes("/ajustes")) return "Cargando ajustes";
  if (pathname.includes("/panel")) return "Cargando panel";
  if (pathname.includes("/rutina")) return "Cargando rutina";
  if (
    pathname.includes("/alimentacion") ||
    pathname.includes("/evaluacion-nutricional")
  ) {
    return "Cargando alimentación";
  }
  if (
    pathname.includes("/progreso") ||
    pathname.includes("/circunferencias") ||
    pathname.includes("/pliegues")
  ) {
    return "Cargando progreso";
  }
  return "Cargando";
}

export function RouteSkeleton({
  role,
  pathname = "",
}: {
  role: RouteSkeletonRole;
  pathname?: string;
}) {
  return (
    <IvisContentLoader
      label={routeLoaderLabel(pathname)}
      seed={`${role}:${pathname}`}
    />
  );
}
