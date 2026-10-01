"use client";

import type { Plan } from "@/features/landing/data/plans";
import type { MouseEvent } from "react";
import { useIncluyenPlanesSlugActions } from "@/features/landing/cms/useIncluyenPlanesSlugActions";

function stopAccordionToggle(event: MouseEvent<HTMLButtonElement>) {
  event.stopPropagation();
}

type CmsIncluyenPlanRemoveButtonProps = {
  index: number;
};

export function CmsIncluyenPlanRemoveButton({ index }: CmsIncluyenPlanRemoveButtonProps) {
  const { isEditing, removePlanAt, canRemovePlan } = useIncluyenPlanesSlugActions();

  if (!isEditing || !canRemovePlan) return null;

  return (
    <button
      type="button"
      className="cms-array-controls__btn cms-array-controls__btn--remove cms-incluyen-planes__remove-plan"
      data-preview-card-chrome
      onClick={(event) => {
        stopAccordionToggle(event);
        removePlanAt(index);
      }}
    >
      Quitar plan
    </button>
  );
}

type CmsIncluyenPlanesAddControlsProps = {
  available: Plan[];
  onAdd: (slug: string) => void;
  isEditing: boolean;
};

export function CmsIncluyenPlanesAddControls({
  available,
  onAdd,
  isEditing,
}: CmsIncluyenPlanesAddControlsProps) {
  if (!isEditing || available.length === 0) return null;

  return (
    <div className="cms-incluyen-planes__add-panel">
      <p className="cms-incluyen-planes__add-label">Agregar plan a la lista</p>
      <div className="cms-incluyen-planes__add-actions">
        {available.map((plan) => (
          <button
            key={plan.id}
            type="button"
            className="cms-array-controls__btn cms-array-controls__btn--add cms-incluyen-planes__add-plan"
            data-preview-card-chrome
            onClick={() => onAdd(plan.id)}
          >
            + {plan.shortTitle || plan.title}
          </button>
        ))}
      </div>
    </div>
  );
}
