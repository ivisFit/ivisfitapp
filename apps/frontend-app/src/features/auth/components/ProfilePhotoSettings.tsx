"use client";

import "./ProfilePhotoSettings.css";
import { ChangeEvent, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import type { UsuarioApiDoc } from "@/types/usuario";

const MAX_FOTO_PERFIL_BYTES = 2 * 1024 * 1024;
const ALLOWED_FOTO_PERFIL_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function validateFotoPerfil(file: File): string | null {
  if (!ALLOWED_FOTO_PERFIL_TYPES.has(file.type)) {
    return "La foto debe ser JPG, PNG o WebP.";
  }

  if (file.size > MAX_FOTO_PERFIL_BYTES) {
    return "La foto no puede superar 2 MB.";
  }

  return null;
}

export function ProfilePhotoSettings() {
  const { user, refreshProfile } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!user) return null;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const validationError = validateFotoPerfil(file);
    if (validationError) {
      setError(validationError);
      setSuccess(null);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await apiFetch<UsuarioApiDoc>("/api/me/foto-perfil", {
        method: "POST",
        body: file,
        headers: {
          "Content-Type": file.type,
          "X-File-Name": file.name,
        },
      });
      await refreshProfile();
      setSuccess("Tu foto de perfil fue actualizada.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo subir la foto de perfil",
      );
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
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar la foto de perfil",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="feature-card profile-photo-settings">
      <h2>Foto de perfil</h2>
      <p>Mostrá tu foto en la app. Si no subís una, se usan tus iniciales.</p>

      <div className="profile-photo-settings__preview">
        <UserAvatar
          name={user.name}
          photoUrl={user.photoUrl ?? null}
          className="profile-photo-settings__avatar"
        />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="profile-photo-settings__input"
        onChange={handleFileChange}
        disabled={submitting}
      />

      <div className="profile-photo-settings__actions">
        <Button
          type="button"
          disabled={submitting}
          onClick={() => inputRef.current?.click()}
        >
          {submitting ? "Guardando..." : user.photoUrl ? "Cambiar foto" : "Subir foto"}
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
