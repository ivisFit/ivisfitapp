import type { ReactNode } from "react";
import { RoleGuard } from "@/routes/RoleGuard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RoleGuard allowedRoles={["profe"]}>{children}</RoleGuard>;
}
