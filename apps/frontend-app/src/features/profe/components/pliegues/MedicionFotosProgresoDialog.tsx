"use client";

import type { FotosProgreso } from "@/features/profe/types/medicion";
import {
  countFotosProgreso,
  PLIEGUES_FOTOS_SLOT_LABELS,
  PLIEGUES_FOTOS_SLOT_ORDER,
} from "@/features/profe/components/pliegues/pliegues-fotos-slots";

import "./MedicionFotosProgresoDialog.css";

export { countFotosProgreso };

type MedicionFotosProgresoDialogProps = {
  fotos: FotosProgreso;
  fechaLabel: string;
  onClose: () => void;
};

export function MedicionFotosProgresoDialog({
  fotos,
  fechaLabel,
  onClose,
}: MedicionFotosProgresoDialogProps) {
  return (
    <div
      className="medicion-fotos-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="medicion-fotos-dialog-title"
    >
      <button
        type="button"
        className="medicion-fotos-dialog__backdrop"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <article className="medicion-fotos-dialog__panel">
        <header className="medicion-fotos-dialog__header">
          <div>
            <p className="medicion-fotos-dialog__kicker">Fotos de progreso</p>
            <h2 id="medicion-fotos-dialog-title">{fechaLabel}</h2>
          </div>
          <button type="button" onClick={onClose}>Cerrar</button>
        </header>
        <div className="medicion-fotos-dialog__grid">
          {PLIEGUES_FOTOS_SLOT_ORDER.map((key) => {
            const imagen = fotos[key];
            if (!imagen?.url) return null;
            return (
              <figure key={key} className="medicion-fotos-dialog__figure">
                <figcaption>{PLIEGUES_FOTOS_SLOT_LABELS[key]}</figcaption>
                <img src={imagen.url} alt={PLIEGUES_FOTOS_SLOT_LABELS[key]} loading="lazy" />
              </figure>
            );
          })}
        </div>
      </article>
    </div>
  );
}
