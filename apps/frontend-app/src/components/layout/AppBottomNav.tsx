"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  alumnaBottomNav,
  alumnaMobileMoreNav,
  profeBottomNav,
  profeMobileMoreNav,
  type NavItem,
} from "@/config/navigation";
import { AppBottomNavMoreSheet } from "@/components/layout/AppBottomNavMoreSheet";
import { BottomNavLink } from "@/components/layout/BottomNavLink";
import { NavIcon } from "@/components/icons/nav-icons";
import { useAuth } from "@/context/AuthContext";
import { useMensajesUnread } from "@/features/alumna/hooks/useMensajesUnread";
import { useProfeCola } from "@/features/profe/hooks/useProfeCola";
import { isNavLinkActive } from "@/lib/nav-active";
import { sharedRoutes } from "@/routes/paths";

function isMoreNavActive(pathname: string, items: NavItem[]) {
  return items.some((item) => isNavLinkActive(pathname, item.href));
}

export function AppBottomNav() {
  const { user } = useAuth();
  const pathname = usePathname() ?? "";
  const [mounted, setMounted] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { admisionesCount } = useProfeCola(user?.role === "profe");
  const { count: mensajesUnread } = useMensajesUnread(user?.role === "alumna");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  if (!mounted || !user) return null;

  const isAlumna = user.role === "alumna";
  const moreItems = isAlumna ? alumnaMobileMoreNav : profeMobileMoreNav;
  const nav = (isAlumna ? alumnaBottomNav : profeBottomNav).filter(
    (item) => item.href !== sharedRoutes.ajustes,
  );
  const moreActive = isMoreNavActive(pathname, moreItems);
  const showMensajesBadge = isAlumna && mensajesUnread > 0;

  return (
    <div className="app-bottom-nav-wrap">
      <AppBottomNavMoreSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        items={moreItems}
        mensajesUnread={mensajesUnread}
        showSchemeToggle={isAlumna}
      />
      <nav className="app-bottom-nav" aria-label="Navegación móvil">
        {nav.map((item) => (
          <BottomNavLink
            key={item.href}
            href={item.href}
            label={item.shortLabel ?? item.label}
            icon={item.icon}
            badgeCount={
              item.badgeKey === "admisiones" ? admisionesCount : undefined
            }
          />
        ))}
        <button
          type="button"
          className={
            moreActive || moreOpen
              ? "app-bottom-nav__link app-bottom-nav__link--button app-bottom-nav__link--active"
              : "app-bottom-nav__link app-bottom-nav__link--button"
          }
          aria-label="Más opciones"
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((open) => !open)}
        >
          <span className="app-bottom-nav__icon">
            <NavIcon id="more" size={24} />
            {showMensajesBadge ? (
              <span className="app-nav-badge" aria-hidden>
                {mensajesUnread > 9 ? "9+" : mensajesUnread}
              </span>
            ) : null}
          </span>
          <span className="app-bottom-nav__label">Más</span>
        </button>
      </nav>
    </div>
  );
}
