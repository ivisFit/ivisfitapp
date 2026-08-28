"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { seedCache } from "@/lib/apiCache";
import { useAuth } from "@/context/AuthContext";
import { useTransitionPreload } from "@/features/auth/hooks/useTransitionPreload";
import type { PanelDashboardDto } from "@/features/profe/types/panel";
import { isPanelDashboardDto } from "@/features/profe/utils/panel-validation";

const PANEL_CACHE_KEY = "/api/panel";
const RETRY_DELAY_MS = 450;

type LoadMode = "initial" | "refresh";

async function requestPanelDashboard(): Promise<PanelDashboardDto> {
  const { apiFetch } = await import("@/lib/api");
  const response = await apiFetch<PanelDashboardDto>("/api/panel");

  if (!isPanelDashboardDto(response)) {
    throw new Error("La respuesta del panel no es válida");
  }

  return response;
}

export function usePanelDashboard(initialData?: PanelDashboardDto | null) {
  const { user, loading: authLoading } = useAuth();
  const { getCachedData } = useTransitionPreload();
  const hasValidInitialData = isPanelDashboardDto(initialData);

  const [data, setData] = useState<PanelDashboardDto | null>(
    hasValidInitialData ? initialData : null,
  );
  const [loading, setLoading] = useState(!hasValidInitialData);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const userIdRef = useRef(user?.id);
  const bootstrapUserIdRef = useRef<string | null>(null);

  const applyData = useCallback((next: PanelDashboardDto) => {
    setData(next);
    seedCache(PANEL_CACHE_KEY, next, 30_000);
  }, []);

  const loadDashboard = useCallback(async (mode: LoadMode) => {
    const requestId = ++requestIdRef.current;
    const isRefresh = mode === "refresh";

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    const finish = () => {
      if (requestId !== requestIdRef.current) return;
      setLoading(false);
      setRefreshing(false);
    };

    const tryFetch = async (allowRetry: boolean) => {
      try {
        const response = await requestPanelDashboard();
        if (requestId !== requestIdRef.current) return;
        applyData(response);
        finish();
      } catch (err) {
        if (requestId !== requestIdRef.current) return;

        if (allowRetry && mode === "initial") {
          await new Promise((resolve) => window.setTimeout(resolve, RETRY_DELAY_MS));
          if (requestId !== requestIdRef.current) return;
          await tryFetch(false);
          return;
        }

        setError(
          err instanceof Error ? err.message : "No se pudo cargar el panel",
        );
        if (!isRefresh) {
          setData(null);
        }
        finish();
      }
    };

    await tryFetch(true);
  }, [applyData]);

  useEffect(() => {
    if (hasValidInitialData) {
      seedCache(PANEL_CACHE_KEY, initialData, 30_000);
    }
  }, [hasValidInitialData, initialData]);

  useEffect(() => {
    if (userIdRef.current !== user?.id) {
      userIdRef.current = user?.id;
      requestIdRef.current += 1;
    }
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== "profe") {
      setLoading(false);
      bootstrapUserIdRef.current = null;
      return;
    }

    if (bootstrapUserIdRef.current === user.id) return;
    bootstrapUserIdRef.current = user.id;

    if (hasValidInitialData) {
      applyData(initialData);
      return;
    }

    const cachedData = getCachedData(user);
    if (isPanelDashboardDto(cachedData)) {
      applyData(cachedData);
      return;
    }

    void loadDashboard("initial");
  }, [
    applyData,
    authLoading,
    getCachedData,
    hasValidInitialData,
    initialData,
    loadDashboard,
    user?.id,
    user?.role,
  ]);

  return {
    data,
    loading,
    refreshing,
    error,
    refetch: () => loadDashboard("refresh"),
  };
}
