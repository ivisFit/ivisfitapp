import type { ReactNode } from "react";
import { AlumnaSchemeToolbar } from "@/components/layout/AlumnaSchemeToggle";
import { RoleGuard } from "@/routes/RoleGuard";
import "@/styles/onboarding.css";
import "@/styles/alumna-light-overrides.css";

export default function BienvenidaGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["alumna"]}>
      <div className="bienvenida-shell">
        <AlumnaSchemeToolbar />
        {children}
      </div>
    </RoleGuard>
  );
}
