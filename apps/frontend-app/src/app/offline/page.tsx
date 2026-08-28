"use client";

import "./offline.css";

export default function OfflinePage() {
  return (
    <main className="offline-page">
      <div className="offline-card">
        <div className="offline-card__logo">IVIS Fit</div>
        <h1 className="offline-card__title">Estás sin conexión</h1>
        <p className="offline-card__text">
          No pudimos conectar con el servidor. Tu rutina guardada sigue
          disponible y los cambios que hagas se sincronizarán cuando vuelvas
          a tener internet.
        </p>
        <button
          type="button"
          className="offline-card__button"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
