'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../cn';
import { getApiErrorMessage } from '../api-errors';
import { normalizeStoredImageUrl, resolveUploadUrl } from '../uploads';
import { useContent } from './useContent';
import { useImageUpload } from './useImageUpload';

const IMAGE_UPLOAD_ERRORS = {
  generic: 'No se pudo subir la imagen. Intentá con otra foto.',
  network: 'No se pudo subir la imagen. Revisá tu conexión e intentá de nuevo.',
  validation: 'Ese archivo no es una imagen válida. Usá JPG, PNG o WebP.',
  api: {},
} as const;

type ImgProps = {
  path: string;
  fallback: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
};

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-100 text-center text-neutral-500">
      <span className="text-xs uppercase tracking-widest">{label}</span>
    </div>
  );
}

/** Imagen: estática en el sitio, editable con subida en el editor. */
export function Img({
  path,
  fallback,
  alt,
  className,
  fill,
  sizes,
  width,
  height,
  priority,
  loading,
}: ImgProps) {
  const { text, setText, isEditing } = useContent();
  const { uploadImage, uploading } = useImageUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  const cmsSrc = text(path)?.trim();
  const primarySrc = useMemo(() => {
    const raw = cmsSrc || fallback;
    return resolveUploadUrl(raw) ?? raw;
  }, [cmsSrc, fallback]);
  const fallbackSrc = useMemo(
    () => resolveUploadUrl(fallback) ?? fallback,
    [fallback],
  );
  const [displaySrc, setDisplaySrc] = useState(primarySrc);

  useEffect(() => {
    setDisplaySrc(primarySrc);
  }, [primarySrc]);

  const handleImageError = useCallback(() => {
    setDisplaySrc((current) => (current !== fallbackSrc ? fallbackSrc : current));
  }, [fallbackSrc]);

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const url = normalizeStoredImageUrl(await uploadImage(file));
        setText(path, url);
      } catch (error) {
        console.error(getApiErrorMessage(error, IMAGE_UPLOAD_ERRORS));
      } finally {
        e.target.value = '';
      }
    },
    [path, setText, uploadImage],
  );

  const isAbsolute = className?.includes("absolute");

  const isApiUpload =
    typeof displaySrc === "string" && displaySrc.includes("/api/uploads/");

  const imageNode = displaySrc ? (
    <Image
      src={displaySrc}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width ?? 800}
      height={fill ? undefined : height ?? 450}
      className={cn(!fill && "h-auto max-w-full", className)}
      style={fill || isAbsolute ? undefined : { width: "100%", height: "auto" }}
      sizes={sizes}
      priority={priority}
      unoptimized={isApiUpload}
      loading={priority ? undefined : loading ?? 'lazy'}
      onError={handleImageError}
    />
  ) : (
    <Placeholder label="Imagen" />
  );

  if (!isEditing) {
    if (!displaySrc) return null;
    return fill ? <div className="relative h-full w-full">{imageNode}</div> : imageNode;
  }

  return (
    <div
      className={cn(
        "group relative",
        fill ? "h-full w-full" : "inline-block max-w-full",
      )}
    >
      {imageNode}
      <button
        type="button"
        data-preview-image-edit
        disabled={uploading}
        aria-label="Cambiar imagen"
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.click();
        }}
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          'bg-black/40 opacity-0 transition-opacity group-hover:opacity-100',
          'border border-dashed border-blue-400/50',
          uploading && 'opacity-100',
        )}
      >
        <span className="rounded bg-white/90 px-3 py-1 text-sm text-neutral-800">
          {uploading ? 'Subiendo…' : 'Cambiar imagen'}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="sr-only"
        data-preview-image-edit
        onChange={(e) => void onFileChange(e)}
      />
    </div>
  );
}
