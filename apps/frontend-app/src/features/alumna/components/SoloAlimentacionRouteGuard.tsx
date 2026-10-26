"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { RouteSkeleton } from "@/components/skeletons/AppSkeleton";
import { useAuth } from "@/context/AuthContext";
import { alumnaRoutes } from "@/routes/paths";

function isRutinaPath(pathname: string) {
  return (
    pathname === alumnaRoutes.rutina ||
    pathname.startsWith(`${alumnaRoutes.rutina}/`) ||
    pathname === alumnaRoutes.progreso ||
    pathname.startsWith(`${alumnaRoutes.progreso}/`)
  );
}

export function SoloAlimentacionRouteGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const blocked = user?.soloAlimentacion === true && isRutinaPath(pathname);

  useEffect(() => {
    if (!loading && blocked) {
      router.replace(alumnaRoutes.alimentacion);
    }
  }, [blocked, loading, router]);

  if (loading || blocked) {
    return <RouteSkeleton role="alumna" pathname={alumnaRoutes.alimentacion} />;
  }

  return children;
}
