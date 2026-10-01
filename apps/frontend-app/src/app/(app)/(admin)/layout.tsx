import type { ReactNode } from "react";
import { AppDialogProvider } from "@/components/AppDialogProvider";
import { RoleGuard } from "@/routes/RoleGuard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["profe"]}>
      <AppDialogProvider>{children}</AppDialogProvider>
    </RoleGuard>
  );
}
