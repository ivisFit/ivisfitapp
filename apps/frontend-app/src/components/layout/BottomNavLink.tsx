"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentProps } from "react";
import type { NavIconId } from "@/config/navigation";
import { NavIcon } from "@/components/icons/nav-icons";
import { isNavLinkActive } from "@/lib/nav-active";

interface BottomNavLinkProps {
  href: string;
  label: string;
  icon: NavIconId;
  badgeCount?: number;
}

export function BottomNavLink({
  href,
  label,
  icon,
  badgeCount,
}: BottomNavLinkProps) {
  const pathname = usePathname() ?? "";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const active = mounted ? isNavLinkActive(pathname, href) : false;

  const linkProps: ComponentProps<typeof Link> = {
    href,
    className: active
      ? "app-bottom-nav__link app-bottom-nav__link--active"
      : "app-bottom-nav__link",
  };

  if (active) {
    linkProps["aria-current"] = "page";
  }

  const showBadge = typeof badgeCount === "number" && badgeCount > 0;

  return (
    <Link {...linkProps}>
      <span className="app-bottom-nav__icon">
        <NavIcon id={icon} size={24} />
        {showBadge ? (
          <span className="app-nav-badge" aria-label={`${badgeCount} pendientes`}>
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        ) : null}
      </span>
      <span className="app-bottom-nav__label">{label}</span>
    </Link>
  );
}
