const OPTIMIZED_ROOT = "/imgs/";

export type PublicImageSources = {
  src: string;
  webp?: string;
  avif?: string;
};

function swapExtension(path: string, ext: string): string {
  return path.replace(/\.(jpe?g|png)$/i, `.${ext}`);
}

/** Modern formats for static files under `/imgs/` (original kept as fallback). */
export function publicImageSources(path: string): PublicImageSources {
  if (!path.startsWith(OPTIMIZED_ROOT)) {
    return { src: path };
  }
  if (!/\.(jpe?g|png)$/i.test(path)) {
    return { src: path };
  }
  return {
    src: path,
    webp: swapExtension(path, "webp"),
    avif: swapExtension(path, "avif"),
  };
}

/** CSS `image-set` for background layers (fallback to original URL). */
export function publicBackgroundStyle(path: string): string {
  if (!path.startsWith(OPTIMIZED_ROOT)) {
    return `url("${path}")`;
  }
  return publicBackgroundImageSet(path);
}

export function publicBackgroundImageSet(path: string): string {
  const { src, webp, avif } = publicImageSources(path);
  const parts: string[] = [];
  if (avif) parts.push(`url("${avif}") type("image/avif")`);
  if (webp) parts.push(`url("${webp}") type("image/webp")`);
  parts.push(`url("${src}") type("image/jpeg")`);
  return `image-set(${parts.join(", ")})`;
}
