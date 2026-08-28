"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { AppAlumnaTopbar } from "./AppAlumnaTopbar";
import { AppBottomNav } from "./AppBottomNav";
import { AppMobileHeader } from "./AppMobileHeader";
import { AppSidebar } from "./AppSidebar";
import { PageTransition } from "./PageTransition";
import { ProtectedBackground } from "./ProtectedBackground";
import { AlumnaSchemeToggle } from "@/components/layout/AlumnaSchemeToggle";
import { AppAssistantProvider } from "@/features/alumna/components/assistant/AppAssistantProvider";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/context/ColorSchemeContext";
import { useThemeClasses } from "@/context/ThemeContext";
import {
  LOGIN_ENTER_HANDOFF_KEY,
  LOGIN_ENTER_HANDOFF_MAX_WAIT_MS,
  LOGIN_ENTER_HANDOFF_MS,
  LOGIN_ENTER_TARGET_KEY,
} from "@/features/auth/components/login-enter-transition";
import { alumnaRoutes } from "@/routes/paths";

const LOGIN_ENTER_HANDOFF_REVEAL_TIMEOUT_MS =
  LOGIN_ENTER_HANDOFF_MAX_WAIT_MS + LOGIN_ENTER_HANDOFF_MS + 500;

interface AppShellProps {
  children: ReactNode;
}

function normalizePath(path: string): string {
  const base = path.split("?")[0]?.split("#")[0] ?? path;
  if (base.length > 1 && base.endsWith("/")) {
    return base.slice(0, -1);
  }
  return base;
}

export function AppShell({ children }: AppShellProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const userRole = user?.role;
  const { backgroundClasses } = useThemeClasses();
  const { scheme } = useColorScheme();
  const mainRef = useRef<HTMLDivElement>(null);
  const [handoffActive, setHandoffActive] = useState(false);
  const [handoffVisible, setHandoffVisible] = useState(false);

  useEffect(() => {
    if (
      user?.role === "alumna" &&
      user.admissionStatus === "admitida" &&
      user.onboardingCompletado !== true &&
      normalizePath(pathname) !== normalizePath(alumnaRoutes.bienvenida)
    ) {
      router.replace(alumnaRoutes.bienvenida);
    }
  }, [pathname, router, user]);

  useEffect(() => {
    if (sessionStorage.getItem(LOGIN_ENTER_HANDOFF_KEY) === "1") {
      setHandoffActive(true);
    }
  }, []);

  useEffect(() => {
    if (!handoffActive) return;

    let cancelled = false;
    let frameId = 0;
    let revealTimeoutId: number | undefined;
    const startedAt = performance.now();

    const revealHandoff = () => {
      if (cancelled) return;

      sessionStorage.removeItem(LOGIN_ENTER_HANDOFF_KEY);
      sessionStorage.removeItem(LOGIN_ENTER_TARGET_KEY);
      setHandoffVisible(true);
      revealTimeoutId = window.setTimeout(() => {
        setHandoffActive(false);
        setHandoffVisible(false);
      }, 320);
    };

    const tick = (now: number) => {
      if (cancelled) return;

      const handoffPending =
        sessionStorage.getItem(LOGIN_ENTER_HANDOFF_KEY) === "1";
      const targetPath = sessionStorage.getItem(LOGIN_ENTER_TARGET_KEY);
      const onTarget =
        !targetPath || normalizePath(pathname) === normalizePath(targetPath);
      const timedOut =
        now - startedAt >= LOGIN_ENTER_HANDOFF_REVEAL_TIMEOUT_MS;

      if ((!handoffPending && onTarget) || timedOut) {
        revealHandoff();
        return;
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      if (revealTimeoutId !== undefined) {
        window.clearTimeout(revealTimeoutId);
      }
    };
  }, [handoffActive, pathname]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  const shellClassName = [
    "app-shell",
    userRole === "alumna" ? "app-shell--alumna" : "",
    userRole === "profe" ? "app-shell--profe" : "",
    backgroundClasses,
    handoffActive ? "app-shell--enter-handoff" : "",
    handoffVisible ? "app-shell--enter-handoff-visible" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const studioChrome = userRole === "alumna" || userRole === "profe";

  return (
    <AppAssistantProvider enabled={userRole === "alumna"}>
      <div
        className={shellClassName}
        data-color-scheme={studioChrome ? scheme : undefined}
      >
        <a href="#main-content" className="skip-link">
          Saltar al contenido
        </a>
        <ProtectedBackground userRole={userRole} scrollContainerRef={mainRef} />
        {studioChrome ? <AppAlumnaTopbar /> : null}
        {userRole === "profe" ? (
          <div className="app-profe-mobile-scheme">
            <AlumnaSchemeToggle />
          </div>
        ) : null}
        <AppSidebar />
        <div ref={mainRef} className="app-main">
          <AppMobileHeader />
          <section id="main-content" className="app-content">
            <PageTransition>{children}</PageTransition>
          </section>
        </div>
        <AppBottomNav />
      </div>
    </AppAssistantProvider>
  );
}
