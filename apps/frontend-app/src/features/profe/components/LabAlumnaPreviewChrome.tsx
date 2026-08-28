"use client";

import type { ReactNode } from "react";
import { NavIcon } from "@/components/icons/nav-icons";
import { alumnaNav } from "@/config/navigation";
import { sharedRoutes } from "@/routes/paths";

type LabAlumnaPreviewChromeProps = {
  variant: "mobile" | "desktop";
  children: ReactNode;
};

const previewNavItems = alumnaNav.filter(
  (item) => item.href !== sharedRoutes.ajustes,
);

function LabPreviewBottomNav() {
  return (
    <div className="plan-content-lab__bottom-nav-wrap" aria-hidden>
      <nav className="plan-content-lab__bottom-nav">
        {previewNavItems.map((item) => {
          const isActive = item.icon === "routine";
          return (
            <span
              key={item.href}
              className={
                isActive
                  ? "plan-content-lab__bottom-nav-link plan-content-lab__bottom-nav-link--active"
                  : "plan-content-lab__bottom-nav-link"
              }
            >
              <span className="plan-content-lab__bottom-nav-icon">
                <NavIcon id={item.icon} size={22} />
              </span>
              <span className="plan-content-lab__bottom-nav-label">
                {item.shortLabel ?? item.label}
              </span>
            </span>
          );
        })}
      </nav>
    </div>
  );
}

export function LabAlumnaPreviewChrome({
  variant,
  children,
}: LabAlumnaPreviewChromeProps) {
  const isMobile = variant === "mobile";

  return (
    <div
      className={`plan-content-lab__alumna-shell alumna-rutina--experience plan-content-lab__alumna-shell--${variant}`}
    >
      <div className="plan-content-lab__alumna-body">
        <div className="alumna-rutina__experience">{children}</div>
      </div>
      {isMobile ? <LabPreviewBottomNav /> : null}
    </div>
  );
}
