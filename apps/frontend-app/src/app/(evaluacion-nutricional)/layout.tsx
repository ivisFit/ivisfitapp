import type { ReactNode } from "react";
import { EvaluacionNutricionalShell } from "@/components/layout/EvaluacionNutricionalShell";
import { PlanModoRouteGuard } from "@/features/alumna/components/PlanModoRouteGuard";
import { RoleGuard } from "@/routes/RoleGuard";
import { EvaluacionNutricionalProviders } from "./EvaluacionNutricionalProviders";
import "@/styles/evaluacion-nutricional-shell.css";
import "@/styles/alumna-nutricion.css";
import "@/styles/evaluacion-bridge.css";
import "@/styles/alumna-light-overrides.css";

export default function EvaluacionNutricionalGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <EvaluacionNutricionalProviders>
      <RoleGuard allowedRoles={["alumna"]}>
        <PlanModoRouteGuard>
          <EvaluacionNutricionalShell>{children}</EvaluacionNutricionalShell>
        </PlanModoRouteGuard>
      </RoleGuard>
    </EvaluacionNutricionalProviders>
  );
}
