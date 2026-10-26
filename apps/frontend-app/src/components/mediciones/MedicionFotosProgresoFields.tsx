"use client";
import { FeedbackModal } from "@/components/FeedbackModal";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { apiFetch, ApiError } from "@/lib/api";
import { prepareProgressPhoto } from "@/lib/image-upload";
import type {
  FotosProgreso,
  FotosProgresoSlot,
  MedicionImagen,
} from "@/features/profe/types/medicion";
import "./MedicionFotosProgresoFields.css";

const SLOTS: { key: FotosProgresoSlot; label: string }[] = [
  { key: "frente", label: "Frente" },
  { key: "espalda", label: "Espalda" },
  { key: "perfilIzquierdo", label: "Perfil izquierdo" },
  { key: "perfilDerecho", label: "Perfil derecho" },
];

const ACCEPT = "image/*,.heic,.heif";

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
  onUploadingChange?: (uploading: boolean) => void;
  value?: Partial<Record<FotosProgresoSlot, MedicionImagen | null>>;
  onChange?: (
    fotos: Partial<Record<FotosProgresoSlot, MedicionImagen | null>>,
  ) => void;
};

export function MedicionFotosProgresoFields({
  disabled = false,
  onDirtyChange,
  onUploadingChange,
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
  const cameraInputRefs = useRef<
    Partial<Record<FotosProgresoSlot, HTMLInputElement | null>>
  >({});
  const galleryInputRefs = useRef<
    Partial<Record<FotosProgresoSlot, HTMLInputElement | null>>
  >({});
  const fotosRef = useRef(fotos);
  const [inputsReady, setInputsReady] = useState(false);

  useLayoutEffect(() => {
    setInputsReady(true);
  }, []);

  const resolvedFotos = value ?? fotos;
  fotosRef.current = resolvedFotos;

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

  useEffect(() => {
    onUploadingChange?.(uploadingSlot !== null);
  }, [onUploadingChange, uploadingSlot]);

  async function handleFileChange(
    slot: FotosProgresoSlot,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setUploadingSlot(slot);

    try {
      const prepared = await prepareProgressPhoto(file);
      const uploaded = await apiFetch<UploadResponse>("/api/mediciones/fotos", {
        method: "POST",
        body: prepared,
        headers: {
          "Content-Type": "image/jpeg",
          "X-File-Name": "progreso.jpg",
        },
      });
      updateFotos({ ...fotosRef.current, [slot]: uploaded });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
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

  function openFilePicker(slot: FotosProgresoSlot, source: "camera" | "gallery") {
    if (disabled || uploadingSlot === slot) return;
    const input =
      source === "camera"
        ? cameraInputRefs.current[slot]
        : galleryInputRefs.current[slot];
    if (!input) return;
    try {
      input.click();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo abrir la cámara o la galería.",
      );
    }
  }

  const fileInputs = SLOTS.flatMap(({ key }) => {
    const isUploading = uploadingSlot === key;
    return [
      <input
        key={`${key}-camera`}
        ref={(el) => {
          cameraInputRefs.current[key] = el;
        }}
        type="file"
        accept={ACCEPT}
        capture="environment"
        className="medicion-fotos__file-input"
        disabled={disabled || isUploading}
        onChange={(event) => {
          event.stopPropagation();
          void handleFileChange(key, event);
        }}
        tabIndex={-1}
        aria-hidden="true"
      />,
      <input
        key={`${key}-gallery`}
        ref={(el) => {
          galleryInputRefs.current[key] = el;
        }}
        type="file"
        accept={ACCEPT}
        className="medicion-fotos__file-input"
        disabled={disabled || isUploading}
        onChange={(event) => {
          event.stopPropagation();
          void handleFileChange(key, event);
        }}
        tabIndex={-1}
        aria-hidden="true"
      />,
    ];
  });

  return (
    <fieldset className="medicion-fotos" disabled={disabled}>
      {inputsReady
        ? createPortal(
            <div className="medicion-fotos__inputs">{fileInputs}</div>,
            document.body,
          )
        : null}
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
              {imagen ? (
                <div className="medicion-fotos__preview">
                  <img src={imagen.url} alt={label} loading="lazy" />
                  <div className="medicion-fotos__slot-actions">
                    <button
                      type="button"
                      className="medicion-fotos__file-btn"
                      disabled={disabled || isUploading}
                      onClick={() => openFilePicker(key, "camera")}
                    >
                      {isUploading ? "Subiendo..." : "Tomar foto"}
                    </button>
                    <button
                      type="button"
                      className="medicion-fotos__file-btn"
                      disabled={disabled || isUploading}
                      onClick={() => openFilePicker(key, "gallery")}
                    >
                      {isUploading ? "Subiendo..." : "Galería"}
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
                <div className="medicion-fotos__picker">
                  <button
                    type="button"
                    className="medicion-fotos__file-btn"
                    disabled={disabled || isUploading}
                    onClick={() => openFilePicker(key, "camera")}
                  >
                    {isUploading ? "Subiendo..." : "Tomar foto"}
                  </button>
                  <button
                    type="button"
                    className="medicion-fotos__file-btn"
                    disabled={disabled || isUploading}
                    onClick={() => openFilePicker(key, "gallery")}
                  >
                    {isUploading ? "Subiendo..." : "Galería"}
                  </button>
                </div>
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
