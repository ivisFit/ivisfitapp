"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppSidebarSkeleton } from "@/components/skeletons/AppSkeleton";
import { getSidebarNav } from "@/config/navigation";
import { SidebarNavContent } from "@/components/layout/SidebarNavContent";
import { useAuth } from "@/context/AuthContext";
import { useProfeCola } from "@/features/profe/hooks/useProfeCola";
import { publicRoutes } from "@/routes/paths";

export function AppSidebar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { admisionesCount } = useProfeCola(user?.role === "profe");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) return <AppSidebarSkeleton />;

  if (!mounted || !user) return null;

  const nav = getSidebarNav(user.role, {
    circunferenciasHabilitadas: user.circunferenciasHabilitadas ?? undefined,
  });

  async function handleLogout() {
    if (!user) return;

    await logout();
    router.replace(publicRoutes.login);
    router.refresh();
  }

  return (
    <aside className="app-sidebar" aria-label="Navegación principal">
      <SidebarNavContent
        nav={nav}
        onLogout={handleLogout}
        badgeCounts={{ admisiones: admisionesCount }}
      />
    </aside>
  );
}
