"use client";

import type { ElementType } from "react";
import { T } from "@/lib/preview-cms/lib/content-edit/T";
import { Img } from "@/lib/preview-cms/lib/content-edit/Img";

type PlanFieldPath =
  | "title"
  | "shortTitle"
  | "subtitle"
  | "duration"
  | "format"
  | "investment"
  | "badge"
  | "intro"
  | "focus"
  | "methodology"
  | "ctaLabel"
  | "cardImage";

function planPath(slug: string, field: string) {
  return `planes.bySlug.${slug}.${field}`;
}

type PlanTextProps = {
  slug: string;
  field: PlanFieldPath;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
};

export function PlanText({ slug, field, as, className, multiline }: PlanTextProps) {
  return (
    <T
      path={planPath(slug, field)}
      as={as}
      className={className}
      multiline={multiline}
    />
  );
}

type PlanImgProps = {
  slug: string;
  fallback: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
};

export function PlanImg({
  slug,
  fallback,
  alt,
  className,
  fill,
  sizes,
  width,
  height,
}: PlanImgProps) {
  return (
    <Img
      path={planPath(slug, "cardImage")}
      fallback={fallback}
      alt={alt}
      className={className}
      fill={fill}
      sizes={sizes}
      width={width}
      height={height}
    />
  );
}

type PlanBulletTextProps = {
  slug: string;
  index: number;
  className?: string;
};

export function PlanBulletText({ slug, index, className }: PlanBulletTextProps) {
  return (
    <T
      path={`planes.bySlug.${slug}.cardBullets.${index}`}
      className={className}
    />
  );
}

type PlanExtraTextProps = {
  slug: string;
  index: number;
  className?: string;
};

export function PlanExtraText({ slug, index, className }: PlanExtraTextProps) {
  return (
    <T path={`planes.bySlug.${slug}.extras.${index}`} className={className} />
  );
}

type PlanBenefitTextProps = {
  slug: string;
  index: number;
  className?: string;
};

export function PlanBenefitText({ slug, index, className }: PlanBenefitTextProps) {
  return (
    <T path={`planes.bySlug.${slug}.benefits.${index}`} className={className} />
  );
}

type SectionTextProps = {
  field: "eyebrow" | "title" | "subtitle";
  as?: ElementType;
  className?: string;
  multiline?: boolean;
};

export function SectionText({ field, as, className, multiline }: SectionTextProps) {
  return (
    <T
      path={`planes.section.${field}`}
      as={as}
      className={className}
      multiline={multiline}
    />
  );
}
