"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { CheckinAlimentacion } from "@/features/alumna/types/checkin-alimentacion";

const TIME_ZONE = "America/Montevideo";

export function getMontevideoDateKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const lookup = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
}

function shiftDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const utc = new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
  utc.setUTCDate(utc.getUTCDate() + days);
  const nextYear = utc.getUTCFullYear();
  const nextMonth = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const nextDay = String(utc.getUTCDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export function listRecentDateKeys(days: number): string[] {
  const today = getMontevideoDateKey();
  return Array.from({ length: days }, (_, index) =>
    shiftDateKey(today, index - (days - 1)),
  );
}

export function formatCheckinDayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("es-UY", {
    weekday: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1)));
}

export function useCheckinsAlimentacionSemana() {
  const [checkins, setCheckins] = useState<Record<string, CheckinAlimentacion>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const keys = listRecentDateKeys(7);
      const params = new URLSearchParams({
        from: keys[0] ?? getMontevideoDateKey(),
        to: keys[keys.length - 1] ?? getMontevideoDateKey(),
      });
      const data = await apiFetch<CheckinAlimentacion[]>(
        `/api/checkins-alimentacion?${params.toString()}`,
        { signal },
      );
      const map: Record<string, CheckinAlimentacion> = {};
      for (const checkin of Array.isArray(data) ? data : []) {
        map[checkin.dateKey] = checkin;
      }
      setCheckins(map);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los check-ins",
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const refetch = useCallback(() => {
    void load();
  }, [load]);

  const getCheckinForDate = useCallback(
    (dateKey: string) => checkins[dateKey] ?? null,
    [checkins],
  );

  return { checkins, loading, error, refetch, getCheckinForDate };
}
