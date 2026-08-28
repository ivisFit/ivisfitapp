"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import loaderPixelCorriendo from "../../../../pixelsLoaders/corriendo.png";
import loaderPixelMancuarnas from "../../../../pixelsLoaders/mancuarnas.png";
import loaderPixelSaltando from "../../../../pixelsLoaders/saltando.png";
import loaderPixelSentadilla from "../../../../pixelsLoaders/sentadilla.png";
import loaderPixelVuelos from "../../../../pixelsLoaders/vuelos.png";

const FRAME_CLASSES = [
  "animation-preview__frame--1",
  "animation-preview__frame--2",
  "animation-preview__frame--3",
  "animation-preview__frame--4",
  "animation-preview__frame--5",
  "animation-preview__frame--6",
];
const FRAME_COUNT = FRAME_CLASSES.length;
const PREVIEW_CYCLE_DURATION_MS = 1400;
const PREVIEW_FRAME_DURATION_MS = PREVIEW_CYCLE_DURATION_MS / FRAME_COUNT;

const animations = [
  { name: "Sentadilla", fileName: "sentadilla.png", image: loaderPixelSentadilla },
  { name: "Mancuernas", fileName: "mancuarnas.png", image: loaderPixelMancuarnas },
  { name: "Vuelos", fileName: "vuelos.png", image: loaderPixelVuelos },
  { name: "Corriendo", fileName: "corriendo.png", image: loaderPixelCorriendo },
  { name: "Saltando", fileName: "saltando.png", image: loaderPixelSaltando },
];

export function AnimacionesPage() {
  const [activeFrame, setActiveFrame] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveFrame((currentFrame) => (currentFrame + 1) % FRAME_COUNT);
    }, PREVIEW_FRAME_DURATION_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="page animaciones-page">
      <div className="page__actions">
        <div>
          <h1>Animaciones</h1>
          <p>Previsualizá todos los loaders pixelados disponibles.</p>
        </div>
      </div>

      <div className="animations-grid">
        {animations.map((animation) => {
          const style = {
            "--animation-preview-sprite": `url(${animation.image.src})`,
            "--animation-preview-background-size": `${FRAME_COUNT * 100}% 100%`,
            "--animation-preview-frame-ratio": `${animation.image.width / FRAME_COUNT} / ${animation.image.height}`,
          } as CSSProperties;

          return (
            <article className="feature-card animation-card" key={animation.fileName}>
              <div>
                <h2>{animation.name}</h2>
                <p>{animation.fileName}</p>
              </div>

              <div className="animation-preview" style={style} aria-hidden>
                <span
                  className={`animation-preview__frame ${FRAME_CLASSES[activeFrame]}`}
                />
              </div>

              <dl className="animation-card__meta">
                <div>
                  <dt>Frames</dt>
                  <dd>{FRAME_COUNT}</dd>
                </div>
                <div>
                  <dt>Imagen</dt>
                  <dd>
                    {animation.image.width} x {animation.image.height}px
                  </dd>
                </div>
                <div>
                  <dt>Formato</dt>
                  <dd>Horizontal</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
    </div>
  );
}
