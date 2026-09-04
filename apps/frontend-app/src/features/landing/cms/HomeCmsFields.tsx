"use client";

import type { ElementType } from "react";
import { T } from "@/lib/preview-cms/lib/content-edit/T";
import { Img } from "@/lib/preview-cms/lib/content-edit/Img";

function homePath(field: string) {
  return `home.${field}`;
}

type HomeTextProps = {
  field: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
};

export function HomeText({ field, as, className, multiline }: HomeTextProps) {
  return (
    <T path={homePath(field)} as={as} className={className} multiline={multiline} />
  );
}

type HomeImgProps = {
  field: string;
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

export function HomeImg({
  field,
  fallback,
  alt,
  className,
  fill,
  sizes,
  width,
  height,
  priority,
  loading,
}: HomeImgProps) {
  return (
    <Img
      path={homePath(field)}
      fallback={fallback}
      alt={alt}
      className={className}
      fill={fill}
      sizes={sizes}
      width={width}
      height={height}
      priority={priority}
      loading={loading}
    />
  );
}

type HomeGalleryImgProps = {
  index: number;
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

export function HomeGalleryImg({
  index,
  fallback,
  alt,
  className,
  fill,
  sizes,
  width,
  height,
  priority,
  loading,
}: HomeGalleryImgProps) {
  const isPriority = priority ?? false;

  return (
    <HomeImg
      field={`transformaciones.images.${index}`}
      fallback={fallback}
      alt={alt}
      className={className}
      fill={fill}
      sizes={sizes}
      width={width}
      height={height}
      priority={isPriority}
      loading={loading ?? (isPriority ? 'eager' : 'lazy')}
    />
  );
}

type HomeArrayTextProps = {
  path: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
};

export function HomeArrayText({ path, as, className, multiline }: HomeArrayTextProps) {
  return <T path={path} as={as} className={className} multiline={multiline} />;
}
