import { getYoutubeEmbedUrl } from "@/features/alumna/lib/rutina-day";
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

  const youtubeEmbedUrl = getYoutubeEmbedUrl(media.url);
  if (youtubeEmbedUrl) {
    return (
      <div className={`${prefix}__media-frame`}>
        <iframe
          title={mediaTitle}
          src={youtubeEmbedUrl}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (media.type === "video") {
    return (
      <video
        className={`${prefix}__media`}
        src={media.url}
        poster={media.posterUrl}
        autoPlay
        muted
        loop
        playsInline
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
