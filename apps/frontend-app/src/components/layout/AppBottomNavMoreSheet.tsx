"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { NavIcon } from "@/components/icons/nav-icons";
import type { NavItem } from "@/config/navigation";
import { AlumnaSchemeToggle } from "@/components/layout/AlumnaSchemeToggle";
import { PwaInstallButton } from "@/components/pwa/PwaInstallButton";
import { alumnaRoutes } from "@/routes/paths";
import { isNavLinkActive } from "@/lib/nav-active";

type AppBottomNavMoreSheetProps = {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
  mensajesUnread?: number;
  showSchemeToggle?: boolean;
};

function ChevronIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function AppBottomNavMoreSheet({
  open,
  onClose,
  items,
  mensajesUnread = 0,
  showSchemeToggle = true,
}: AppBottomNavMoreSheetProps) {
  const pathname = usePathname() ?? "";
  const panelRef = useRef<HTMLElement>(null);
  const [render, setRender] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setRender(true);
      setClosing(false);
      return;
    }

    if (!render) return;

    setClosing(true);
    const timer = window.setTimeout(() => {
      setRender(false);
      setClosing(false);
    }, 280);

    return () => window.clearTimeout(timer);
  }, [open, render]);

  useEffect(() => {
    if (!render || closing) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusPanel = () => {
      panelRef.current?.focus();
    };
    const frameId = window.requestAnimationFrame(focusPanel);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(frameId);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [render, closing, onClose]);

  if (!render) return null;

  const stateClass = closing
    ? "app-bottom-nav-more-sheet--closing"
    : "app-bottom-nav-more-sheet--open";

  return (
    <>
      <button
        type="button"
        className={`app-bottom-nav-more-sheet__backdrop ${stateClass}`}
        aria-label="Cerrar menú"
        onClick={onClose}
      />
      <section
        ref={panelRef}
        className={`app-bottom-nav-more-sheet__panel ${stateClass}`}
        role="dialog"
        aria-modal="true"
        aria-label="Más opciones"
        tabIndex={-1}
      >
        <header className="app-bottom-nav-more-sheet__header">
          <h2 className="app-bottom-nav-more-sheet__title">Más opciones</h2>
          <div className="app-bottom-nav-more-sheet__header-actions">
            {showSchemeToggle ? <AlumnaSchemeToggle /> : null}
            <button
              type="button"
              className="app-bottom-nav-more-sheet__close"
              onClick={onClose}
              aria-label="Cerrar"
            >
              {"\u00d7"}
            </button>
          </div>
        </header>
        <ul className="app-bottom-nav-more-sheet__list">
          {items.map((item, index) => {
            const active = isNavLinkActive(pathname, item.href);
            const showBadge =
              item.href === alumnaRoutes.mensajes && mensajesUnread > 0;
            return (
              <li
                key={item.href}
                className="app-bottom-nav-more-sheet__list-item"
                style={
                  {
                    "--more-item-delay": `${index * 50 + 40}ms`,
                  } as CSSProperties
                }
              >
                <Link
                  href={item.href}
                  className={
                    active
                      ? "app-bottom-nav-more-sheet__item app-bottom-nav-more-sheet__item--active"
                      : "app-bottom-nav-more-sheet__item"
                  }
                  onClick={onClose}
                  {...(active ? { "aria-current": "page" as const } : {})}
                >
                  <span className="app-bottom-nav-more-sheet__item-icon">
                    <NavIcon id={item.icon} size={22} />
                    {showBadge ? (
                      <span className="app-nav-badge" aria-hidden>
                        {mensajesUnread > 9 ? "9+" : mensajesUnread}
                      </span>
                    ) : null}
                  </span>
                  <span className="app-bottom-nav-more-sheet__item-label">
                    {item.label}
                  </span>
                  <span className="app-bottom-nav-more-sheet__item-chevron">
                    <ChevronIcon />
                  </span>
                </Link>
              </li>
            );
          })}
          <PwaInstallButton
            variant="more"
            onNativePrompt={onClose}
            itemStyle={
              {
                "--more-item-delay": `${items.length * 50 + 40}ms`,
              } as CSSProperties
            }
          />
        </ul>
      </section>
    </>
  );
}
