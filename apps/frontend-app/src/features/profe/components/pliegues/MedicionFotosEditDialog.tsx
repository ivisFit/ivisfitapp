"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { FeedbackModal } from "@/components/FeedbackModal";
import { MedicionFotosProgresoFields } from "@/components/mediciones/MedicionFotosProgresoFields";
import type {
  FotosProgreso,
  FotosProgresoSlot,
  Medicion,
  MedicionImagen,
} from "@/features/profe/types/medicion";
import { apiFetch, ApiError } from "@/lib/api";
import { invalidateCache } from "@/lib/apiCache";
import { formatMedicionDate } from "@/features/profe/utils/pliegues-period";

import "./MedicionFotosProgresoDialog.css";

const SLOTS: FotosProgresoSlot[] = [
  "frente",
  "espalda",
  "perfilIzquierdo",
  "perfilDerecho",
];

type FotoState = Partial<Record<FotosProgresoSlot, MedicionImagen | null>>;

function initialFotos(fotos?: FotosProgreso): FotoState {
  return {
    frente: fotos?.frente?.url ? fotos.frente : null,
    espalda: fotos?.espalda?.url ? fotos.espalda : null,
    perfilIzquierdo: fotos?.perfilIzquierdo?.url ? fotos.perfilIzquierdo : null,
    perfilDerecho: fotos?.perfilDerecho?.url ? fotos.perfilDerecho : null,
  };
}

type MedicionFotosEditDialogProps = {
  medicion: Medicion;
  onClose: () => void;
  onSaved: () => void;
};

export function MedicionFotosEditDialog({
  medicion,
  onClose,
  onSaved,
}: MedicionFotosEditDialogProps) {
  const [fotos, setFotos] = useState<FotoState>(() =>
    initialFotos(medicion.fotosProgreso),
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading || saving) return;

    setSaving(true);
    setError(null);

    const fotosProgreso = Object.fromEntries(
      SLOTS.map((slot) => [slot, fotos[slot] ?? null]),
    );

    try {
      await apiFetch(`/api/mediciones/${medicion.id}/fotos`, {
        method: "PATCH",
        body: JSON.stringify({ fotosProgreso }),
      });
      invalidateCache("/api/mediciones");
      onSaved();
      onClose();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "No se pudieron guardar las fotos. Intentá de nuevo.";
      setError(message);
      setSaving(false);
    }
  }

  function handleClose() {
    if (saving) return;
    onClose();
  }

  return (
    <div
      className="medicion-fotos-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="medicion-fotos-edit-title"
    >
      <button
        type="button"
        className="medicion-fotos-dialog__backdrop"
        aria-label="Cerrar"
        onClick={handleClose}
      />
      <article className="medicion-fotos-dialog__panel">
        <header className="medicion-fotos-dialog__header">
          <div>
            <p className="medicion-fotos-dialog__kicker">Fotos de progreso</p>
            <h2 id="medicion-fotos-edit-title">
              {formatMedicionDate(medicion.fecha)}
            </h2>
          </div>
          <button type="button" onClick={handleClose} disabled={saving}>
            Cerrar
          </button>
        </header>
        <form onSubmit={(event) => void handleSubmit(event)}>
          <MedicionFotosProgresoFields
            disabled={saving}
            value={fotos}
            onChange={setFotos}
            onUploadingChange={setUploading}
          />
          <div className="medicion-fotos-dialog__actions">
            <Button type="submit" disabled={saving || uploading}>
              {saving ? "Guardando..." : "Guardar fotos"}
            </Button>
          </div>
        </form>
        <FeedbackModal message={error} />
      </article>
    </div>
  );
}
