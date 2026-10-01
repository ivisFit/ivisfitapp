"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAlimentacionPlan } from "@/features/profe/context/AlimentacionPlanProvider";

export function useAlimentacionStepSave() {
  const router = useRouter();
  const { hasUnsavedChanges, saveDraft } = useAlimentacionPlan();

  const saveIfNeeded = useCallback(async () => {
    if (!hasUnsavedChanges) return;
    await saveDraft();
  }, [hasUnsavedChanges, saveDraft]);

  const navigateWithSave = useCallback(
    async (href: string) => {
      await saveIfNeeded();
      router.push(href);
    },
    [router, saveIfNeeded],
  );

  const handleStepLinkClick = useCallback(
    (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      event.preventDefault();
      void navigateWithSave(href);
    },
    [navigateWithSave],
  );

  return { saveIfNeeded, navigateWithSave, handleStepLinkClick };
}
