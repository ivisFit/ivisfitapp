import type { ReactNode } from "react";
import { PlanModoRouteGuard } from "@/features/alumna/components/PlanModoRouteGuard";
import { ReunionBanner } from "@/features/alumna/components/ReunionBanner";
import { RoleGuard } from "@/routes/RoleGuard";

export default function AlumnaLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["alumna"]}>
      <PlanModoRouteGuard>
        <ReunionBanner />
        {children}
      </PlanModoRouteGuard>
    </RoleGuard>
  );
}
