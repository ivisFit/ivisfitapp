"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotificacionesUnread } from "@/features/profe/hooks/useNotificacionesUnread";
import { profeRoutes } from "@/routes/paths";

export function ProfeNotificacionesButton() {
  const { user } = useAuth();
  const pathname = usePathname() ?? "";
  const enabled = user?.role === "profe";
  const count = useNotificacionesUnread(enabled);

  if (!enabled) return null;

  const active =
    pathname === profeRoutes.notificaciones ||
    pathname.startsWith(`${profeRoutes.notificaciones}/`);
  const label =
    count > 0
      ? `Notificaciones, ${count} sin leer`
      : "Notificaciones";

  return (
    <Link
      href={profeRoutes.notificaciones}
      className={
        active
          ? "profe-notificaciones-btn is-active"
          : "profe-notificaciones-btn"
      }
      aria-label={label}
      {...(active ? { "aria-current": "page" as const } : {})}
    >
      <Bell size={18} />
      {count > 0 ? (
        <span className="profe-notificaciones-btn__badge" aria-hidden>
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}
