"use client";

import type { ReactNode } from "react";
import { AppDialogProvider } from "@/components/AppDialogProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import { EvaluacionBridgeProvider } from "@/features/alumna/components/evaluacion-bridge/EvaluacionBridgeProvider";
import { GamificacionToastProvider } from "@/features/gamificacion/components/GamificacionToastProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AppDialogProvider>
        <EvaluacionBridgeProvider>
          <GamificacionToastProvider>{children}</GamificacionToastProvider>
        </EvaluacionBridgeProvider>
      </AppDialogProvider>
    </ThemeProvider>
  );
}
