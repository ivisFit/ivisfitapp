"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { apiFetch } from "@/lib/api";

export function CoachNotaComposer({
  alumnaId,
  bare,
}: {
  alumnaId: string;
  /** Renderiza solo el formulario (sin tarjeta ni título) para usar dentro de un modal. */
  bare?: boolean;
}) {
  const [mensaje, setMensaje] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSend() {
    const body = mensaje.trim();
    if (!body) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await apiFetch("/api/coach-insights", {
        method: "POST",
        body: JSON.stringify({ alumnaId, mensaje: body }),
      });
      setMensaje("");
      setSuccess("Nota enviada a la alumna");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la nota");
    } finally {
      setSaving(false);
    }
  }

  const form = (
    <>
      <p className="alumna-profile-card__hint">
        Se muestra como insight en su app.
      </p>
      <label className="field" htmlFor={`nota-coach-${alumnaId}`}>
        <span className="field__label">Mensaje</span>
        <textarea
          id={`nota-coach-${alumnaId}`}
          className="field__input field__textarea"
          maxLength={500}
          rows={4}
          value={mensaje}
          onChange={(event) => setMensaje(event.target.value)}
          placeholder="Ej: Esta semana priorizá el descanso entre series..."
        />
      </label>
      <Button
        type="button"
        onClick={() => void handleSend()}
        disabled={saving || !mensaje.trim()}
      >
        {saving ? "Enviando..." : "Enviar"}
      </Button>
      {error ? <p className="auth-error">{error}</p> : null}
      {success ? <p className="auth-success">{success}</p> : null}
    </>
  );

  if (bare) return form;

  return (
    <section className="alumna-profile-card">
      <h2>Nota para la alumna</h2>
      {form}
    </section>
  );
}
