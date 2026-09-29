"use client";

import type { CSSProperties, ReactNode } from "react";
import { publicImageSources } from "@/lib/public-image";

type PictureBackgroundProps = {
  src: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  loading?: "eager" | "lazy";
};

/**
 * Full-bleed background using `<picture>` (AVIF/WebP) instead of CSS url() only.
 */
export function PictureBackground({
  src,
  className,
  style,
  children,
  loading = "lazy",
}: PictureBackgroundProps) {
  const sources = publicImageSources(src);

  return (
    <div
      className={className}
      style={{ position: "relative", overflow: "hidden", ...style }}
    >
      <picture
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        {sources.avif ? <source srcSet={sources.avif} type="image/avif" /> : null}
        {sources.webp ? <source srcSet={sources.webp} type="image/webp" /> : null}
        <img
          src={sources.src}
          alt=""
          loading={loading}
          decoding="async"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </picture>
      {children ? (
        <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
