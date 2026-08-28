"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/Input";
import { ListSkeleton } from "@/components/skeletons/AppSkeleton";
import { apiFetch } from "@/lib/api";
import { getYoutubeEmbedUrl } from "@/lib/youtube";

type Ejercicio = {
  _id: string;
  nombre: string;
  videoUrl: string;
  descripcion?: string;
};

export function BibliotecaPage() {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await apiFetch<Ejercicio[]>("/api/ejercicios");
        if (!cancelled) {
          setEjercicios(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "No se pudo cargar la biblioteca",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return ejercicios;
    return ejercicios.filter(
      (e) =>
        e.nombre.toLowerCase().includes(q) ||
        (e.descripcion ?? "").toLowerCase().includes(q),
    );
  }, [busqueda, ejercicios]);

  return (
    <div className="page biblioteca-page">
      <section className="pliegues-hero">
        <div className="pliegues-hero__copy">
          <span className="pliegues-hero__eyebrow">Videos</span>
          <h1>Biblioteca</h1>
          <p>Repasá la técnica de los ejercicios del catálogo.</p>
        </div>
      </section>

      <Input
        label="Buscar ejercicio"
        name="busquedaBiblioteca"
        placeholder="Nombre del ejercicio..."
        value={busqueda}
        onChange={(event) => setBusqueda(event.target.value)}
      />

      {loading ? (
        <div aria-busy="true" aria-label="Cargando biblioteca">
          <ListSkeleton items={4} />
        </div>
      ) : null}
      {error ? <p className="auth-error">{error}</p> : null}
      {!loading && filtrados.length === 0 ? (
        <p className="alumnas-panel__status">No hay ejercicios para mostrar.</p>
      ) : null}

      <ul className="ejercicios-list">
        {filtrados.map((ejercicio) => {
          const embed = getYoutubeEmbedUrl(ejercicio.videoUrl);
          return (
            <li className="ejercicio-item" key={ejercicio._id}>
              <div className="ejercicio-item__body">
                <div className="ejercicio-item__content">
                  <h3>{ejercicio.nombre}</h3>
                  {ejercicio.descripcion ? <p>{ejercicio.descripcion}</p> : null}
                </div>
                {embed ? (
                  <div className="ejercicio-video">
                    <iframe
                      title={`Video de ${ejercicio.nombre}`}
                      src={embed}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
