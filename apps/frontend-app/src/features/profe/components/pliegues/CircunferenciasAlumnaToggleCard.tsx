"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { UsuarioApiDoc } from "@/types/usuario";

type CircunferenciasAlumnaToggleCardProps = {
  alumnaId: string;
  enabled: boolean;
  onUpdated?: () => void;
};

export function CircunferenciasAlumnaToggleCard({
  alumnaId,
  enabled,
  onUpdated,
}: CircunferenciasAlumnaToggleCardProps) {
  const [checked, setChecked] = useState(enabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setChecked(enabled);
  }, [enabled]);

  async function handleChange(next: boolean) {
    setChecked(next);
    setSaving(true);
    setError(null);

    try {
      await apiFetch<UsuarioApiDoc>(`/api/usuarios/${alumnaId}`, {
        method: "PATCH",
        body: JSON.stringify({ circunferenciasHabilitadas: next }),
      });
      onUpdated?.();
    } catch (err) {
      setChecked(!next);
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo actualizar la configuración.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="pliegues-settings-card">
      <h2>Circunferencias en la app de la alumna</h2>
      <p className="pliegues-settings-card__copy">
        Al activar esta opción, la alumna podrá registrar sus mediciones de
        cuello, cintura y cadera en la sección Circunferencias de su app, con la
        misma fórmula US Navy que usás acá.
      </p>
      <label className="auth-checkbox pliegues-settings-card__toggle">
        <input
          type="checkbox"
          checked={checked}
          disabled={saving}
          onChange={(event) => void handleChange(event.target.checked)}
        />
        <span>Habilitar medición de circunferencias para esta alumna</span>
      </label>
      {error ? <p className="auth-error">{error}</p> : null}
    </section>
  );
}
