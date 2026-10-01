"use client";

import type { MouseEvent, ReactNode } from "react";
import { useContent } from "@/lib/preview-cms/lib/content-edit/useContent";

function stopAccordionToggle(event: MouseEvent<HTMLButtonElement>) {
  event.stopPropagation();
}

type CmsArrayAddButtonProps = {
  arrayPath: string;
  template: unknown;
  label?: string;
  className?: string;
};

export function CmsArrayAddButton({
  arrayPath,
  template,
  label = "Agregar ítem",
  className,
}: CmsArrayAddButtonProps) {
  const { isEditing, pushArrayItem } = useContent();

  if (!isEditing) return null;

  return (
    <button
      type="button"
      className={className ?? "cms-array-controls__btn cms-array-controls__btn--add"}
      data-preview-card-chrome
      onClick={(event) => {
        stopAccordionToggle(event);
        pushArrayItem(arrayPath, template);
      }}
    >
      {label}
    </button>
  );
}

type CmsArrayRemoveButtonProps = {
  arrayPath: string;
  index: number;
  minItems?: number;
  arrayLength: number;
  label?: string;
  className?: string;
};

export function CmsArrayRemoveButton({
  arrayPath,
  index,
  minItems = 0,
  arrayLength,
  label = "Quitar",
  className,
}: CmsArrayRemoveButtonProps) {
  const { isEditing, removeArrayItem } = useContent();

  if (!isEditing || arrayLength <= minItems) return null;

  return (
    <button
      type="button"
      className={className ?? "cms-array-controls__btn cms-array-controls__btn--remove"}
      data-preview-card-chrome
      aria-label={label}
      onClick={(event) => {
        stopAccordionToggle(event);
        removeArrayItem(arrayPath, index);
      }}
    >
      {label}
    </button>
  );
}

type CmsArrayControlsRowProps = {
  children: ReactNode;
};

export function CmsArrayControlsRow({ children }: CmsArrayControlsRowProps) {
  const { isEditing } = useContent();
  if (!isEditing) return <>{children}</>;
  return <div className="cms-array-controls__row">{children}</div>;
}
