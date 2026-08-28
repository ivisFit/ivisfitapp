"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components";
import { getYoutubeEmbedUrl } from "@/features/alumna/lib/rutina-day";
import { useTutorialesActivos } from "@/features/alumna/hooks/useTutorialesActivos";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { alumnaRoutes, getHomeRouteForRole } from "@/routes/paths";

export function TutorialesPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const { tutoriales, loading, error } = useTutorialesActivos();
  const [activeIndex, setActiveIndex] = useState(0);
  const [marking, setMarking] = useState(false);

  const isOnboarding = user?.tutorialesVistos !== true;
  const current = tutoriales[activeIndex];
  const isLast = activeIndex >= tutoriales.length - 1;

  async function handleMarkAsSeen() {
    if (marking) return;
    setMarking(true);
    try {
      await apiFetch("/api/me/tutoriales-vistos", { method: "POST" });
      await refreshProfile();
      router.replace(getHomeRouteForRole("alumna"));
      router.refresh();
    } catch {
      // Si falla, igual dejamos avanzar a la alumna.
      router.replace(getHomeRouteForRole("alumna"));
      router.refresh();
    } finally {
      setMarking(false);
    }
  }

  function goBack() {
    router.replace(alumnaRoutes.rutina);
  }

  if (loading) {
    return (
      <div className="tutoriales-shell__inner tutoriales-shell__status" aria-busy="true">
        <div className="tutoriales-skeleton tutoriales-skeleton--video" />
        <div className="tutoriales-skeleton tutoriales-skeleton--line" />
        <div className="tutoriales-skeleton tutoriales-skeleton--line tutoriales-skeleton--short" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tutoriales-shell__inner tutoriales-shell__status">
        <h1>Tutoriales</h1>
        <p className="auth-error">{error}</p>
        {!isOnboarding ? (
          <Button type="button" variant="ghost" onClick={goBack}>
            Volver
          </Button>
        ) : null}
      </div>
    );
  }

  if (tutoriales.length === 0) {
    return (
      <div className="tutoriales-shell__inner tutoriales-shell__status">
        <h1>Todavía no hay tutoriales</h1>
        <p>
          La profesora todavía no publicó videos de bienvenida. Mientras tanto,
          podés explorar la app.
        </p>
        {!isOnboarding ? (
          <Button type="button" variant="ghost" onClick={goBack}>
            Volver
          </Button>
        ) : (
          <Button type="button" onClick={() => void handleMarkAsSeen()}>
            {marking ? "Cargando..." : "Empezar"}
          </Button>
        )}
      </div>
    );
  }

  const embedUrl = getYoutubeEmbedUrl(current.videoUrl);

  return (
    <div className="tutoriales-shell__inner">
      <header className="tutoriales-header">
        <div>
          <p className="tutoriales-header__eyebrow">IVIS Fit</p>
          <h1>Tutoriales</h1>
        </div>
        <div className="tutoriales-header__actions">
          {isOnboarding ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => void handleMarkAsSeen()}
              disabled={marking}
            >
              {marking ? "Cargando..." : "Saltar"}
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={goBack}>
              Volver
            </Button>
          )}
        </div>
      </header>

      <div className="tutoriales-progress" aria-hidden>
        <span className="tutoriales-progress__track">
          <span
            className="tutoriales-progress__fill"
            style={{ width: `${((activeIndex + 1) / tutoriales.length) * 100}%` }}
          />
        </span>
        <span className="tutoriales-progress__label">
          {activeIndex + 1} de {tutoriales.length}
        </span>
      </div>

      <main className="tutoriales-player">
        <div className="tutoriales-player__media">
          {embedUrl ? (
            <iframe
              key={current.id}
              title={current.titulo}
              src={embedUrl}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="tutoriales-player__invalid">
              <p>No se pudo incrustar este video.</p>
            </div>
          )}
        </div>

        <div className="tutoriales-player__copy">
          <h2>{current.titulo}</h2>
          {current.descripcion ? <p>{current.descripcion}</p> : null}
        </div>

        <nav className="tutoriales-player__nav" aria-label="Navegación de tutoriales">
          <Button
            type="button"
            variant="ghost"
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
          >
            Anterior
          </Button>

          {isLast ? (
            <Button type="button" onClick={() => void handleMarkAsSeen()} disabled={marking}>
              {marking ? "Cargando..." : isOnboarding ? "Continuar" : "Terminar"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() =>
                setActiveIndex((index) => Math.min(tutoriales.length - 1, index + 1))
              }
            >
              Siguiente
            </Button>
          )}
        </nav>
      </main>
    </div>
  );
}
