"use client";

import { create } from "zustand";
import { apiFetch } from "@/lib/api";

type CacheEntry<T = unknown> = {
  data: T;
  timestamp: number;
  ttl: number;
};

type CacheStore = {
  cache: Map<string, CacheEntry>;
  inflight: Map<string, Promise<unknown>>;
  get: <T>(key: string) => T | undefined;
  set: <T>(key: string, data: T, ttl: number) => void;
  invalidate: (pattern: string) => void;
  invalidateExact: (key: string) => void;
};

const store = create<CacheStore>((set, get) => ({
  cache: new Map(),
  inflight: new Map(),

  get<T>(key: string): T | undefined {
    const entry = get().cache.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.timestamp > entry.ttl) {
      get().cache.delete(key);
      return undefined;
    }
    return entry.data as T;
  },

  set<T>(key: string, data: T, ttl: number) {
    set((state) => {
      const next = new Map(state.cache);
      next.set(key, { data, timestamp: Date.now(), ttl });
      return { cache: next };
    });
  },

  invalidate(pattern: string) {
    set((state) => {
      const nextCache = new Map(state.cache);
      const nextInflight = new Map(state.inflight);
      for (const key of nextCache.keys()) {
        if (key.includes(pattern)) {
          nextCache.delete(key);
          nextInflight.delete(key);
        }
      }
      return { cache: nextCache, inflight: nextInflight };
    });
  },

  invalidateExact(key: string) {
    set((state) => {
      const nextCache = new Map(state.cache);
      nextCache.delete(key);
      const nextInflight = new Map(state.inflight);
      nextInflight.delete(key);
      return { cache: nextCache, inflight: nextInflight };
    });
  },
}));

const getState = store.getState;

export function invalidateCache(pattern: string) {
  getState().invalidate(pattern);
}

export function invalidateCacheKey(key: string) {
  getState().invalidateExact(key);
}

export async function fetchCached<T>(
  key: string,
  fetcher: (signal?: AbortSignal) => Promise<T>,
  ttl = 10_000,
  signal?: AbortSignal,
): Promise<T> {
  if (process.env.NODE_ENV === "development") {
    return fetcher(signal);
  }

  const cached = getState().get<T>(key);
  if (cached !== undefined) return cached;

  const existing = getState().inflight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = fetcher(signal)
    .then((data) => {
      if (data !== null && data !== undefined) {
        getState().set(key, data, ttl);
      }
      getState().inflight.delete(key);
      return data;
    })
    .catch((err) => {
      getState().inflight.delete(key);
      throw err;
    });

  getState().inflight.set(key, promise);
  return promise;
}

export function seedCache<T>(key: string, data: T, ttl = 10_000) {
  if (data !== null && data !== undefined) {
    getState().set(key, data, ttl);
  }
}

export function getCached<T>(key: string): T | undefined {
  return getState().get<T>(key);
}

export { store as apiCacheStore };
