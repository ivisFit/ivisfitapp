"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  useMemo,
} from "react";

export type BackgroundTheme = "default" | "minimal" | "dynamic" | "none";
export type BackgroundPattern = "alumna" | "profe" | "auto";
export type EffectIntensity = "sutil" | "normal" | "vibrante";

interface ThemePreferences {
  backgroundTheme: BackgroundTheme;
  backgroundPattern: BackgroundPattern;
  parallaxEffect: boolean;
  mouseEffects: boolean;
  effectIntensity: EffectIntensity;
  patternIntensity: number; // 0-1
  glowIntensity: number; // 0-1
  parallaxIntensity: number; // 0-1
  mobileReduced: boolean;
  effectsOptIn?: boolean;
}

interface ThemeContextValue {
  preferences: ThemePreferences;
  updatePreferences: (updates: Partial<ThemePreferences>) => void;
  resetPreferences: () => void;
  isLoading: boolean;
}

const defaultPreferences: ThemePreferences = {
  backgroundTheme: "minimal",
  backgroundPattern: "auto",
  parallaxEffect: false,
  mouseEffects: false,
  effectIntensity: "normal",
  patternIntensity: 0.18,
  glowIntensity: 0.65,
  parallaxIntensity: 0.35,
  mobileReduced: false,
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const PREFERENCES_STORAGE_KEY = "ivis-theme-preferences";

function shouldUseMobileReduced(): boolean {
  if (typeof window === "undefined") return false;

  const width = window.innerWidth;
  const isSmallDevice = width <= 480;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return isSmallDevice || prefersReducedMotion;
}

function sanitizeStoredPreferences(
  parsed: Record<string, unknown>,
): ThemePreferences {
  const {
    showParticles: _showParticles,
    particleIntensity: _particleIntensity,
    ...rest
  } = parsed;

  const effectsOptIn = parsed.effectsOptIn === true;
  const stored = rest as Partial<ThemePreferences>;

  return {
    ...defaultPreferences,
    ...stored,
    parallaxEffect: effectsOptIn && stored.parallaxEffect === true,
    mouseEffects: effectsOptIn && stored.mouseEffects === true,
    mobileReduced:
      typeof parsed.mobileReduced === "boolean"
        ? parsed.mobileReduced
        : shouldUseMobileReduced(),
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<ThemePreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          setPreferences(sanitizeStoredPreferences(parsed));
        }
      }
    } catch (error) {
      console.error("Error loading theme preferences:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const widthMq = window.matchMedia("(max-width: 480px)");
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      setPreferences((prev) => ({
        ...prev,
        mobileReduced: widthMq.matches || motionMq.matches,
      }));
    };

    widthMq.addEventListener("change", update);
    motionMq.addEventListener("change", update);

    return () => {
      widthMq.removeEventListener("change", update);
      motionMq.removeEventListener("change", update);
    };
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;

    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error("Error saving theme preferences:", error);
    }
  }, [preferences, isLoading]);

  const updatePreferences = (updates: Partial<ThemePreferences>) => {
    setPreferences((prev) => {
      const next = {
        ...prev,
        ...updates,
      };

      if ("parallaxEffect" in updates || "mouseEffects" in updates) {
        next.effectsOptIn = true;
      }

      return next;
    });
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    try {
      localStorage.removeItem(PREFERENCES_STORAGE_KEY);
    } catch (error) {
      console.error("Error removing theme preferences:", error);
    }
  };

  const value = useMemo(
    () => ({
      preferences,
      updatePreferences,
      resetPreferences,
      isLoading,
    }),
    [preferences, isLoading],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }

  return context;
}

export function useThemeClasses() {
  const { preferences } = useTheme();

  const backgroundClasses = useMemo(() => {
    const classes: string[] = [];

    switch (preferences.backgroundTheme) {
      case "minimal":
        classes.push("app-shell--minimal");
        break;
      case "dynamic":
        classes.push("app-shell--dynamic");
        break;
      case "none":
        classes.push("app-shell--none");
        break;
      case "default":
      default:
        classes.push("app-shell--default");
        break;
    }

    if (!preferences.parallaxEffect) {
      classes.push("no-parallax");
    }

    if (preferences.mobileReduced) {
      classes.push("app-shell--mobile-reduced");
    }

    return classes.join(" ");
  }, [preferences]);

  return { backgroundClasses, preferences };
}
