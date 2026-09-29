"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ColorSchemeProvider } from "@/context/ColorSchemeContext";
import { PwaInstallProvider } from "@/context/PwaInstallContext";
import { PwaUpdatePrompt } from "@/components/pwa/PwaUpdatePrompt";
import { QueryProvider } from "@/providers/QueryProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ColorSchemeProvider>
        <QueryProvider>
          <PwaInstallProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <PwaUpdatePrompt />
          </PwaInstallProvider>
        </QueryProvider>
      </ColorSchemeProvider>
    </AuthProvider>
  );
}
