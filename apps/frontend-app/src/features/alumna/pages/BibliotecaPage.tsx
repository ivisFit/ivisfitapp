"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/Input";
import { YoutubePlayer } from "@/components/YoutubePlayer";
import { IvisContentLoader } from "@/components/IvisContentLoader";
import { useAuth } from "@/context/AuthContext";
import { WaitingStateActions } from "@/features/alumna/components/WaitingStateActions";
import { useRutinaActiva } from "@/features/alumna/hooks/useRutinaActiva";
import { getFlatRoutineDays } from "@/features/alumna/lib/rutina-day";
import type { RutinaDetail } from "@/features/alumna/types/rutina";

type EjercicioPlan = {
  id: string;
  nombre: string;
  videoUrl: string;
  descripcion: string;
};

function ejerciciosDelPlan(rutina: RutinaDetail): EjercicioPlan[] {
  const seen = new Set<string>();
  const items: EjercicioPlan[] = [];

  for (const { dia } of getFlatRoutineDays(rutina)) {
    dia.ejercicios.forEach((ejercicio, index) => {
      const id = ejercicio.id || `${ejercicio.nombre}-${index}`;
      const key = ejercicio.id || ejercicio.nombre.trim().toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      items.push({
        id,
        nombre: ejercicio.nombre,
        videoUrl: ejercicio.videoUrl?.trim() ?? "",
        descripcion: ejercicio.descripcion?.trim() ?? "",
      });
    });
  }

  return items;
}

export function BibliotecaPage() {
  const { user } = useAuth();
  const { rutina, loading, error, refetch } = useRutinaActiva(user?.id);
  const [busqueda, setBusqueda] = useState("");
  const [abiertoId, setAbiertoId] = useState<string | null>(null);
  const ejercicios = useMemo(
    () => (rutina ? ejerciciosDelPlan(rutina) : []),
    [rutina],
  );
  const consulta = busqueda.trim();
  const filtrados = useMemo(() => {
    const q = consulta.toLowerCase();
    if (!q) return ejercicios;
    return ejercicios.filter(
      (ejercicio) =>
        ejercicio.nombre.toLowerCase().includes(q) ||
        ejercicio.descripcion.toLowerCase().includes(q),
    );
  }, [consulta, ejercicios]);

  return (
    <div className="page biblioteca-page">
      <section className="pliegues-hero">
        <div className="pliegues-hero__copy">
          <span className="pliegues-hero__eyebrow">Videos</span>
          <h1>Biblioteca</h1>
          <p>Repasá la técnica de los ejercicios de tu plan.</p>
        </div>
      </section>

      {loading ? (
        <IvisContentLoader variant="section" label="Cargando tu plan" />
      ) : null}

      {!loading && error ? (
        <div className="biblioteca-page__empty" role="alert">
          <p>{error}</p>
          <button type="button" className="btn btn--ghost" onClick={refetch}>
            Reintentar
          </button>
        </div>
      ) : null}

      {!loading && !error && !rutina ? (
        <div className="waiting-state">
          <p className="waiting-state__title">
            Tu biblioteca aparece con tu rutina
          </p>
          <p className="waiting-state__text">
            Cuando tu coach te asigne el plan, vas a ver acá solo los ejercicios
            que te tocan, con su video de técnica.
          </p>
          <WaitingStateActions
            nombre={user?.name}
            whatsappTema="consulto por los videos de mi rutina"
          />
        </div>
      ) : null}

      {!loading && !error && rutina && ejercicios.length > 0 ? (
        <div className="biblioteca-page__search-wrap">
          <Input
            label="Buscar en tu plan"
            name="busquedaBiblioteca"
            placeholder="Nombre del ejercicio..."
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </div>
      ) : null}

      {!loading && !error && rutina && ejercicios.length === 0 ? (
        <p className="biblioteca-page__empty">
          Tu plan todavía no tiene ejercicios para repasar.
        </p>
      ) : null}

      {!loading && !error && ejercicios.length > 0 && filtrados.length === 0 ? (
        <p className="biblioteca-page__empty">
          Ningún ejercicio de tu plan coincide con “{consulta}”.
        </p>
      ) : null}

      <ul className="biblioteca-page__list">
        {filtrados.map((ejercicio) => {
          const abierto = abiertoId === ejercicio.id;
          return (
            <li className="biblioteca-page__item" key={ejercicio.id}>
              <div className="biblioteca-page__item-copy">
                <h2>{ejercicio.nombre}</h2>
                {ejercicio.descripcion ? <p>{ejercicio.descripcion}</p> : null}
              </div>
              {ejercicio.videoUrl ? (
                <>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    aria-expanded={abierto}
                    onClick={() =>
                      setAbiertoId((current) =>
                        current === ejercicio.id ? null : ejercicio.id,
                      )
                    }
                  >
                    {abierto ? "Ocultar técnica" : "Ver técnica"}
                  </button>
                  {abierto ? (
                    <YoutubePlayer
                      videoUrl={ejercicio.videoUrl}
                      title={ejercicio.nombre}
                    />
                  ) : null}
                </>
              ) : (
                <p className="biblioteca-page__sin-video">Sin video de técnica.</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
