"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { ConfirmLeaveModal } from "@/components/ConfirmLeaveModal";
import { isSameAlumnaDetailPath } from "@/routes/paths";

export type AlumnaDirtySection = "rutina" | "alimentacion" | "pliegues";

type ReporterState = Partial<Record<AlumnaDirtySection, boolean>>;

type AlumnaUnsavedChangesContextValue = {
  isDirty: boolean;
  setSectionDirty: (
    reporterId: string,
    section: AlumnaDirtySection,
    dirty: boolean,
  ) => void;
  unregisterReporter: (reporterId: string) => void;
};

const AlumnaUnsavedChangesContext =
  createContext<AlumnaUnsavedChangesContextValue | null>(null);

const EMPTY_DIRTY: Record<AlumnaDirtySection, boolean> = {
  rutina: false,
  alimentacion: false,
  pliegues: false,
};

const SECTIONS: AlumnaDirtySection[] = ["rutina", "alimentacion", "pliegues"];

function mergeReporterDirty(
  reporters: Map<string, ReporterState>,
): Record<AlumnaDirtySection, boolean> {
  const merged = { ...EMPTY_DIRTY };

  for (const state of reporters.values()) {
    for (const section of SECTIONS) {
      if (state[section]) {
        merged[section] = true;
      }
    }
  }

  return merged;
}

type AlumnaUnsavedChangesProviderProps = {
  alumnaId: string;
  children: ReactNode;
};

export function AlumnaUnsavedChangesProvider({
  alumnaId,
  children,
}: AlumnaUnsavedChangesProviderProps) {
  const router = useRouter();
  const reportersRef = useRef(new Map<string, ReporterState>());
  const [dirtyBySection, setDirtyBySection] =
    useState<Record<AlumnaDirtySection, boolean>>(EMPTY_DIRTY);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const isDirty = SECTIONS.some((section) => dirtyBySection[section]);

  const syncDirtyFromReporters = useCallback(() => {
    setDirtyBySection(mergeReporterDirty(reportersRef.current));
  }, []);

  const setSectionDirty = useCallback(
    (reporterId: string, section: AlumnaDirtySection, dirty: boolean) => {
      const reporters = reportersRef.current;
      const current = reporters.get(reporterId) ?? {};
      reporters.set(reporterId, { ...current, [section]: dirty });
      syncDirtyFromReporters();
    },
    [syncDirtyFromReporters],
  );

  const unregisterReporter = useCallback(
    (reporterId: string) => {
      reportersRef.current.delete(reporterId);
      syncDirtyFromReporters();
    },
    [syncDirtyFromReporters],
  );

  const clearAllDirty = useCallback(() => {
    reportersRef.current.clear();
    setDirtyBySection(EMPTY_DIRTY);
  }, []);

  const handleStay = useCallback(() => {
    setPendingHref(null);
  }, []);

  const handleLeave = useCallback(() => {
    const href = pendingHref;
    setPendingHref(null);
    clearAllDirty();
    if (href) {
      router.push(href);
    }
  }, [clearAllDirty, pendingHref, router]);

  useEffect(() => {
    if (!isDirty) return;

    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;

    function onDocumentClick(event: MouseEvent) {
      if (pendingHref) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!anchor) return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref || rawHref.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(rawHref, window.location.origin);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (isSameAlumnaDetailPath(url.pathname, alumnaId)) return;

      event.preventDefault();
      event.stopPropagation();
      setPendingHref(`${url.pathname}${url.search}${url.hash}`);
    }

    document.addEventListener("click", onDocumentClick, true);
    return () => document.removeEventListener("click", onDocumentClick, true);
  }, [alumnaId, isDirty, pendingHref]);

  const value = useMemo(
    () => ({
      isDirty,
      setSectionDirty,
      unregisterReporter,
    }),
    [isDirty, setSectionDirty, unregisterReporter],
  );

  return (
    <AlumnaUnsavedChangesContext.Provider value={value}>
      {children}
      <ConfirmLeaveModal
        open={pendingHref !== null}
        onStay={handleStay}
        onLeave={handleLeave}
      />
    </AlumnaUnsavedChangesContext.Provider>
  );
}

export function useAlumnaUnsavedChanges() {
  const context = useContext(AlumnaUnsavedChangesContext);
  if (!context) {
    throw new Error(
      "useAlumnaUnsavedChanges must be used within AlumnaUnsavedChangesProvider",
    );
  }
  return context;
}

export function useAlumnaUnsavedReporter() {
  const { setSectionDirty, unregisterReporter } = useAlumnaUnsavedChanges();
  const reporterIdRef = useRef<string | null>(null);

  if (reporterIdRef.current === null) {
    reporterIdRef.current = `reporter-${Math.random().toString(36).slice(2)}`;
  }

  const reporterId = reporterIdRef.current;

  useEffect(() => {
    return () => unregisterReporter(reporterId);
  }, [reporterId, unregisterReporter]);

  const reportSectionDirty = useCallback(
    (section: AlumnaDirtySection, dirty: boolean) => {
      setSectionDirty(reporterId, section, dirty);
    },
    [reporterId, setSectionDirty],
  );

  return { reportSectionDirty };
}
