"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCached } from "@/lib/apiCache";
import type {
  RutinaChallenge28,
  RutinaDetail,
  RutinaEjercicio,
  RutinaMediaAsset,
  RutinaMediaType,
  RutinaPlanTemplateSnapshot,
  RutinaSemana,
  RutinaStoryPreview,
} from "../types/rutina";

type MediaAssetApi = {
  type?: string;
  url?: string;
  alt?: string;
  posterUrl?: string;
};

type EjercicioApiDoc = {
  _id?: string;
  id?: string;
  nombre?: string;
  videoUrl?: string;
  descripcion?: string;
};

type EjercicioRutinaApi = {
  ejercicioId: EjercicioApiDoc | string;
  series: number;
  repeticiones: number;
  descansoSegundos: number;
  media?: MediaAssetApi;
};

type RutinaDiaApi = {
  nombreDia: string;
  ejercicios: EjercicioRutinaApi[];
};

type RutinaSemanaApi = {
  numeroSemana: number;
  dias: RutinaDiaApi[];
};

type RutinaDetailApiDoc = {
  _id?: string;
  id?: string;
  nombrePlan: string;
  duracionSemanas: number;
  startDate?: string;
  createdAt?: string;
  updatedAt?: string;
  planTemplateSnapshot?: RutinaPlanTemplateSnapshot;
  storyPreview?: {
    background?: MediaAssetApi;
    title?: string;
    subtitle?: string;
    ctaLabel?: string;
  };
  challenge28?: {
    title?: string;
    subtitle?: string;
    accentLabel?: string;
    days?: {
      dayNumber?: number;
      title?: string;
      tags?: string[];
      media?: MediaAssetApi;
      farewellMedia?: MediaAssetApi;
      thumbnail?: MediaAssetApi;
    }[];
    weeks?: {
      weekNumber?: number;
      media?: MediaAssetApi;
      farewellMedia?: MediaAssetApi;
    }[];
  };
  semanas: RutinaSemanaApi[];
};

function isMediaType(value?: string): value is RutinaMediaType {
  return value === "image" || value === "video" || value === "gif";
}

function mapMediaAsset(asset?: MediaAssetApi): RutinaMediaAsset | undefined {
  if (!asset?.url || !isMediaType(asset.type)) return undefined;
  return {
    type: asset.type,
    url: asset.url,
    alt: asset.alt,
    posterUrl: asset.posterUrl,
  };
}

function mapStoryPreview(
  storyPreview?: RutinaDetailApiDoc["storyPreview"],
): RutinaStoryPreview | undefined {
  if (!storyPreview) return undefined;
  return {
    background: mapMediaAsset(storyPreview.background),
    title: storyPreview.title,
    subtitle: storyPreview.subtitle,
    ctaLabel: storyPreview.ctaLabel,
  };
}

function mapChallenge28(
  challenge28?: RutinaDetailApiDoc["challenge28"],
): RutinaChallenge28 | undefined {
  if (!challenge28) return undefined;
  return {
    title: challenge28.title,
    subtitle: challenge28.subtitle,
    accentLabel: challenge28.accentLabel,
    days: challenge28.days
      ?.filter((day) => typeof day.dayNumber === "number")
      .map((day) => ({
        dayNumber: day.dayNumber ?? 1,
        title: day.title,
        tags: day.tags,
        media: mapMediaAsset(day.media),
        farewellMedia: mapMediaAsset(day.farewellMedia),
        thumbnail: mapMediaAsset(day.thumbnail),
      })),
    weeks: challenge28.weeks
      ?.filter((week) => typeof week.weekNumber === "number")
      .map((week) => ({
        weekNumber: week.weekNumber ?? 1,
        media: mapMediaAsset(week.media),
        farewellMedia: mapMediaAsset(week.farewellMedia),
      })),
  };
}

function mapEjercicio(
  entry: EjercicioRutinaApi,
): RutinaEjercicio {
  const doc = typeof entry.ejercicioId === "string" ? undefined : entry.ejercicioId;
  const id =
    doc?._id ?? doc?.id ?? (typeof entry.ejercicioId === "string" ? entry.ejercicioId : "");

  return {
    id,
    nombre: doc?.nombre ?? "Ejercicio",
    videoUrl: doc?.videoUrl ?? "",
    descripcion: doc?.descripcion,
    series: entry.series,
    repeticiones: entry.repeticiones,
    descansoSegundos: entry.descansoSegundos,
    media: mapMediaAsset(entry.media),
  };
}

function mapSemana(semana: RutinaSemanaApi): RutinaSemana {
  return {
    numeroSemana: semana.numeroSemana,
    dias: semana.dias.map((dia) => ({
      nombreDia: dia.nombreDia,
      ejercicios: dia.ejercicios.map(mapEjercicio),
    })),
  };
}

export function mapRutinaDetail(doc: RutinaDetailApiDoc): RutinaDetail {
  return {
    id: doc._id ?? doc.id ?? "",
    nombrePlan: doc.nombrePlan,
    duracionSemanas: doc.duracionSemanas,
    startDate: doc.startDate,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    planTemplateSnapshot: doc.planTemplateSnapshot,
    storyPreview: mapStoryPreview(doc.storyPreview),
    challenge28: mapChallenge28(doc.challenge28),
    semanas: doc.semanas?.map(mapSemana) ?? [],
  };
}

export function useRutinaDetail(rutinaId?: string | null) {
  const [rutina, setRutina] = useState<RutinaDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRutina = useCallback(
    async (signal?: AbortSignal) => {
      if (!rutinaId) {
        setRutina(null);
        setError(null);
        setLoading(false);
        return;
      }

      const cacheKey = `/api/rutinas/${rutinaId}`;

      setLoading(true);
      setError(null);

      try {
        const data = await fetchCached<RutinaDetailApiDoc>(
          cacheKey,
          (sig) =>
            import("@/lib/api").then(({ apiFetch }) =>
              apiFetch<RutinaDetailApiDoc>(`/api/rutinas/${rutinaId}`, {
                signal: sig,
              }),
            ),
          30_000,
          signal,
        );
        setRutina(mapRutinaDetail(data));
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "No se pudo cargar la rutina");
        setRutina(null);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [rutinaId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchRutina(controller.signal);
    return () => controller.abort();
  }, [fetchRutina]);

  const refetch = useCallback(() => {
    void fetchRutina();
  }, [fetchRutina]);

  return { rutina, loading, error, refetch };
}
