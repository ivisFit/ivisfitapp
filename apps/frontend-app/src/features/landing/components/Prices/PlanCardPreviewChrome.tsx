"use client";

import { useContent } from "@/lib/preview-cms/lib/content-edit/useContent";

type PlanCardPreviewChromeProps = {
  slug: string;
  fallbackActive: boolean;
};

function planActivePath(slug: string) {
  return `planes.bySlug.${slug}.isActive`;
}

export function PlanCardPreviewChrome({
  slug,
  fallbackActive,
}: PlanCardPreviewChromeProps) {
  const { bool, setValue } = useContent();
  const path = planActivePath(slug);
  const isActive = bool(path) ?? fallbackActive;

  return (
    <div
      className="plan-card-preview-chrome"
      data-preview-card-chrome
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <span
        className={
          isActive
            ? "plan-card-preview-chrome__status plan-card-preview-chrome__status--active"
            : "plan-card-preview-chrome__status"
        }
      >
        {isActive ? "Activo" : "Inactivo"}
      </span>
      <label className="toggle plan-card-preview-chrome__toggle">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => setValue(path, event.target.checked)}
          aria-label={`${isActive ? "Desactivar" : "Activar"} plan ${slug}`}
        />
        <span className="toggle-slider" />
      </label>
      <span className="plan-card-preview-chrome__hint">
        Clic en el fondo para cambiar imagen
      </span>
    </div>
  );
}
