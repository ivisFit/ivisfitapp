"use client";

import { useCallback, useRef, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { FaArrowRight } from "react-icons/fa";
import { PlanBulletText, PlanText } from "@/features/landing/cms/PlanCmsFields";
import { useContent } from "@/lib/preview-cms/lib/content-edit/useContent";
import { useEditOptional } from "@/lib/preview-cms/lib/content-edit/EditProvider";
import { getApiErrorMessage } from "@/lib/preview-cms/lib/api-errors";
import { useImageUpload } from "@/lib/preview-cms/lib/content-edit/useImageUpload";
import { normalizeStoredImageUrl, resolveUploadUrl } from "@/lib/preview-cms/lib/uploads";
import { PlanCardPreviewChrome } from "./PlanCardPreviewChrome";
import {
  CardBadge,
  CardCtaButton,
  CardFeatureIcon,
  CardFeatureItem,
  CardFeatureList,
  CardFeatures,
  CardFooter,
  CardHeader,
  CardInner,
  CardPeriod,
  CardPrice,
  CardPriceBlock,
  CardSubtitle,
  CardSurface,
  CardTitle,
} from "../Card/cardStyles";

const DEFAULT_CARD_IMAGE = "/imgs/imagenback1.jpg";

const IMAGE_UPLOAD_ERRORS = {
  generic: "No se pudo subir la imagen. Intentá con otra foto.",
  network: "No se pudo subir la imagen. Revisá tu conexión e intentá de nuevo.",
  validation: "Ese archivo no es una imagen válida. Usá JPG, PNG o WebP.",
  api: {},
} as const;

function isTextOrInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return !!target.closest(
    '[contenteditable="true"], [data-preview-nav], [data-preview-card-chrome], [data-preview-image-edit], input, button, a, label',
  );
}

type PlanPriceCardProps = {
  variant: "desktop" | "mobile";
  slug: string;
  link: string;
  cardBullets: string[];
  fallbackImage?: string;
  isActive?: boolean;
};

export function PlanPriceCard({
  variant,
  slug,
  link,
  cardBullets,
  fallbackImage = DEFAULT_CARD_IMAGE,
  isActive: fallbackActive = true,
}: PlanPriceCardProps) {
  const router = useRouter();
  const { text, bool, setText, suppressNavigation, isEditing } = useContent();
  const edit = useEditOptional();
  const { uploadImage, uploading } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imagePath = `planes.bySlug.${slug}.cardImage`;
  const activePath = `planes.bySlug.${slug}.isActive`;
  const imageUrl = resolveUploadUrl(text(imagePath) || fallbackImage) ?? fallbackImage;
  const isActive = bool(activePath) ?? fallbackActive;

  const handleCtaClick = useCallback(() => {
    if (suppressNavigation && edit) {
      edit.setPreviewRoute(link);
      return;
    }
    router.push(link);
  }, [edit, link, router, suppressNavigation]);

  const handleCardClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!isEditing || uploading) return;
      if (isTextOrInteractiveTarget(event.target)) return;
      fileInputRef.current?.click();
    },
    [isEditing, uploading],
  );

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      try {
        const url = normalizeStoredImageUrl(await uploadImage(file));
        setText(imagePath, url);
      } catch (error) {
        console.error(getApiErrorMessage(error, IMAGE_UPLOAD_ERRORS));
      }
    },
    [imagePath, setText, uploadImage],
  );

  const surfaceClassName = [
    "plan-price-card",
    isEditing ? "plan-price-card--editable" : "",
    isEditing && !isActive ? "plan-price-card--inactive" : "",
    isEditing && uploading ? "plan-price-card--uploading" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <CardSurface
      $variant={variant}
      className={surfaceClassName}
      style={{ backgroundImage: `url(${imageUrl})` }}
      onClick={isEditing ? handleCardClick : undefined}
      aria-label={isEditing ? "Clic en el fondo para cambiar la imagen del plan" : undefined}
    >
      {isEditing ? (
        <>
          <PlanCardPreviewChrome slug={slug} fallbackActive={fallbackActive} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="sr-only"
            data-preview-image-edit
            onChange={(event) => void handleFileChange(event)}
          />
        </>
      ) : null}
      <CardBadge>
        <PlanText slug={slug} field="badge" />
      </CardBadge>
      <CardInner>
        <CardHeader>
          <CardTitle>
            <PlanText slug={slug} field="shortTitle" />
          </CardTitle>
          <CardSubtitle>
            <PlanText slug={slug} field="subtitle" />
          </CardSubtitle>
        </CardHeader>

        <CardPriceBlock>
          <CardPrice>
            <PlanText slug={slug} field="investment" />
            <CardPeriod>
              <PlanText slug={slug} field="duration" />
            </CardPeriod>
          </CardPrice>
        </CardPriceBlock>

        <CardFeatures>
          <CardFeatureList>
            {cardBullets.map((_, index) => (
              <CardFeatureItem key={index}>
                <CardFeatureIcon aria-hidden>
                  <FaArrowRight />
                </CardFeatureIcon>
                <span>
                  <PlanBulletText slug={slug} index={index} />
                </span>
              </CardFeatureItem>
            ))}
          </CardFeatureList>
        </CardFeatures>

        <CardFooter>
          <CardCtaButton type="button" data-preview-nav onClick={handleCtaClick}>
            <PlanText slug={slug} field="ctaLabel" /> <FaArrowRight />
          </CardCtaButton>
        </CardFooter>
      </CardInner>
    </CardSurface>
  );
}
