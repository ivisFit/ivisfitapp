const CLOUDINARY_IMAGE_UPLOAD =
  /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;

/**
 * Chrome en Windows no muestra HEIC. Cloudinary puede entregar JPEG/WebP
 * si pedimos f_auto en la URL de entrega.
 */
export function browserImageUrl(url: string): string {
  const match = url.match(CLOUDINARY_IMAGE_UPLOAD);
  if (!match) return url;

  const [, prefix, rest] = match;
  const firstSegment = rest.split("/")[0] ?? "";
  if (/(^|,)f_(auto|jpg|jpeg|png|webp|avif)(,|$)/.test(firstSegment)) {
    return url;
  }

  return `${prefix}f_auto,q_auto/${rest}`;
}
