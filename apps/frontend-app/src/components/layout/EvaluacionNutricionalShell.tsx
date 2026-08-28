import type { ReactNode } from "react";
import { AlumnaSchemeToolbar } from "@/components/layout/AlumnaSchemeToggle";

type EvaluacionNutricionalShellProps = {
  children: ReactNode;
};

export function EvaluacionNutricionalShell({
  children,
}: EvaluacionNutricionalShellProps) {
  return (
    <div className="evaluacion-nutricional-shell">
      <AlumnaSchemeToolbar />
      <div className="evaluacion-nutricional-shell__inner">{children}</div>
    </div>
  );
}
