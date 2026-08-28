"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { NavIcon } from "@/components/icons/nav-icons";
import { alumnaMobileMoreNav } from "@/config/navigation";
import { AlumnaSchemeToggle } from "@/components/layout/AlumnaSchemeToggle";
import { PwaInstallButton } from "@/components/pwa/PwaInstallButton";
import { alumnaRoutes } from "@/routes/paths";
import { isNavLinkActive } from "@/lib/nav-active";

type AppBottomNavMoreSheetProps = {
  open: boolean;
  onClose: () => void;
  mensajesUnread?: number;
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
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function AppBottomNavMoreSheet({
  open,
  onClose,
  mensajesUnread = 0,
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
    }, 340);

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

  if (!render || typeof document === "undefined") return null;

  const sheetClassName = [
    "app-bottom-nav-more-sheet",
    closing
      ? "app-bottom-nav-more-sheet--closing"
      : "app-bottom-nav-more-sheet--open",
  ].join(" ");

  return createPortal(
    <div className={sheetClassName}>
      <button
        type="button"
        className="app-bottom-nav-more-sheet__backdrop"
        aria-label="Cerrar menú"
        onClick={onClose}
      />
      <section
        ref={panelRef}
        className="app-bottom-nav-more-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Más opciones"
        tabIndex={-1}
      >
        <div className="app-bottom-nav-more-sheet__ambient" aria-hidden="true">
          <span className="app-bottom-nav-more-sheet__glow app-bottom-nav-more-sheet__glow--gold" />
          <span className="app-bottom-nav-more-sheet__glow app-bottom-nav-more-sheet__glow--warm" />
        </div>
        <div className="app-bottom-nav-more-sheet__handle" aria-hidden="true" />
        <header className="app-bottom-nav-more-sheet__header">
          <h2 className="app-bottom-nav-more-sheet__title">Más opciones</h2>
          <div className="app-bottom-nav-more-sheet__header-actions">
            <AlumnaSchemeToggle />
            <button
              type="button"
              className="app-bottom-nav-more-sheet__close"
              onClick={onClose}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </header>
        <ul className="app-bottom-nav-more-sheet__list">
          {alumnaMobileMoreNav.map((item, index) => {
            const active = isNavLinkActive(pathname, item.href);
            const showBadge =
              item.href === alumnaRoutes.mensajes && mensajesUnread > 0;
            const reverseIndex = alumnaMobileMoreNav.length - 1 - index;

            return (
              <li
                key={item.href}
                className="app-bottom-nav-more-sheet__list-item"
                style={
                  {
                    "--more-item-delay": `${reverseIndex * 60 + 80}ms`,
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
                  <span className="app-bottom-nav-more-sheet__item-chevron">
                    <ChevronIcon />
                  </span>
                  <span className="app-bottom-nav-more-sheet__item-label">
                    {item.label}
                  </span>
                  <span className="app-bottom-nav-more-sheet__item-icon">
                    <NavIcon id={item.icon} size={22} />
                    {showBadge ? (
                      <span className="app-nav-badge" aria-hidden>
                        {mensajesUnread > 9 ? "9+" : mensajesUnread}
                      </span>
                    ) : null}
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
                "--more-item-delay": "80ms",
              } as CSSProperties
            }
          />
        </ul>
      </section>
    </div>,
    document.body,
  );
}
