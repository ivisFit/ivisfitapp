"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ColorSchemeProvider } from "@/context/ColorSchemeContext";
import { PwaInstallProvider } from "@/context/PwaInstallContext";
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
          </PwaInstallProvider>
        </QueryProvider>
      </ColorSchemeProvider>
    </AuthProvider>
  );
}
