"use client";

import { usePathname } from "next/navigation";
import { RouteSkeleton } from "@/components/skeletons/AppSkeleton";
import { alumnaRoutes, profeRoutes, sharedRoutes } from "@/routes/paths";

function matchesPath(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export default function AppLoading() {
  const pathname = usePathname() ?? "";

  const profePaths = Object.values(profeRoutes);
  const alumnaPaths = Object.values(alumnaRoutes);

  let role: "profe" | "alumna" | "generic" = "generic";

  if (pathname === sharedRoutes.ajustes || pathname.startsWith(`${sharedRoutes.ajustes}/`)) {
    role = "generic";
  } else if (profePaths.some((prefix) => matchesPath(pathname, prefix))) {
    role = "profe";
  } else if (alumnaPaths.some((prefix) => matchesPath(pathname, prefix))) {
    role = "alumna";
  }

  return (
    <div className="app-route-skeleton" suppressHydrationWarning>
      <RouteSkeleton role={role} />
    </div>
  );
}
