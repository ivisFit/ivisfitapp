"use client";

import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import type { StaticImageData } from "next/image";
import loaderPixelCorriendo from "../../pixelsLoaders/corriendo.png";
import loaderPixelMancuarnas from "../../pixelsLoaders/mancuarnas.png";
import loaderPixelPesomuerto from "../../pixelsLoaders/pesomuerto.png";
import loaderPixelSaltando from "../../pixelsLoaders/saltando.png";
import loaderPixelSentadilla from "../../pixelsLoaders/sentadilla.png";
import loaderPixelVuelos from "../../pixelsLoaders/vuelos.png";

const FRAME_COUNT = 6;

export const IVIS_LOADER_SPRITES = [
  { name: "Sentadilla", fileName: "sentadilla.png", image: loaderPixelSentadilla },
  { name: "Mancuernas", fileName: "mancuarnas.png", image: loaderPixelMancuarnas },
  { name: "Peso muerto", fileName: "pesomuerto.png", image: loaderPixelPesomuerto },
  { name: "Vuelos", fileName: "vuelos.png", image: loaderPixelVuelos },
  { name: "Corriendo", fileName: "corriendo.png", image: loaderPixelCorriendo },
  { name: "Saltando", fileName: "saltando.png", image: loaderPixelSaltando },
] as const;

function pickSprite(seed: string): StaticImageData {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return IVIS_LOADER_SPRITES[(hash >>> 0) % IVIS_LOADER_SPRITES.length].image;
}

export function IvisSprite({
  image,
  size = "page",
}: {
  image: StaticImageData;
  size?: "page" | "section" | "preview";
}) {
  const style = {
    "--ivis-frames": FRAME_COUNT,
    "--ivis-frame-ratio": `${image.width / FRAME_COUNT} / ${image.height}`,
  } as CSSProperties;

  return (
    <div className={`ivis-sprite ivis-sprite--${size}`} style={style} aria-hidden>
      <img
        className="ivis-sprite__sheet"
        src={image.src}
        alt=""
        draggable={false}
        decoding="async"
      />
    </div>
  );
}

export function IvisContentLoader({
  label = "Cargando",
  seed,
  variant = "page",
}: {
  label?: string;
  seed?: string;
  variant?: "page" | "section";
}) {
  const pathname = usePathname() ?? "";
  const image = pickSprite(seed ?? `${pathname}|${label}`);

  return (
    <div
      className={`ivis-loader ivis-loader--${variant}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <IvisSprite image={image} size={variant} />
      <span className="ivis-loader__status">{label}</span>
    </div>
  );
}
