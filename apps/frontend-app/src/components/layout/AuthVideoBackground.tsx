"use client";

import { useEffect, useRef } from "react";

// Boomerang clip: already contains forward + reverse, so a native loop
// produces a seamless back-and-forth playback.
const AUTH_VIDEO_SRC = "/auth/fondovideo.mp4";

type AuthVideoBackgroundProps = {
  className?: string;
};

export function AuthVideoBackground({ className }: AuthVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    let retries = 0;
    const MAX_RETRIES = 3;

    const tryPlay = () => {
      if (cancelled || retries >= MAX_RETRIES) return;
      retries += 1;
      const result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(() => {
          if (!cancelled && retries < MAX_RETRIES) {
            window.setTimeout(tryPlay, 300);
          }
        });
      }
    };

    // Keep it playing even if something pauses it (tab switch, decode hiccup).
    const resume = () => {
      if (!cancelled && video.paused) tryPlay();
    };

    video.addEventListener("pause", resume);
    video.addEventListener("stalled", resume);
    video.addEventListener("loadeddata", tryPlay);

    tryPlay();

    return () => {
      cancelled = true;
      video.removeEventListener("pause", resume);
      video.removeEventListener("stalled", resume);
      video.removeEventListener("loadeddata", tryPlay);
    };
  }, []);

  const classes = ["auth-screen__video", className].filter(Boolean).join(" ");

  return (
    <video
      ref={videoRef}
      className={classes}
      src={AUTH_VIDEO_SRC}
      muted
      playsInline
      autoPlay
      loop
      preload="auto"
      aria-hidden
    />
  );
}
