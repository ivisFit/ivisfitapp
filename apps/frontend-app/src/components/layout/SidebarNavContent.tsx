"use client";

import type { NavItem } from "@/config/navigation";
import { NavIcon } from "@/components/icons/nav-icons";
import { SidebarNavLink } from "@/components/layout/SidebarNavLink";
import { UserGreeting } from "@/components/layout/UserGreeting";
import type { AuthUser } from "@/types/auth";

interface SidebarNavContentProps {
  nav: NavItem[];
  activeHref?: string;
  interactive?: boolean;
  onLogout?: () => void;
  frozenUser?: AuthUser;
  getItemOpacity?: (index: number) => number;
  greetingOpacity?: number;
  logoutOpacity?: number;
  badgeCounts?: Partial<Record<NonNullable<NavItem["badgeKey"]>, number>>;
}

export function SidebarNavContent({
  nav,
  activeHref,
  interactive = true,
  onLogout,
  frozenUser,
  getItemOpacity,
  greetingOpacity,
  logoutOpacity,
  badgeCounts,
}: SidebarNavContentProps) {
  return (
    <>
      <div
        className="app-sidebar__greeting login-enter__sidebar-greeting"
        style={
          greetingOpacity !== undefined
            ? { opacity: greetingOpacity }
            : undefined
        }
      >
        <UserGreeting frozenUser={frozenUser} />
      </div>

      <nav className="app-sidebar__nav">
        {nav.map((item, index) => {
          const itemOpacity = getItemOpacity?.(index);
          const isActive = activeHref === item.href;
          const badgeCount = item.badgeKey
            ? badgeCounts?.[item.badgeKey]
            : undefined;

          if (interactive) {
            return (
              <SidebarNavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                badgeCount={badgeCount}
              />
            );
          }

          return (
            <span
              key={item.href}
              className={
                isActive
                  ? "app-sidebar__link app-sidebar__link--active login-enter__sidebar-link"
                  : "app-sidebar__link login-enter__sidebar-link"
              }
              style={
                itemOpacity !== undefined ? { opacity: itemOpacity } : undefined
              }
              aria-hidden
            >
              <span className="app-sidebar__link-icon">
                <NavIcon id={item.icon} size={20} />
              </span>
              <span className="app-sidebar__link-label">{item.label}</span>
            </span>
          );
        })}
      </nav>

      <div className="app-sidebar__footer">
        {interactive ? (
          <button
            type="button"
            className="app-sidebar__logout"
            onClick={onLogout}
          >
            <NavIcon id="logout" size={18} />
            <span>Cerrar sesión</span>
          </button>
        ) : (
          <div
            className="app-sidebar__logout login-enter__sidebar-logout"
            style={
              logoutOpacity !== undefined ? { opacity: logoutOpacity } : undefined
            }
            aria-hidden
          >
            <NavIcon id="logout" size={18} />
            <span>Cerrar sesión</span>
          </div>
        )}
      </div>
    </>
  );
}
