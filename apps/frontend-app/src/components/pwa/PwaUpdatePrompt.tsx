"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";

/**
 * Notifies when a new service worker is waiting and lets the user activate it.
 */
export function PwaUpdatePrompt() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") return;
    if (!("serviceWorker" in navigator)) return;

    const onControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    void navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
      }

      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;

        installing.addEventListener("statechange", () => {
          if (
            installing.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setWaitingWorker(registration.waiting ?? installing);
          }
        });
      });
    });

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);

  const applyUpdate = useCallback(() => {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
    setWaitingWorker(null);
  }, [waitingWorker]);

  if (!waitingWorker) return null;

  return (
    <div
      className="pwa-update-prompt"
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.75rem 1rem",
        borderRadius: "12px",
        background: "var(--color-surface-elevated, #1a1a1a)",
        color: "var(--color-text, #fff)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        maxWidth: "min(92vw, 420px)",
      }}
    >
      <span style={{ fontSize: "0.875rem", flex: 1 }}>
        Hay una nueva versión de la app.
      </span>
      <Button type="button" variant="primary" onClick={applyUpdate}>
        Actualizar
      </Button>
    </div>
  );
}
