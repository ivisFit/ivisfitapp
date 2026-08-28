"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;

    if (!user) {
      const search = typeof window !== "undefined" ? window.location.search : "";
      const returnTo = `${pathname ?? ""}${search}`;
      router.replace(buildLoginUrl(returnTo));
      return;
    }

    if (user.role === "alumna" && user.admissionStatus !== "admitida") {
      router.replace(publicRoutes.solicitudPendiente);
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.replace(getHomeRouteForRole(user.role));
    }
  }, [allowedRoles, loading, pathname, router, user, mounted]);

  if (!mounted || loading) {
    const skeletonRole: "profe" | "alumna" | "generic" = allowedRoles.includes(
      "profe",
    )
      ? allowedRoles.includes("alumna")
        ? "generic"
        : "profe"
      : "alumna";

    return (
      <div className="app-route-skeleton" suppressHydrationWarning>
        <RouteSkeleton role={skeletonRole} />
      </div>
    );
  }

  if (
    !user ||
    !allowedRoles.includes(user.role) ||
    (user.role === "alumna" && user.admissionStatus !== "admitida")
  ) {
    return null;
  }

  return children;
}
