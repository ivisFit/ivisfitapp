"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PwaInstallHelpSheet } from "@/components/pwa/PwaInstallHelpSheet";
import {
  getDeferredPrompt,
  getInstallPlatform,
  isStandaloneDisplay,
  type InstallPlatform,
} from "@/lib/pwa-install";

export type PwaInstallOutcome = "prompted" | "help";

type PwaInstallContextValue = {
  isReady: boolean;
  isInstalled: boolean;
  canPrompt: boolean;
  platform: InstallPlatform;
  install: () => Promise<PwaInstallOutcome>;
};

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

const DEV_SW_URL = "/pwa-dev-sw.js";

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canPrompt, setCanPrompt] = useState(false);
  const [platform, setPlatform] = useState<InstallPlatform>("chromium");
  const [helpOpen, setHelpOpen] = useState(false);
  const [isSecure, setIsSecure] = useState(true);

  useEffect(() => {
    const installed = isStandaloneDisplay();
    setIsInstalled(installed);
    setPlatform(getInstallPlatform());
    setIsSecure(window.isSecureContext);
    setCanPrompt(!installed && Boolean(getDeferredPrompt()));
    setIsReady(true);

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const onDisplayMode = () => {
      if (isStandaloneDisplay()) {
        setIsInstalled(true);
        setCanPrompt(false);
        setHelpOpen(false);
      }
    };

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      window.__pwaDeferredPrompt = event as BeforeInstallPromptEvent;
      setCanPrompt(true);
    }

    function onAppInstalled() {
      window.__pwaDeferredPrompt = null;
      setCanPrompt(false);
      setIsInstalled(true);
      setHelpOpen(false);
    }

    mediaQuery.addEventListener("change", onDisplayMode);
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      mediaQuery.removeEventListener("change", onDisplayMode);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker
      .register(DEV_SW_URL, { scope: "/" })
      .catch(() => {
        // Installability still falls back to the help sheet.
      });
  }, []);

  const closeHelp = useCallback(() => {
    setHelpOpen(false);
  }, []);

  const install = useCallback(async (): Promise<PwaInstallOutcome> => {
    const promptEvent = getDeferredPrompt();
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        window.__pwaDeferredPrompt = null;
        setCanPrompt(false);
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
        }
        return "prompted";
      } catch {
        window.__pwaDeferredPrompt = null;
        setCanPrompt(false);
      }
    }

    setHelpOpen(true);
    return "help";
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      isInstalled,
      canPrompt,
      platform,
      install,
    }),
    [isReady, isInstalled, canPrompt, platform, install],
  );

  return (
    <PwaInstallContext.Provider value={value}>
      {children}
      <PwaInstallHelpSheet
        open={helpOpen}
        platform={platform}
        secure={isSecure}
        onClose={closeHelp}
      />
    </PwaInstallContext.Provider>
  );
}

export function usePwaInstall() {
  const context = useContext(PwaInstallContext);
  if (!context) {
    throw new Error("usePwaInstall must be used within PwaInstallProvider");
  }
  return context;
}
