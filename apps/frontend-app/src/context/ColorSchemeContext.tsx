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
import { useAuth } from "@/context/AuthContext";

export type ColorScheme = "dark" | "light";

export const ALUMNA_COLOR_SCHEME_STORAGE_KEY = "ivis-alumna-color-scheme";
export const PROFE_COLOR_SCHEME_STORAGE_KEY = "ivis-profe-color-scheme";

type AppRole = "alumna" | "profe";

interface ColorSchemeContextValue {
  scheme: ColorScheme;
  setScheme: (scheme: ColorScheme) => void;
  toggleScheme: () => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null);

function storageKeyForRole(role: AppRole): string {
  return role === "profe"
    ? PROFE_COLOR_SCHEME_STORAGE_KEY
    : ALUMNA_COLOR_SCHEME_STORAGE_KEY;
}

function readStoredScheme(role: AppRole): ColorScheme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = window.localStorage.getItem(storageKeyForRole(role));
    return stored === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function applyDocumentScheme(scheme: ColorScheme | null, role?: AppRole | null) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (!scheme || !role) {
    delete root.dataset.colorScheme;
    delete root.dataset.alumnaColorScheme;
    delete root.dataset.profeColorScheme;
    root.style.removeProperty("color-scheme");
    return;
  }
  root.dataset.colorScheme = scheme;
  root.style.colorScheme = scheme;
  if (role === "alumna") {
    root.dataset.alumnaColorScheme = scheme;
    delete root.dataset.profeColorScheme;
  } else {
    root.dataset.profeColorScheme = scheme;
    delete root.dataset.alumnaColorScheme;
  }
}

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [scheme, setSchemeState] = useState<ColorScheme>("dark");
  const [hydrated, setHydrated] = useState(false);
  const role: AppRole | null =
    user?.role === "profe" || user?.role === "alumna" ? user.role : null;

  useEffect(() => {
    if (loading) return;
    if (role) {
      setSchemeState(readStoredScheme(role));
    }
    setHydrated(true);
  }, [loading, role]);

  useEffect(() => {
    if (!hydrated) return;
    if (role) {
      applyDocumentScheme(scheme, role);
      return;
    }
    if (!loading) {
      applyDocumentScheme(null);
    }
  }, [hydrated, loading, role, scheme]);

  const setScheme = useCallback(
    (next: ColorScheme) => {
      setSchemeState(next);
      if (!role) return;
      try {
        window.localStorage.setItem(storageKeyForRole(role), next);
      } catch {
        /* ignore quota / private mode */
      }
    },
    [role],
  );

  const toggleScheme = useCallback(() => {
    setScheme(scheme === "dark" ? "light" : "dark");
  }, [scheme, setScheme]);

  const value = useMemo(
    () => ({ scheme, setScheme, toggleScheme }),
    [scheme, setScheme, toggleScheme],
  );

  return (
    <ColorSchemeContext.Provider value={value}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

export function useColorScheme() {
  const context = useContext(ColorSchemeContext);
  if (!context) {
    throw new Error("useColorScheme debe usarse dentro de ColorSchemeProvider");
  }
  return context;
}
