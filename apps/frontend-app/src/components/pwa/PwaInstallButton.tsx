"use client";

import type { CSSProperties } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/Button";
import { usePwaInstall } from "@/hooks/usePwaInstall";

type PwaInstallButtonProps = {
  variant: "topbar" | "header" | "more" | "landing" | "card" | "text";
  className?: string;
  itemStyle?: CSSProperties;
  onNativePrompt?: () => void;
};

function MoreChevronIcon() {
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

export function PwaInstallButton({
  variant,
  className,
  itemStyle,
  onNativePrompt,
}: PwaInstallButtonProps) {
  const { isReady, isInstalled, install } = usePwaInstall();

  if (!isReady || isInstalled) return null;

  async function handleClick() {
    const outcome = await install();
    if (outcome === "prompted") {
      onNativePrompt?.();
    }
  }

  if (variant === "header") {
    return (
      <div className="app-mobile-header__install-wrap">
        <button
          type="button"
          className="app-mobile-header__install"
          onClick={() => void handleClick()}
          aria-label="Descarga la app"
        >
          <Download size={22} aria-hidden />
        </button>
      </div>
    );
  }

  if (variant === "more") {
    return (
      <li className="app-bottom-nav-more-sheet__list-item" style={itemStyle}>
        <button
          type="button"
          className="app-bottom-nav-more-sheet__item app-bottom-nav-more-sheet__item--button"
          onClick={() => void handleClick()}
        >
          <span className="app-bottom-nav-more-sheet__item-chevron">
            <MoreChevronIcon />
          </span>
          <span className="app-bottom-nav-more-sheet__item-label">
            Descargar la app
          </span>
          <span className="app-bottom-nav-more-sheet__item-icon">
            <Download size={22} aria-hidden />
          </span>
        </button>
      </li>
    );
  }

  if (variant === "landing") {
    return (
      <button
        type="button"
        className={[
          "landing-auth-btn",
          "landing-auth-btn--login",
          "pwa-install-cta",
          "pwa-install-cta--icon",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => void handleClick()}
        aria-label="Descargar la app"
      >
        <Download size={20} aria-hidden />
      </button>
    );
  }

  if (variant === "card") {
    return (
      <Button type="button" onClick={() => void handleClick()}>
        Descargar la app
      </Button>
    );
  }

  if (variant === "text") {
    return (
      <button
        type="button"
        className={["auth-link", "auth-link-button", "pwa-install-cta", className]
          .filter(Boolean)
          .join(" ")}
        onClick={() => void handleClick()}
      >
        Descargar la app
      </button>
    );
  }

  return (
    <div className="app-alumna-topbar__download-wrap">
      <button
        type="button"
        className="app-alumna-topbar__download"
        onClick={() => void handleClick()}
      >
        <Download size={16} aria-hidden />
        <span>Descarga la app</span>
      </button>
    </div>
  );
}

export function PwaInstallSettingsCard() {
  const { isReady, isInstalled, install } = usePwaInstall();

  if (!isReady || isInstalled) return null;

  return (
    <div className="feature-card pwa-install-settings">
      <h2>Instalar la app</h2>
      <p>Agregá IVIS Fit a tu celular o computadora para abrirla como una app.</p>
      <Button type="button" onClick={() => void install()}>
        Descargar la app
      </Button>
    </div>
  );
}
