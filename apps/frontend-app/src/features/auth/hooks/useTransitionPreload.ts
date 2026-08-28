"use client";

import { useCallback, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import type { PanelDashboardDto } from "@/features/profe/types/panel";
import { isPanelDashboardDto } from "@/features/profe/utils/panel-validation";
import type { AuthUser } from "@/types/auth";

const PRELOAD_CACHE_KEY = "ivis:transition-preload-cache";
const CACHE_DURATION = 30000; // 30 segundos

interface PreloadCache {
  [key: string]: {
    data: any;
    timestamp: number;
  };
}

// Caché global para datos precargados
let preloadCache: PreloadCache = {};

let persistTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePersist() {
  if (persistTimer !== null) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    try {
      sessionStorage.setItem(PRELOAD_CACHE_KEY, JSON.stringify(preloadCache));
    } catch {
      // Ignorar errores de storage
    }
  }, 500);
}

export function useTransitionPreload() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const preloadPanelData = useCallback(async (user: AuthUser) => {
    if (user.role !== "profe") return;

    const cacheKey = `panel-${user.id}`;
    const now = Date.now();
    
    // Verificar caché válida
    const cached = preloadCache[cacheKey];
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      if (isPanelDashboardDto(cached.data)) {
        return cached.data;
      }
      delete preloadCache[cacheKey];
    }

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Nueva request
    abortControllerRef.current = new AbortController();

    try {
      const data = await apiFetch<PanelDashboardDto>("/api/panel", {
        signal: abortControllerRef.current.signal,
      });

      if (!isPanelDashboardDto(data)) {
        return null;
      }

      // Guardar en caché
      preloadCache[cacheKey] = {
        data,
        timestamp: now,
      };

      schedulePersist();

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return null;
      }
      console.warn("Error precargando datos del panel:", error);
      return null;
    }
  }, []);

  const preloadAlumnaData = useCallback(async (user: AuthUser) => {
    if (user.role !== "alumna") return;

    const cacheKey = `rutina-${user.id}`;
    const now = Date.now();
    
    const cached = preloadCache[cacheKey];
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.data;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      // Precargar datos básicos de rutina (ajustar según tu API)
      const data = await apiFetch("/api/rutina/resumen", {
        signal: abortControllerRef.current.signal,
      });

      preloadCache[cacheKey] = {
        data,
        timestamp: now,
      };

      schedulePersist();

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return null;
      }
      console.warn("Error precargando datos de rutina:", error);
      return null;
    }
  }, []);

  const preloadUserData = useCallback((user: AuthUser) => {
    if (user.role === "profe") {
      preloadPanelData(user);
    } else if (user.role === "alumna") {
      preloadAlumnaData(user);
    }
  }, [preloadPanelData, preloadAlumnaData]);

  const getCachedData = useCallback((user: AuthUser) => {
    const cacheKey = user.role === "profe" ? `panel-${user.id}` : `rutina-${user.id}`;
    const cached = preloadCache[cacheKey];

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      if (user.role === "profe" && !isPanelDashboardDto(cached.data)) {
        delete preloadCache[cacheKey];
        return null;
      }
      return cached.data ?? null;
    }

    return null;
  }, []);

  // Limpiar caché al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Restaurar caché desde sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(PRELOAD_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PreloadCache;
        // Solo restaurar datos que no estén expirados
        const now = Date.now();
        const validCache: PreloadCache = {};
        
        for (const [key, value] of Object.entries(parsed)) {
          if (now - value.timestamp < CACHE_DURATION) {
            validCache[key] = value;
          }
        }
        
        preloadCache = validCache;
      }
    } catch (e) {
      // Ignorar errores de parsing
      preloadCache = {};
    }
  }, []);

  return {
    preloadUserData,
    getCachedData,
  };
}