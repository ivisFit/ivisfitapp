import type { ReactNode } from "react";
import { AlumnaSchemeToolbar } from "@/components/layout/AlumnaSchemeToggle";
import { RoleGuard } from "@/routes/RoleGuard";
import "@/styles/tutoriales.css";
import "@/styles/alumna-light-overrides.css";

export default function TutorialesGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["alumna"]}>
      <div className="tutoriales-shell">
        <AlumnaSchemeToolbar />
        {children}
      </div>
    </RoleGuard>
  );
}
