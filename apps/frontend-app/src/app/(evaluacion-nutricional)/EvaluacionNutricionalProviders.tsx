"use client";

import type { ReactNode } from "react";
import { EvaluacionBridgeProvider } from "@/features/alumna/components/evaluacion-bridge/EvaluacionBridgeProvider";

export function EvaluacionNutricionalProviders({ children }: { children: ReactNode }) {
  return <EvaluacionBridgeProvider>{children}</EvaluacionBridgeProvider>;
}
