"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAlimentacionPlan } from "@/features/profe/context/AlimentacionPlanProvider";

export function useAlimentacionStepSave() {
  const router = useRouter();
  const { flushAndSaveIfDirty, persistBeforeNavigation } = useAlimentacionPlan();

  const saveIfNeeded = useCallback(async (): Promise<boolean> => {
    const result = await persistBeforeNavigation();
    return result.ok;
  }, [persistBeforeNavigation]);

  const navigateWithSave = useCallback(
    async (href: string): Promise<boolean> => {
      flushAndSaveIfDirty();
      router.push(href);
      return true;
    },
    [flushAndSaveIfDirty, router],
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
