"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useTheme, useThemeClasses } from "@/context/ThemeContext";

interface ProtectedBackgroundProps {
  userRole?: "alumna" | "profe";
  scrollContainerRef?: RefObject<HTMLElement | null>;
}

function applyIntensityPreset(base: number, intensity: "sutil" | "normal" | "vibrante"): number {
  switch (intensity) {
    case "sutil":
      return base * 0.5;
    case "normal":
      return base;
    case "vibrante":
      return base * 1.5;
    default:
      return base;
  }
}

export function ProtectedBackground({
  userRole = "alumna",
  scrollContainerRef,
}: ProtectedBackgroundProps) {
  const patternRef = useRef<HTMLDivElement>(null);
  const mouseGlowRef = useRef<HTMLDivElement>(null);
  const mouseRafRef = useRef<number | null>(null);
  const pendingMouseRef = useRef<{ x: number; y: number } | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const { preferences, isLoading } = useTheme();
  const { backgroundClasses } = useThemeClasses();

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduceMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);
    return () => media.removeEventListener("change", updateMotion);
  }, []);

  const showMouseGlow = preferences.mouseEffects && !reduceMotion && !isLoading;

  useEffect(() => {
    const glow = mouseGlowRef.current;
    if (!showMouseGlow || !glow) {
      return;
    }

    const flushMousePosition = () => {
      mouseRafRef.current = null;
      const pending = pendingMouseRef.current;
      if (!pending) return;
      glow.style.transform = `translate3d(${pending.x}px, ${pending.y}px, 0) translate(-50%, -50%)`;
      glow.classList.add("is-active");
    };

    const handleMouseMove = (e: MouseEvent) => {
      pendingMouseRef.current = { x: e.clientX, y: e.clientY };
      if (mouseRafRef.current === null) {
        mouseRafRef.current = window.requestAnimationFrame(flushMousePosition);
      }
    };

    const handleMouseLeave = () => {
      glow.classList.remove("is-active");
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (mouseRafRef.current !== null) {
        window.cancelAnimationFrame(mouseRafRef.current);
        mouseRafRef.current = null;
      }
      glow.classList.remove("is-active");
    };
  }, [showMouseGlow]);

  const parallaxFactor = applyIntensityPreset(
    preferences.parallaxIntensity,
    preferences.effectIntensity,
  );

  useEffect(() => {
    const pattern = patternRef.current;
    const container = scrollContainerRef?.current;

    if (!pattern) return;

    if (reduceMotion || !preferences.parallaxEffect || !container) {
      pattern.style.transform = "";
      return;
    }

    let ticking = false;

    const onScroll = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(() => {
        const offset = container.scrollTop * parallaxFactor;
        pattern.style.transform = `translate3d(0, ${offset * 0.3}px, 0)`;
        ticking = false;
      });
    };

    onScroll();
    container.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", onScroll);
      pattern.style.transform = "";
    };
  }, [
    reduceMotion,
    preferences.parallaxEffect,
    parallaxFactor,
    scrollContainerRef,
  ]);

  const patternClass = useMemo(() => {
    if (preferences.backgroundTheme === "none") {
      return "protected-background__pattern--default";
    }

    let patternType = preferences.backgroundPattern;
    if (patternType === "auto") {
      patternType = userRole;
    }

    return patternType === "profe"
      ? "protected-background__pattern--profe"
      : "protected-background__pattern--alumna";
  }, [preferences.backgroundPattern, preferences.backgroundTheme, userRole]);

  const patternOpacity =
    applyIntensityPreset(0.04, preferences.effectIntensity) *
    (preferences.patternIntensity / 0.18);
  const glowOpacity = applyIntensityPreset(preferences.glowIntensity, preferences.effectIntensity);

  const showPattern = preferences.backgroundTheme !== "none";
  const showEffects =
    preferences.backgroundTheme === "default" ||
    preferences.backgroundTheme === "dynamic";

  if (isLoading) {
    return <div className="protected-background" aria-hidden="true" />;
  }

  return (
    <div
      className={`protected-background ${backgroundClasses}`}
      aria-hidden="true"
    >
      <div className="protected-background__mesh" aria-hidden="true" />

      {showEffects ? (
        <>
          <div
            className="protected-background__bokeh-orb protected-background__bokeh-orb--amber"
            style={{ opacity: glowOpacity }}
          />
          <div
            className="protected-background__bokeh-orb protected-background__bokeh-orb--gold-warm"
            style={{ opacity: glowOpacity * 0.85 }}
          />
          <div
            className="protected-background__bokeh-orb protected-background__bokeh-orb--dark-warm"
            style={{ opacity: glowOpacity * 0.75 }}
          />
          <div
            className="protected-background__bokeh-orb protected-background__bokeh-orb--amber-secondary"
            style={{ opacity: glowOpacity * 0.6 }}
          />
        </>
      ) : null}

      {showPattern ? (
        <div
          ref={patternRef}
          className={`protected-background__pattern ${patternClass} protected-background__pattern--layer-1`}
          style={{
            opacity: patternOpacity,
          }}
        />
      ) : null}

      {showEffects ? (
        <>
          <div
            className="protected-background__glow protected-background__glow--gold"
            style={{ opacity: glowOpacity }}
          />
          <div
            className="protected-background__glow protected-background__glow--warm"
            style={{ opacity: glowOpacity * 0.8 }}
          />
        </>
      ) : null}

      <div className="protected-background__vignette" />

      {showMouseGlow ? (
        <div ref={mouseGlowRef} className="protected-background__mouse-glow" />
      ) : null}
    </div>
  );
}
