"use client";
import { FeedbackModal } from "@/components/FeedbackModal";

import { ChangeEvent, useCallback, useRef, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import {
  resolveImageContentType,
  validateProgressPhotoFile,
} from "@/lib/image-upload";
import type {
  FotosProgreso,
  FotosProgresoSlot,
  MedicionImagen,
} from "@/features/profe/types/medicion";
import "./MedicionFotosProgresoFields.css";

const MAX_BYTES = 5 * 1024 * 1024;

const SLOTS: { key: FotosProgresoSlot; label: string }[] = [
  { key: "frente", label: "Frente" },
  { key: "espalda", label: "Espalda" },
  { key: "perfilIzquierdo", label: "Perfil izquierdo" },
  { key: "perfilDerecho", label: "Perfil derecho" },
];

type UploadResponse = MedicionImagen & { uploadedAt: string };

export function buildFotosProgresoPayload(
  fotos: Partial<Record<FotosProgresoSlot, MedicionImagen | null>>,
): FotosProgreso | undefined {
  const entries = SLOTS
    .map(({ key }) => [key, fotos[key]] as const)
    .filter(([, imagen]) => imagen != null);

  if (entries.length === 0) return undefined;

  return Object.fromEntries(entries) as FotosProgreso;
}

export function hasFotosProgreso(
  fotos: Partial<Record<FotosProgresoSlot, MedicionImagen | null>>,
) {
  return SLOTS.some(({ key }) => fotos[key] != null);
}

type MedicionFotosProgresoFieldsProps = {
  disabled?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
  value?: Partial<Record<FotosProgresoSlot, MedicionImagen | null>>;
  onChange?: (
    fotos: Partial<Record<FotosProgresoSlot, MedicionImagen | null>>,
  ) => void;
};

export function MedicionFotosProgresoFields({
  disabled = false,
  onDirtyChange,
  value,
  onChange,
}: MedicionFotosProgresoFieldsProps) {
  const [fotos, setFotos] = useState<
    Partial<Record<FotosProgresoSlot, MedicionImagen | null>>
  >({});
  const [uploadingSlot, setUploadingSlot] = useState<FotosProgresoSlot | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<
    Partial<Record<FotosProgresoSlot, HTMLInputElement | null>>
  >({});

  const resolvedFotos = value ?? fotos;

  const updateFotos = useCallback(
    (next: Partial<Record<FotosProgresoSlot, MedicionImagen | null>>) => {
      if (onChange) {
        onChange(next);
      } else {
        setFotos(next);
      }
      onDirtyChange?.(hasFotosProgreso(next));
    },
    [onChange, onDirtyChange],
  );

  async function handleFileChange(
    slot: FotosProgresoSlot,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validationError = validateProgressPhotoFile(file, MAX_BYTES);
    if (validationError) {
      setError(validationError);
      return;
    }

    const contentType = resolveImageContentType(file);
    if (!contentType) {
      setError(
        "La foto debe ser JPG, PNG o WebP (no se admite HEIC u otros formatos).",
      );
      return;
    }

    setError(null);
    setUploadingSlot(slot);

    try {
      const uploaded = await apiFetch<UploadResponse>("/api/mediciones/fotos", {
        method: "POST",
        body: file,
        headers: {
          "Content-Type": contentType,
          "X-File-Name": file.name,
        },
      });
      updateFotos({ ...resolvedFotos, [slot]: uploaded });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "No se pudo subir la foto. Intentá de nuevo.";
      setError(message);
    } finally {
      setUploadingSlot(null);
    }
  }

  function handleRemove(slot: FotosProgresoSlot) {
    const next = { ...resolvedFotos, [slot]: null };
    updateFotos(next);
    setError(null);
  }

  function openFilePicker(slot: FotosProgresoSlot) {
    if (disabled || uploadingSlot === slot) return;
    inputRefs.current[slot]?.click();
  }

  return (
    <fieldset className="medicion-fotos" disabled={disabled}>
      <legend className="medicion-fotos__legend">Fotos de progreso (opcional)</legend>
      <p className="medicion-fotos__hint">
        Frente, espalda y perfiles al momento de la medición de pliegues.
      </p>
      <div className="medicion-fotos__grid">
        {SLOTS.map(({ key, label }) => {
          const imagen = resolvedFotos[key];
          const isUploading = uploadingSlot === key;

          return (
            <div className="medicion-fotos__slot" key={key}>
              <span className="medicion-fotos__slot-label">{label}</span>
              <input
                ref={(el) => {
                  inputRefs.current[key] = el;
                }}
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                className="medicion-fotos__file-input"
                disabled={disabled || isUploading}
                onChange={(event) => void handleFileChange(key, event)}
                tabIndex={-1}
                aria-hidden="true"
              />
              {imagen ? (
                <div className="medicion-fotos__preview">
                  <img src={imagen.url} alt={label} loading="lazy" />
                  <div className="medicion-fotos__slot-actions">
                    <button
                      type="button"
                      className="medicion-fotos__file-btn"
                      disabled={disabled || isUploading}
                      onClick={() => openFilePicker(key)}
                    >
                      Cambiar
                    </button>
                    <button
                      type="button"
                      className="medicion-fotos__remove-btn"
                      disabled={disabled || isUploading}
                      onClick={() => handleRemove(key)}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="medicion-fotos__empty"
                  disabled={disabled || isUploading}
                  onClick={() => openFilePicker(key)}
                >
                  {isUploading ? "Subiendo..." : "Elegir foto"}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <FeedbackModal message={error} />
    </fieldset>
  );
}

export function emptyFotosProgresoState(): Partial<
  Record<FotosProgresoSlot, MedicionImagen | null>
> {
  return {};
}
