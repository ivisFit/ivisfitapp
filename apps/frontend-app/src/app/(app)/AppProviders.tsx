"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { EvaluacionBridgeProvider } from "@/features/alumna/components/evaluacion-bridge/EvaluacionBridgeProvider";
import { GamificacionToastProvider } from "@/features/gamificacion/components/GamificacionToastProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <EvaluacionBridgeProvider>
        <GamificacionToastProvider>{children}</GamificacionToastProvider>
      </EvaluacionBridgeProvider>
    </ThemeProvider>
  );
}
