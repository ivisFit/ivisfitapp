"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LandingLoader } from "@/features/landing/components/LandingLoader";

const FADE_OUT_MS = 400;

type LandingReadyGateProps = {
  children: ReactNode;
};

export function LandingReadyGate({ children }: LandingReadyGateProps) {
  const [exiting, setExiting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const startExit = () => setExiting(true);

    if (document.readyState === "complete") {
      startExit();
      return;
    }

    window.addEventListener("load", startExit);
    return () => window.removeEventListener("load", startExit);
  }, []);

  useEffect(() => {
    if (!exiting) return;

    const timer = window.setTimeout(() => setReady(true), FADE_OUT_MS);
    return () => window.clearTimeout(timer);
  }, [exiting]);

  return (
    <>
      {children}
      {!ready && <LandingLoader exiting={exiting} />}
    </>
  );
}
