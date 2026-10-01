"use client";

import { Box } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useContent } from "@/lib/preview-cms/lib/content-edit/useContent";
import { useImageUpload } from "@/lib/preview-cms/lib/content-edit/useImageUpload";
import { resolveUploadUrl } from "@/lib/preview-cms/lib/uploads";

const DEFAULT_VIDEO_MP4 = "/videos/video-inicio.mp4";
const DEFAULT_VIDEO_WEBM = "/videos/video-inicio.webm";
const posterFallback = "/imgs/imagenback1.jpg";
const MOBILE_MAX_WIDTH_PX = 768;

const HERO_VIDEO_MP4_PATH = "home.hero.videoMp4";
const HERO_VIDEO_WEBM_PATH = "home.hero.videoWebm";

type VideoFondoProps = {
  variant?: "default" | "preview";
};

function HeroOverlays() {
  return (
    <>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(105deg, rgba(9,7,8,0.86) 0%, rgba(9,7,8,0.62) 42%, rgba(9,7,8,0.28) 68%, rgba(9,7,8,0.42) 100%)",
          pointerEvents: "none",
          boxSizing: "border-box",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "32vh",
          background:
            "linear-gradient(to bottom, rgba(9,7,8,0) 0%, rgba(9,7,8,0.55) 60%, rgba(9,7,8,0.92) 100%)",
          pointerEvents: "none",
          boxSizing: "border-box",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "45vw",
          height: "45vw",
          background:
            "radial-gradient(circle, rgba(225,170,67,0.18) 0%, rgba(225,170,67,0) 65%)",
          pointerEvents: "none",
          boxSizing: "border-box",
        }}
      />
    </>
  );
}

export const VideoFondo = ({ variant = "default" }: VideoFondoProps) => {
  const isCmsPreview = variant === "preview";
  const { text, setText, isEditing } = useContent();
  const { uploadImage: uploadMedia, uploading } = useImageUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loadVideo, setLoadVideo] = useState(isCmsPreview);

  const mp4Stored = text(HERO_VIDEO_MP4_PATH)?.trim();
  const webmStored = text(HERO_VIDEO_WEBM_PATH)?.trim();

  const mp4Src = useMemo(() => {
    const raw = mp4Stored || DEFAULT_VIDEO_MP4;
    return resolveUploadUrl(raw) ?? raw;
  }, [mp4Stored]);

  const webmSrc = useMemo(() => {
    const raw = webmStored || DEFAULT_VIDEO_WEBM;
    return resolveUploadUrl(raw) ?? raw;
  }, [webmStored]);

  useEffect(() => {
    if (isCmsPreview) {
      setLoadVideo(true);
      return;
    }
    if (window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`).matches) {
      return;
    }

    const enable = () => setLoadVideo(true);

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(enable, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }

    const timeoutId = window.setTimeout(enable, 1);
    return () => window.clearTimeout(timeoutId);
  }, [isCmsPreview]);

  const onVideoFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const url = await uploadMedia(file);
        if (file.type === "video/webm") {
          setText(HERO_VIDEO_WEBM_PATH, url);
        } else {
          setText(HERO_VIDEO_MP4_PATH, url);
        }
      } catch (error) {
        console.error(error);
      } finally {
        event.target.value = "";
      }
    },
    [setText, uploadMedia],
  );

  const showVideo = loadVideo;

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        boxSizing: "border-box",
        backgroundColor: "#090708",
        backgroundImage: showVideo ? undefined : `url(${posterFallback})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: { xs: "fixed", sm: "scroll" },
        backgroundRepeat: "no-repeat",
      }}
    >
      {showVideo ? (
        <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <video
            key={mp4Src}
            id="inicio"
            className="ivis-hero-video"
            poster={posterFallback}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              minWidth: "100%",
              minHeight: "100%",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              backgroundColor: "#090708",
              pointerEvents: "none",
            }}
            autoPlay
            muted
            loop
            playsInline
            preload={isCmsPreview ? "auto" : "metadata"}
            disablePictureInPicture
            disableRemotePlayback
          >
            {webmSrc ? <source src={webmSrc} type="video/webm" /> : null}
            <source src={mp4Src} type="video/mp4" />
            Tu navegador no soporta el elemento de video.
          </video>

          {isEditing ? (
            <>
              <button
                type="button"
                className="cms-hero-video-edit"
                data-preview-image-edit
                disabled={uploading}
                aria-label="Cambiar video principal"
                onClick={(event) => {
                  event.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                {uploading ? "Subiendo video…" : "Cambiar video principal"}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                className="sr-only"
                data-preview-image-edit
                onChange={(event) => void onVideoFileChange(event)}
              />
            </>
          ) : null}
        </Box>
      ) : null}

      <HeroOverlays />
    </Box>
  );
};
