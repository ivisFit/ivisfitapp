import type { ReactNode } from "react";
import { RoleGuard } from "@/routes/RoleGuard";

export default function AjustesLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["profe", "alumna"]}>{children}</RoleGuard>
  );
}
