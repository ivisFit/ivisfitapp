"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentProps } from "react";
import type { NavIconId } from "@/config/navigation";
import { NavIcon } from "@/components/icons/nav-icons";
import { isNavLinkActive } from "@/lib/nav-active";

interface SidebarNavLinkProps {
  href: string;
  label: string;
  icon: NavIconId;
  onClick?: () => void;
  badgeCount?: number;
}

export function SidebarNavLink({
  href,
  label,
  icon,
  onClick,
  badgeCount,
}: SidebarNavLinkProps) {
  const pathname = usePathname() ?? "";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const active = mounted ? isNavLinkActive(pathname, href) : false;

  const linkProps: ComponentProps<typeof Link> = {
    href,
    className: active
      ? "app-sidebar__link app-sidebar__link--active"
      : "app-sidebar__link",
  };

  if (onClick) {
    linkProps.onClick = onClick;
  }

  if (active) {
    linkProps["aria-current"] = "page";
  }

  const showBadge = typeof badgeCount === "number" && badgeCount > 0;

  return (
    <Link {...linkProps}>
      <span className="app-sidebar__link-icon">
        <NavIcon id={icon} size={20} />
        {showBadge ? (
          <span className="app-nav-badge" aria-label={`${badgeCount} pendientes`}>
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        ) : null}
      </span>
      <span className="app-sidebar__link-label">{label}</span>
    </Link>
  );
}
