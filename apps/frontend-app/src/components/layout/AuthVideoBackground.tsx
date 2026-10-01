"use client";

import { useEffect, useRef } from "react";
import { DEFAULT_AUTH_VIDEO_SRC } from "@/lib/auth-login-video.constants";

type AuthVideoBackgroundProps = {
  className?: string;
  src?: string;
};

export function AuthVideoBackground({
  className,
  src = DEFAULT_AUTH_VIDEO_SRC,
}: AuthVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      video.pause();
      video.removeAttribute("src");
      return;
    }

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
  }, [src]);

  const classes = ["auth-screen__video", className].filter(Boolean).join(" ");

  return (
    <video
      ref={videoRef}
      className={classes}
      src={src}
      muted
      playsInline
      autoPlay
      loop
      preload="metadata"
      aria-hidden
    />
  );
}
