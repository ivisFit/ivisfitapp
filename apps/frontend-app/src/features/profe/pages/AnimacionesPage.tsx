"use client";

import { IvisSprite, IVIS_LOADER_SPRITES } from "@/components/IvisContentLoader";

const FRAME_COUNT = 6;

export function AnimacionesPage() {
  return (
    <div className="page animaciones-page">
      <div className="page__actions">
        <div>
          <h1>Animaciones</h1>
          <p>Previsualizá todos los loaders pixelados disponibles.</p>
        </div>
      </div>

      <div className="animations-grid">
        {IVIS_LOADER_SPRITES.map((animation) => (
          <article className="feature-card animation-card" key={animation.fileName}>
            <div>
              <h2>{animation.name}</h2>
              <p>{animation.fileName}</p>
            </div>

            <IvisSprite image={animation.image} size="preview" />

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
        ))}
      </div>
    </div>
  );
}
