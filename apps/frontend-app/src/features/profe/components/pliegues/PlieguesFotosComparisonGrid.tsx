"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  FotosProgresoSlot,
  Medicion,
} from "@/features/profe/types/medicion";
import {
  PLIEGUES_FOTOS_SLOT_LABELS,
  PLIEGUES_FOTOS_SLOT_ORDER,
} from "@/features/profe/components/pliegues/pliegues-fotos-slots";
import {
  formatGrasaCorporal,
  formatMedicionDate,
} from "@/features/profe/utils/pliegues-period";

import "./MedicionFotosProgresoDialog.css";

type PlieguesFotosComparisonGridProps = {
  mediciones: Medicion[];
};

type LightboxState = { slot: FotosProgresoSlot; medicionId: string } | null;

function formatPeso(value?: number) {
  if (value == null) return null;
  return `${value.toLocaleString("es-UY", { maximumFractionDigits: 1 })} kg`;
}

export function PlieguesFotosComparisonGrid({
  mediciones,
}: PlieguesFotosComparisonGridProps) {
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const lastId = mediciones[mediciones.length - 1]?.id;

  const lightboxItems = useMemo(() => {
    if (!lightbox) return [];
    return mediciones.filter(
      (medicion) => medicion.fotosProgreso?.[lightbox.slot]?.url,
    );
  }, [lightbox, mediciones]);

  const lightboxIndex = lightbox
    ? lightboxItems.findIndex((item) => item.id === lightbox.medicionId)
    : -1;
  const current = lightboxIndex >= 0 ? lightboxItems[lightboxIndex] : null;
  const currentImage =
    current && lightbox ? current.fotosProgreso?.[lightbox.slot] : undefined;

  const step = useCallback(
    (direction: -1 | 1) => {
      if (!lightbox || lightboxIndex < 0) return;
      const next = lightboxItems[lightboxIndex + direction];
      if (next) setLightbox({ slot: lightbox.slot, medicionId: next.id });
    },
    [lightbox, lightboxIndex, lightboxItems],
  );

  useEffect(() => {
    if (!lightbox) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightbox, step]);

  return (
    <>
      <div className="pliegues-fotos-historial__scroll">
        <table className="pliegues-fotos-historial__table">
          <thead>
            <tr>
              <th scope="col" className="pliegues-fotos-historial__corner">
                Ángulo
              </th>
              {mediciones.map((medicion) => {
                const peso = formatPeso(medicion.pesoCorporalKg);
                const isLatest = medicion.id === lastId && mediciones.length > 1;
                return (
                  <th
                    key={medicion.id}
                    scope="col"
                    className="pliegues-fotos-historial__col-head"
                  >
                    <span className="pliegues-fotos-historial__col-date">
                      {formatMedicionDate(medicion.fecha)}
                    </span>
                    <span className="pliegues-fotos-historial__col-chips">
                      <span className="pliegues-fotos-historial__chip pliegues-fotos-historial__chip--gold">
                        {formatGrasaCorporal(
                          medicion.metricas.porcentajeGrasaCorporal,
                        )}
                      </span>
                      {peso ? (
                        <span className="pliegues-fotos-historial__chip">
                          {peso}
                        </span>
                      ) : null}
                    </span>
                    {isLatest ? (
                      <span className="pliegues-fotos-historial__latest">
                        Más reciente
                      </span>
                    ) : null}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {PLIEGUES_FOTOS_SLOT_ORDER.map((slot) => (
              <tr key={slot}>
                <th
                  scope="row"
                  className="pliegues-fotos-historial__row-label"
                >
                  {PLIEGUES_FOTOS_SLOT_LABELS[slot]}
                </th>
                {mediciones.map((medicion) => {
                  const imagen = medicion.fotosProgreso?.[slot];
                  const fechaLabel = formatMedicionDate(medicion.fecha);
                  const label = PLIEGUES_FOTOS_SLOT_LABELS[slot];

                  if (!imagen?.url) {
                    return (
                      <td
                        key={`${medicion.id}-${slot}`}
                        className="pliegues-fotos-historial__cell"
                      >
                        <span
                          className="pliegues-fotos-historial__placeholder"
                          aria-label={`Sin foto de ${label}`}
                        >
                          Sin foto
                        </span>
                      </td>
                    );
                  }

                  return (
                    <td
                      key={`${medicion.id}-${slot}`}
                      className="pliegues-fotos-historial__cell"
                    >
                      <button
                        type="button"
                        className="pliegues-fotos-historial__thumb-btn"
                        aria-label={`Ampliar ${label}, ${fechaLabel}`}
                        onClick={() =>
                          setLightbox({ slot, medicionId: medicion.id })
                        }
                      >
                        <img
                          src={imagen.url}
                          alt={`${label}, ${fechaLabel}`}
                          loading="lazy"
                        />
                        <span
                          className="pliegues-fotos-historial__zoom"
                          aria-hidden
                        >
                          Ampliar
                        </span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lightbox && current && currentImage ? (
        <div
          className="medicion-fotos-dialog pliegues-fotos-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${PLIEGUES_FOTOS_SLOT_LABELS[lightbox.slot]} · ${formatMedicionDate(current.fecha)}`}
        >
          <button
            type="button"
            className="medicion-fotos-dialog__backdrop"
            aria-label="Cerrar"
            onClick={() => setLightbox(null)}
          />
          <article className="pliegues-fotos-lightbox__panel">
            <header className="pliegues-fotos-lightbox__header">
              <div>
                <p className="pliegues-fotos-lightbox__kicker">
                  {PLIEGUES_FOTOS_SLOT_LABELS[lightbox.slot]}
                </p>
                <h2>{formatMedicionDate(current.fecha)}</h2>
                <p className="pliegues-fotos-lightbox__meta">
                  {formatGrasaCorporal(current.metricas.porcentajeGrasaCorporal)}
                  {formatPeso(current.pesoCorporalKg)
                    ? ` · ${formatPeso(current.pesoCorporalKg)}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                className="pliegues-fotos-lightbox__close"
                onClick={() => setLightbox(null)}
              >
                Cerrar
              </button>
            </header>

            <div className="pliegues-fotos-lightbox__stage">
              <button
                type="button"
                className="pliegues-fotos-lightbox__nav"
                aria-label="Foto anterior"
                disabled={lightboxIndex <= 0}
                onClick={() => step(-1)}
              >
                ‹
              </button>
              <img
                src={currentImage.url}
                alt={`${PLIEGUES_FOTOS_SLOT_LABELS[lightbox.slot]}, ${formatMedicionDate(current.fecha)}`}
              />
              <button
                type="button"
                className="pliegues-fotos-lightbox__nav"
                aria-label="Foto siguiente"
                disabled={lightboxIndex >= lightboxItems.length - 1}
                onClick={() => step(1)}
              >
                ›
              </button>
            </div>

            <p className="pliegues-fotos-lightbox__counter">
              {lightboxIndex + 1} de {lightboxItems.length}
            </p>
          </article>
        </div>
      ) : null}
    </>
  );
}
