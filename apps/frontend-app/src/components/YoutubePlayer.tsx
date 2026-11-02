"use client";

import { useEffect, useState, type ReactNode } from "react";
import { YoutubeFrame } from "@/components/YoutubeFrame";
import {
  getYoutubePlaybackUrl,
  getYoutubeThumbnailUrl,
  getYoutubeWatchUrl,
} from "@/lib/youtube";
import "@/styles/youtube-player.css";

type YoutubePlayerProps = {
  videoUrl: string;
  title: string;
  fill?: boolean;
  showOpenLink?: boolean;
  unavailableMessage?: ReactNode;
};

function OpenYoutubeLink({ href }: { href: string }) {
  return (
    <a
      className="youtube-player__open"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      Abrir en YouTube
    </a>
  );
}

export function YoutubePlayer({
  videoUrl,
  title,
  fill = false,
  showOpenLink,
  unavailableMessage,
}: YoutubePlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const playbackUrl = getYoutubePlaybackUrl(videoUrl, { autoplay: true });
  const thumbUrl = getYoutubeThumbnailUrl(videoUrl);
  const watchUrl = getYoutubeWatchUrl(videoUrl);
  const linkVisible = showOpenLink ?? !fill;

  useEffect(() => {
    setPlaying(false);
    setThumbFailed(false);
  }, [videoUrl]);

  let stage: ReactNode;
  if (!playbackUrl) {
    stage = (
      <div className="youtube-player__fallback">
        <p>{unavailableMessage ?? "No se pudo reproducir este video acá."}</p>
        {watchUrl ? <OpenYoutubeLink href={watchUrl} /> : null}
      </div>
    );
  } else if (!playing) {
    stage = (
      <button
        type="button"
        className="youtube-player__stage"
        onClick={() => setPlaying(true)}
        aria-label={`Ver video de ${title}`}
      >
        {thumbUrl && !thumbFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbUrl} alt="" onError={() => setThumbFailed(true)} />
        ) : (
          <span className="youtube-player__placeholder" />
        )}
        <span className="youtube-player__play">Ver video</span>
      </button>
    );
  } else {
    stage = (
      <YoutubeFrame title={`Video de ${title}`} src={playbackUrl} loading="eager" />
    );
  }

  const blockClass = fill
    ? "youtube-player-block youtube-player-block--fill"
    : "youtube-player-block";

  return (
    <div className={blockClass}>
      <div className="youtube-player">{stage}</div>
      {linkVisible && watchUrl && playbackUrl ? (
        <OpenYoutubeLink href={watchUrl} />
      ) : null}
    </div>
  );
}
