import type { ReactNode } from "react";
import { ReunionBanner } from "@/features/alumna/components/ReunionBanner";
import { RoleGuard } from "@/routes/RoleGuard";

export default function AlumnaLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["alumna"]}>
      <ReunionBanner />
      {children}
    </RoleGuard>
  );
}
