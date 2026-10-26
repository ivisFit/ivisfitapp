"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import type { FotosProgresoSlot } from "@/features/profe/types/medicion";
import {
  PLIEGUES_FOTOS_SLOT_LABELS,
  PLIEGUES_FOTOS_SLOT_ORDER,
} from "@/features/profe/components/pliegues/pliegues-fotos-slots";
import type {
  FotoComparacionColumna,
  FotosAgrupacion,
} from "@/features/profe/lib/pliegues-fotos-historial";
import {
  formatGrasaCorporal,
  formatMedicionDate,
} from "@/features/profe/utils/pliegues-period";

import "./MedicionFotosProgresoDialog.css";

type PlieguesFotosComparisonGridProps = {
  columnas: FotoComparacionColumna[];
  modo?: FotosAgrupacion;
  compact?: boolean;
};

type LightboxState = { slot: FotosProgresoSlot; columnaId: string } | null;

function formatPeso(value?: number) {
  if (value == null) return null;
  return `${value.toLocaleString("es-UY", { maximumFractionDigits: 1 })} kg`;
}

export function FotosAgrupacionToggle({
  value,
  onChange,
}: {
  value: FotosAgrupacion;
  onChange: (value: FotosAgrupacion) => void;
}) {
  return (
    <div
      className="pliegues-period-filter"
      role="group"
      aria-label="Cómo agrupar las fotos"
    >
      {(
        [
          ["mes", "Por mes"],
          ["medicion", "Cada medición"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          className={`pliegues-period-filter__chip${value === id ? " pliegues-period-filter__chip--active" : ""}`}
          aria-pressed={value === id}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function PlieguesFotosComparisonGrid({
  columnas,
  modo = "mes",
  compact = false,
}: PlieguesFotosComparisonGridProps) {
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const [compare, setCompare] = useState(true);
  const lastId = columnas[columnas.length - 1]?.id;
  const recienteLabel = modo === "mes" ? "Último mes" : "Más reciente";

  const lightboxItems = useMemo(() => {
    if (!lightbox) return [];
    return columnas.filter((columna) => columna.fotos[lightbox.slot]?.url);
  }, [lightbox, columnas]);

  const lightboxIndex = lightbox
    ? lightboxItems.findIndex((item) => item.id === lightbox.columnaId)
    : -1;
  const current = lightboxIndex >= 0 ? lightboxItems[lightboxIndex] : null;
  const previous = lightboxIndex > 0 ? lightboxItems[lightboxIndex - 1] : null;
  const currentImage =
    current && lightbox ? current.fotos[lightbox.slot] : undefined;
  const previousImage =
    previous && lightbox ? previous.fotos[lightbox.slot] : undefined;
  const showCompare = Boolean(compare && currentImage && previousImage);

  const step = useCallback(
    (direction: -1 | 1) => {
      if (!lightbox || lightboxIndex < 0) return;
      const next = lightboxItems[lightboxIndex + direction];
      if (next) setLightbox({ slot: lightbox.slot, columnaId: next.id });
    },
    [lightbox, lightboxIndex, lightboxItems],
  );

  useEffect(() => {
    if (!lightbox) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightbox, step]);

  if (columnas.length === 0) return null;

  const dialogLabel =
    lightbox && current && currentImage
      ? showCompare && previous && previousImage
        ? `${PLIEGUES_FOTOS_SLOT_LABELS[lightbox.slot]}: ${formatMedicionDate(previousImage.fecha)} y ${formatMedicionDate(currentImage.fecha)}`
        : `${PLIEGUES_FOTOS_SLOT_LABELS[lightbox.slot]} · ${formatMedicionDate(currentImage.fecha)}`
      : "Foto de progreso";

  return (
    <>
      <div className="pliegues-fotos-historial__scroll">
        <table
          className={[
            "pliegues-fotos-historial__table",
            modo === "mes" ? "pliegues-fotos-historial__table--mes" : "",
            compact ? "pliegues-fotos-historial__table--compact" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ "--foto-cols": columnas.length } as CSSProperties}
        >
          <caption className="pliegues-fotos-historial__caption">
            Evolución física por ángulo y por{" "}
            {modo === "mes" ? "mes" : "medición"}
          </caption>
          <thead>
            <tr>
              <th scope="col" className="pliegues-fotos-historial__corner">
                Ángulo
              </th>
              {columnas.map((columna) => {
                const peso = formatPeso(columna.pesoCorporalKg);
                const isLatest = columna.id === lastId && columnas.length > 1;
                return (
                  <th
                    key={columna.id}
                    scope="col"
                    className="pliegues-fotos-historial__col-head"
                  >
                    <div className="pliegues-fotos-historial__frame">
                      {isLatest ? (
                        <span className="pliegues-fotos-historial__latest">
                          {recienteLabel}
                        </span>
                      ) : null}
                      <span className="pliegues-fotos-historial__col-date">
                        {columna.titulo}
                      </span>
                      {columna.detalle ? (
                        <span className="pliegues-fotos-historial__col-detail">
                          {columna.detalle}
                        </span>
                      ) : null}
                      <p className="pliegues-fotos-historial__col-meta">
                        <span>{formatGrasaCorporal(columna.porcentajeGrasaCorporal)}</span>
                        {peso ? <span>{peso}</span> : null}
                      </p>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {PLIEGUES_FOTOS_SLOT_ORDER.map((slot) => (
              <tr key={slot}>
                <th scope="row" className="pliegues-fotos-historial__row-label">
                  {PLIEGUES_FOTOS_SLOT_LABELS[slot]}
                </th>
                {columnas.map((columna) => {
                  const imagen = columna.fotos[slot];
                  const fechaLabel = imagen
                    ? formatMedicionDate(imagen.fecha)
                    : columna.titulo;
                  const label = PLIEGUES_FOTOS_SLOT_LABELS[slot];

                  if (!imagen?.url) {
                    return (
                      <td
                        key={`${columna.id}-${slot}`}
                        className="pliegues-fotos-historial__cell"
                      >
                        <span
                          className="pliegues-fotos-historial__placeholder pliegues-fotos-historial__frame"
                          aria-label={`Sin foto de ${label}, ${columna.titulo}`}
                        >
                          Sin foto
                        </span>
                      </td>
                    );
                  }

                  return (
                    <td
                      key={`${columna.id}-${slot}`}
                      className="pliegues-fotos-historial__cell"
                    >
                      <button
                        type="button"
                        className="pliegues-fotos-historial__thumb-btn pliegues-fotos-historial__frame"
                        aria-label={`Ampliar ${label}, ${fechaLabel}`}
                        onClick={() =>
                          setLightbox({ slot, columnaId: columna.id })
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
          aria-label={dialogLabel}
        >
          <button
            type="button"
            className="medicion-fotos-dialog__backdrop"
            aria-label="Cerrar"
            onClick={() => setLightbox(null)}
          />
          <article
            className={`pliegues-fotos-lightbox__panel${showCompare ? " pliegues-fotos-lightbox__panel--compare" : ""}`}
          >
            <header className="pliegues-fotos-lightbox__header">
              <div>
                <p className="pliegues-fotos-lightbox__kicker">
                  {PLIEGUES_FOTOS_SLOT_LABELS[lightbox.slot]}
                </p>
                <h2>
                  {showCompare && previousImage
                    ? `${formatMedicionDate(previousImage.fecha)} → ${formatMedicionDate(currentImage.fecha)}`
                    : formatMedicionDate(currentImage.fecha)}
                </h2>
                <p className="pliegues-fotos-lightbox__meta">
                  {formatGrasaCorporal(current.porcentajeGrasaCorporal)}
                  {formatPeso(current.pesoCorporalKg)
                    ? ` · ${formatPeso(current.pesoCorporalKg)}`
                    : ""}
                </p>
              </div>
              <div className="pliegues-fotos-lightbox__actions">
                {previousImage ? (
                  <button
                    type="button"
                    className="pliegues-fotos-lightbox__close"
                    aria-pressed={showCompare}
                    onClick={() => setCompare((value) => !value)}
                  >
                    {showCompare ? "Una foto" : "Comparar"}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="pliegues-fotos-lightbox__close"
                  onClick={() => setLightbox(null)}
                >
                  Cerrar
                </button>
              </div>
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
              {showCompare && previous && previousImage ? (
                <div className="pliegues-fotos-lightbox__pair">
                  <figure>
                    <figcaption>Antes · {previous.titulo}</figcaption>
                    <img
                      src={previousImage.url}
                      alt={`${PLIEGUES_FOTOS_SLOT_LABELS[lightbox.slot]}, ${formatMedicionDate(previousImage.fecha)}`}
                    />
                  </figure>
                  <span className="pliegues-fotos-lightbox__vs" aria-hidden>
                    vs
                  </span>
                  <figure>
                    <figcaption>Ahora · {current.titulo}</figcaption>
                    <img
                      src={currentImage.url}
                      alt={`${PLIEGUES_FOTOS_SLOT_LABELS[lightbox.slot]}, ${formatMedicionDate(currentImage.fecha)}`}
                    />
                  </figure>
                </div>
              ) : (
                <img
                  src={currentImage.url}
                  alt={`${PLIEGUES_FOTOS_SLOT_LABELS[lightbox.slot]}, ${formatMedicionDate(currentImage.fecha)}`}
                />
              )}
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
              {modo === "mes" ? " meses con esta foto" : ""}
            </p>
          </article>
        </div>
      ) : null}
    </>
  );
}
