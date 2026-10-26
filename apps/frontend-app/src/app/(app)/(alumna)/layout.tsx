import type { ReactNode } from "react";
import { SoloAlimentacionRouteGuard } from "@/features/alumna/components/SoloAlimentacionRouteGuard";
import { ReunionBanner } from "@/features/alumna/components/ReunionBanner";
import { RoleGuard } from "@/routes/RoleGuard";

export default function AlumnaLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["alumna"]}>
      <SoloAlimentacionRouteGuard>
        <ReunionBanner />
        {children}
      </SoloAlimentacionRouteGuard>
    </RoleGuard>
  );
}
