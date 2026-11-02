"use client";

import { YoutubePlayer } from "@/components/YoutubePlayer";
import { getYoutubeEmbedUrl, getYoutubeWatchUrl } from "@/lib/youtube";
import type { RutinaMediaAsset } from "@/features/alumna/types/rutina";

type DayIntroMediaVariant = "sheet" | "story";

type DayIntroMediaProps = {
  media?: RutinaMediaAsset;
  variant?: DayIntroMediaVariant;
  title?: string;
};

function getClassPrefix(variant: DayIntroMediaVariant): string {
  return variant === "story" ? "training-story__intro" : "challenge-sheet";
}

export function DayIntroMedia({
  media,
  variant = "sheet",
  title,
}: DayIntroMediaProps) {
  const prefix = getClassPrefix(variant);
  const mediaTitle = title ?? media?.alt ?? "Video de la rutina";

  if (!media) {
    return (
      <div className={`${prefix}__media-placeholder`} aria-hidden="true">
        <span />
      </div>
    );
  }

  const watchUrl = getYoutubeWatchUrl(media.url);
  if (getYoutubeEmbedUrl(media.url) && watchUrl) {
    return (
      <div className="youtube-player-stack">
        <div className={`${prefix}__media-frame`}>
          <YoutubePlayer
            videoUrl={media.url}
            title={mediaTitle}
            fill
            showOpenLink={false}
          />
        </div>
        <a
          className="youtube-player__open"
          href={watchUrl}
          target="_blank"
          rel="noreferrer"
        >
          Abrir en YouTube
        </a>
      </div>
    );
  }

  if (media.type === "video") {
    return (
      <video
        className={`${prefix}__media ${prefix}__media--player`}
        src={media.url}
        poster={media.posterUrl}
        controls
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    <img
      className={`${prefix}__media`}
      src={media.url}
      alt={media.alt ?? ""}
      loading="lazy"
    />
  );
}
