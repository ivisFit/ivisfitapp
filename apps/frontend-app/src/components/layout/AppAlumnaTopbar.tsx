"use client";

import { AlumnaSchemeToggle } from "@/components/layout/AlumnaSchemeToggle";
import { ProfeNotificacionesButton } from "@/features/profe/components/ProfeNotificacionesButton";
import { PwaInstallButton } from "@/components/pwa/PwaInstallButton";

export function AppAlumnaTopbar() {
  return (
    <header className="app-alumna-topbar">
      <div className="app-alumna-topbar__inner">
        <div className="app-alumna-topbar__actions">
          <PwaInstallButton variant="topbar" />
          <AlumnaSchemeToggle />
          <ProfeNotificacionesButton />
        </div>
      </div>
    </header>
  );
}
