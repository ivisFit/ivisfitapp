"use client";

import "./ProfilePhotoSettings.css";
import {
  ChangeEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/Button";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, formatApiError } from "@/lib/api";
import { prepareFotoPerfil } from "@/lib/image-upload";
import type { UsuarioApiDoc } from "@/types/usuario";

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";

export function ProfilePhotoSettings() {
  const { user, refreshProfile } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputReady, setInputReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useLayoutEffect(() => {
    setInputReady(true);
  }, []);

  if (!user) return null;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const prepared = await prepareFotoPerfil(file);
      await apiFetch<UsuarioApiDoc>("/api/me/foto-perfil", {
        method: "POST",
        body: prepared,
        headers: {
          "Content-Type": "image/jpeg",
          "X-File-Name": "foto-perfil.jpg",
        },
      });
      await refreshProfile();
      setSuccess("Tu foto de perfil fue actualizada.");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove() {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await apiFetch<UsuarioApiDoc>("/api/me/foto-perfil", {
        method: "DELETE",
      });
      await refreshProfile();
      setSuccess("Tu foto de perfil fue eliminada.");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  function openFilePicker() {
    if (submitting) return;
    try {
      inputRef.current?.click();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo abrir la galería de fotos.",
      );
    }
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept={ACCEPT}
      className="profile-photo-settings__input"
      onChange={(event) => {
        event.stopPropagation();
        void handleFileChange(event);
      }}
      disabled={submitting}
      tabIndex={-1}
      aria-hidden="true"
    />
  );

  return (
    <div className="feature-card profile-photo-settings">
      <h2>Foto de perfil</h2>
      <p>Mostrá tu foto en la app. Si no subís una, se usan tus iniciales.</p>

      {inputReady
        ? createPortal(
            <div className="profile-photo-settings__input-host">{fileInput}</div>,
            document.body,
          )
        : null}

      <div className="profile-photo-settings__preview">
        <UserAvatar
          name={user.name}
          photoUrl={user.photoUrl ?? null}
          className="profile-photo-settings__avatar"
        />
      </div>

      <div className="profile-photo-settings__actions">
        <Button type="button" disabled={submitting} onClick={openFilePicker}>
          {submitting
            ? "Guardando..."
            : user.photoUrl
              ? "Cambiar foto"
              : "Subir foto"}
        </Button>

        {user.photoUrl ? (
          <Button
            type="button"
            variant="ghost"
            disabled={submitting}
            onClick={handleRemove}
          >
            Quitar foto
          </Button>
        ) : null}
      </div>

      {error ? <p className="auth-error">{error}</p> : null}
      {success ? <p className="auth-hint">{success}</p> : null}
    </div>
  );
}
