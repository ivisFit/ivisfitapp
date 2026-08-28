"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NavIcon } from "@/components/icons/nav-icons";
import { AlumnaSchemeToggle } from "@/components/layout/AlumnaSchemeToggle";
import { PwaInstallButton } from "@/components/pwa/PwaInstallButton";
import { UserGreeting } from "@/components/layout/UserGreeting";
import { useAuth } from "@/context/AuthContext";
import { isNavLinkActive } from "@/lib/nav-active";
import { isAlumnaDetailPath, sharedRoutes } from "@/routes/paths";

export function AppMobileHeader() {
  const { user } = useAuth();
  const pathname = usePathname() ?? "";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;

  if (user.role === "alumna" || isAlumnaDetailPath(pathname)) return null;

  const settingsActive = isNavLinkActive(pathname, sharedRoutes.ajustes);

  return (
    <header className="app-mobile-header">
      <UserGreeting className="app-mobile-header__greeting" />

      <div className="app-mobile-header__actions">
        {user.role === "profe" ? <AlumnaSchemeToggle /> : null}
        <PwaInstallButton variant="header" />
        <Link
          href={sharedRoutes.ajustes}
          className={
            settingsActive
              ? "app-mobile-header__settings app-mobile-header__settings--active"
              : "app-mobile-header__settings"
          }
          aria-label="Ajustes"
          {...(settingsActive ? { "aria-current": "page" as const } : {})}
        >
          <NavIcon id="settings" size={24} />
        </Link>
      </div>
    </header>
  );
}

