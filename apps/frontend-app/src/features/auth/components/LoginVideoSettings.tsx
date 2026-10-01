"use client";

import "./LoginVideoSettings.css";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { apiFetch } from "@/lib/api";
import { DEFAULT_AUTH_VIDEO_SRC } from "@/lib/auth-login-video.constants";

const MAX_LOGIN_VIDEO_BYTES = 8 * 1024 * 1024;
const LOGIN_VIDEO_UPLOAD_TIMEOUT_MS = 120_000;
const ALLOWED_LOGIN_VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);

type AppAppearanceResponse = {
  loginVideoUrl: string | null;
  loginVideoPublicId: string | null;
};

function validateLoginVideo(file: File): string | null {
  if (!ALLOWED_LOGIN_VIDEO_TYPES.has(file.type)) {
    return "El video debe ser MP4 o WebM.";
  }

  if (file.size > MAX_LOGIN_VIDEO_BYTES) {
    return "El video no puede superar 8 MB.";
  }

  return null;
}

export function LoginVideoSettings() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const previewSrc = customVideoUrl?.trim() || DEFAULT_AUTH_VIDEO_SRC;
  const hasCustomVideo = Boolean(customVideoUrl?.trim());

  const loadAppearance = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<AppAppearanceResponse>("/api/app-appearance");
      setCustomVideoUrl(data.loginVideoUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el video de fondo",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAppearance();
  }, [loadAppearance]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const validationError = validateLoginVideo(file);
    if (validationError) {
      setError(validationError);
      setSuccess(null);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await apiFetch<AppAppearanceResponse>(
        "/api/app-appearance/login-video",
        {
          method: "POST",
          body: file,
          headers: {
            "Content-Type": file.type,
            "X-File-Name": file.name,
          },
          timeoutMs: LOGIN_VIDEO_UPLOAD_TIMEOUT_MS,
        },
      );
      setCustomVideoUrl(result.loginVideoUrl);
      setSuccess("El video de fondo del login fue actualizado.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo subir el video",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRestore() {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await apiFetch<AppAppearanceResponse>("/api/app-appearance/login-video", {
        method: "DELETE",
      });
      setCustomVideoUrl(null);
      setSuccess("Se restauró el video original del login.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo restaurar el video",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const isDisabled = submitting || loading;

  return (
    <div className="feature-card login-video-settings">
      <h2>Video de fondo del login</h2>
      <p>
        Personalizá el video de las pantallas de acceso (login, registro y
        recuperación de contraseña).
      </p>

      <div className="login-video-settings__preview">
        <video
          key={previewSrc}
          className="login-video-settings__video"
          src={previewSrc}
          muted
          playsInline
          autoPlay
          loop
          preload="metadata"
          aria-label="Vista previa del video de fondo del login"
        />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm"
        className="login-video-settings__input"
        onChange={handleFileChange}
        disabled={isDisabled}
      />

      <div className="login-video-settings__actions">
        <Button
          type="button"
          disabled={isDisabled}
          onClick={() => inputRef.current?.click()}
        >
          {submitting ? "Subiendo..." : hasCustomVideo ? "Cambiar video" : "Elegir video"}
        </Button>

        {hasCustomVideo ? (
          <Button
            type="button"
            variant="ghost"
            disabled={isDisabled}
            onClick={handleRestore}
          >
            Restaurar original
          </Button>
        ) : null}
      </div>

      <p className="login-video-settings__hint">
        MP4 o WebM, máximo 8 MB. Un clip corto en bucle (por ejemplo tipo
        boomerang) suele verse mejor.
      </p>

      {error ? <p className="auth-error">{error}</p> : null}
      {success ? <p className="auth-hint">{success}</p> : null}
    </div>
  );
}
