"use client";

import { useState } from "react";
import { getYoutubeEmbedUrl, getYoutubeThumbnailUrl } from "@/lib/youtube";

type YoutubePreviewProps = {
  videoUrl: string;
  title: string;
};

export function YoutubePreview({ videoUrl, title }: YoutubePreviewProps) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const embedUrl = getYoutubeEmbedUrl(videoUrl);
  const thumbUrl = getYoutubeThumbnailUrl(videoUrl);

  if (!embedUrl || failed) {
    return (
      <div className="ejercicio-video ejercicio-video--fallback">
        <p>
          Video no disponible — pasalo a <strong>No listado</strong> en YouTube,
          no Privado.
        </p>
        <a className="auth-link" href={videoUrl} target="_blank" rel="noreferrer">
          Abrir en YouTube
        </a>
      </div>
    );
  }

  if (!playing) {
    return (
      <button
        type="button"
        className="ejercicio-video ejercicio-video--thumb"
        onClick={() => setPlaying(true)}
        aria-label={`Ver video de ${title}`}
      >
        {thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbUrl}
            alt=""
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="ejercicio-video__placeholder" />
        )}
        <span className="ejercicio-video__play">Ver video</span>
      </button>
    );
  }

  return (
    <div className="ejercicio-video">
      <iframe
        title={`Video de ${title}`}
        src={`${embedUrl}?autoplay=1`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
