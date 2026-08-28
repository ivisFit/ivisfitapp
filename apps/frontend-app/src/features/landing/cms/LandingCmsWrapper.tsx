"use client";

import type { ReactNode } from "react";
import { LandingContentProvider } from "@/features/landing/cms/LandingContentProvider";
import type { Plan } from "@/features/landing/data/plans";

type LandingCmsWrapperProps = {
  children: ReactNode;
  plans: Plan[];
  overrides: Record<string, unknown>;
};

export function LandingCmsWrapper({
  children,
  plans,
  overrides,
}: LandingCmsWrapperProps) {
  return (
    <LandingContentProvider plans={plans} overrides={{ es: overrides }}>
      {children}
    </LandingContentProvider>
  );
}
