"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { apiFetch } from "@/lib/api";

const DEFAULT_CARD_IMAGE = "/imgs/imagenback1.jpg";
const MAX_CARD_IMAGE_BYTES = 3 * 1024 * 1024;
const ALLOWED_CARD_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type CardImageUploadResponse = {
  url: string;
};

function validateCardImage(file: File): string | null {
  if (!ALLOWED_CARD_IMAGE_TYPES.has(file.type)) {
    return "La imagen debe ser JPG, PNG o WebP.";
  }

  if (file.size > MAX_CARD_IMAGE_BYTES) {
    return "La imagen no puede superar 3 MB.";
  }

  return null;
}

type PlanCardImagePickerProps = {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export function PlanCardImagePicker({
  value,
  onChange,
  disabled = false,
}: PlanCardImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewImage = value.trim() || DEFAULT_CARD_IMAGE;
  const hasCustomImage = Boolean(value.trim());

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const validationError = validateCardImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await apiFetch<CardImageUploadResponse>(
        "/api/landing-planes/card-image",
        {
          method: "POST",
          body: file,
          headers: {
            "Content-Type": file.type,
            "X-File-Name": file.name,
          },
        },
      );
      onChange(result.url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo subir la imagen",
      );
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setError(null);
    onChange("");
  }

  const isDisabled = disabled || uploading;

  return (
    <div className="plan-card-image-picker">
      <span className="plan-card-image-picker__label">Imagen de tarjeta</span>

      <div
        className={`plan-card-image-picker__preview${
          hasCustomImage ? "" : " plan-card-image-picker__preview--placeholder"
        }`}
      >
        <img
          src={previewImage}
          alt={
            hasCustomImage
              ? "Vista previa de la imagen de la tarjeta"
              : "Vista previa con imagen por defecto"
          }
          className="plan-card-image-picker__image"
        />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="plan-card-image-picker__input"
        onChange={handleFileChange}
        disabled={isDisabled}
      />

      <div className="plan-card-image-picker__actions">
        <Button
          type="button"
          disabled={isDisabled}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Subiendo..." : hasCustomImage ? "Cambiar imagen" : "Elegir imagen"}
        </Button>

        {hasCustomImage ? (
          <Button
            type="button"
            variant="ghost"
            disabled={isDisabled}
            onClick={handleRemove}
          >
            Quitar imagen
          </Button>
        ) : null}
      </div>

      {!hasCustomImage ? (
        <p className="plan-card-image-picker__hint">
          Si no subís una imagen, la landing usará la foto por defecto.
        </p>
      ) : null}

      {error ? <p className="auth-error">{error}</p> : null}
    </div>
  );
}
