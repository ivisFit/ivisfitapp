"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { RouteSkeleton } from "@/components/skeletons/AppSkeleton";
import { useAuth } from "@/context/AuthContext";
import { resolveModoPlan } from "@/lib/modo-plan";
import { alumnaRoutes, getHomeRouteForRole } from "@/routes/paths";

function matchesPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isRutinaPath(pathname: string) {
  return (
    matchesPath(pathname, alumnaRoutes.rutina) ||
    matchesPath(pathname, alumnaRoutes.biblioteca)
  );
}

function isAlimentacionPath(pathname: string) {
  return (
    matchesPath(pathname, alumnaRoutes.alimentacion) ||
    matchesPath(pathname, alumnaRoutes.evaluacionNutricional)
  );
}

export function PlanModoRouteGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const modoPlan = user?.role === "alumna" ? resolveModoPlan(user) : "ambos";
  const blocked =
    (modoPlan === "alimentacion" && isRutinaPath(pathname)) ||
    (modoPlan === "rutina" && isAlimentacionPath(pathname));
  const home = getHomeRouteForRole("alumna", { modoPlan });

  useEffect(() => {
    if (!loading && blocked) {
      router.replace(home);
    }
  }, [blocked, home, loading, router]);

  if (loading || blocked) {
    return <RouteSkeleton role="alumna" pathname={home} />;
  }

  return children;
}
