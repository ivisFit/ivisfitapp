"use client";

import { Box } from "@mui/material";
import { useEffect, useState } from "react";

const videoMp4 = "/videos/video-inicio.mp4";
const videoWebm = "/videos/video-inicio.webm";
const posterFallback = "/imgs/imagenback1.jpg";
const MOBILE_MAX_WIDTH_PX = 768;

type VideoFondoProps = {
  variant?: "default" | "preview";
};

function HeroOverlays() {
  return (
    <>
      <Box sx={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(105deg, rgba(9,7,8,0.86) 0%, rgba(9,7,8,0.62) 42%, rgba(9,7,8,0.28) 68%, rgba(9,7,8,0.42) 100%)',
        pointerEvents: 'none',
        boxSizing:"border-box"
      }} />

      <Box sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '32vh',
        background: 'linear-gradient(to bottom, rgba(9,7,8,0) 0%, rgba(9,7,8,0.55) 60%, rgba(9,7,8,0.92) 100%)',
        pointerEvents: 'none',
        boxSizing:"border-box"
      }} />

      <Box sx={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '45vw',
        height: '45vw',
        background: 'radial-gradient(circle, rgba(225,170,67,0.18) 0%, rgba(225,170,67,0) 65%)',
        pointerEvents: 'none',
        boxSizing:"border-box"
      }} />
    </>
  );
}

export const VideoFondo = ({ variant = "default" }: VideoFondoProps) => {
  const isPreview = variant === "preview";
  const [loadVideo, setLoadVideo] = useState(false);

  useEffect(() => {
    if (isPreview) return;
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
  }, [isPreview]);

  return (
    <Box sx={{
      width:"100%",
      minHeight:{ xs: "500px", sm: "calc(100vh - 120px)" },
      zIndex:"1",
      position:"relative",
      boxSizing:"border-box",
      overflow:"hidden",
      backgroundColor:"#090708",
      backgroundImage: isPreview ? undefined : `url(${posterFallback})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      {isPreview ? (
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#090708",
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(225,170,67,0.12) 0%, rgba(9,7,8,0) 45%), radial-gradient(circle at 80% 70%, rgba(225,170,67,0.08) 0%, rgba(9,7,8,0) 40%)",
          }}
        />
      ) : loadVideo ? (
        <video
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
            pointerEvents: "none"
          }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
        >
          <source src={videoWebm} type="video/webm" />
          <source src={videoMp4} type="video/mp4" />
          Tu navegador no soporta el elemento de video.
        </video>
      ) : null}

      <HeroOverlays />
    </Box>
  )
}
