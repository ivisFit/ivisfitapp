"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { RouteSkeleton } from "@/components/skeletons/AppSkeleton";
import { useAuth } from "@/context/AuthContext";
import { buildLoginUrl } from "@/routes/auth-redirect";
import { getHomeRouteForRole, publicRoutes } from "@/routes/paths";
import type { UserRole } from "@/types/auth";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const pendingAdmission =
    user?.role === "alumna" && user.admissionStatus !== "admitida";
  const authorized =
    Boolean(user) && !pendingAdmission && allowedRoles.includes(user!.role);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      const returnTo = `${window.location.pathname}${window.location.search}`;
      router.replace(buildLoginUrl(returnTo));
      return;
    }

    if (pendingAdmission) {
      router.replace(publicRoutes.solicitudPendiente);
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.replace(
        getHomeRouteForRole(user.role, {
          soloAlimentacion: user.soloAlimentacion,
        }),
      );
    }
  }, [allowedRoles, loading, pendingAdmission, router, user]);

  if (loading || !authorized) {
    const skeletonRole: "profe" | "alumna" | "generic" = allowedRoles.includes(
      "profe",
    )
      ? allowedRoles.includes("alumna")
        ? "generic"
        : "profe"
      : "alumna";

    return (
      <div className="app-route-skeleton" suppressHydrationWarning>
        <RouteSkeleton role={skeletonRole} pathname={pathname ?? ""} />
      </div>
    );
  }

  return children;
}
