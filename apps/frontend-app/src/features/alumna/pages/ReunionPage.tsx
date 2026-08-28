"use client";

import Link from "next/link";
import { CalendarClock, Video } from "lucide-react";
import { useProximaReunion } from "@/features/alumna/hooks/useProximaReunion";
import { formatReunionDate } from "@/features/profe/types/reunion";
import { CardSkeleton } from "@/components/skeletons/AppSkeleton";
import { alumnaRoutes } from "@/routes/paths";

export function ReunionPage() {
  const { reunion, esHoy, loading, error } = useProximaReunion();

  if (loading) {
    return (
      <div className="page reunion-page" aria-busy="true">
        <header className="reunion-page__header">
          <p className="reunion-page__eyebrow">Próxima reunión</p>
          <h1>Reunión</h1>
        </header>
        <CardSkeleton elevated lines={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page reunion-page">
        <header className="reunion-page__header">
          <p className="reunion-page__eyebrow">Próxima reunión</p>
          <h1>Reunión</h1>
        </header>
        <div className="reunion-page__card reunion-page__card--error" role="alert">
          <p>{error}</p>
          <Link className="btn btn--ghost" href={alumnaRoutes.rutina}>
            Volver a mi rutina
          </Link>
        </div>
      </div>
    );
  }

  if (!reunion) {
    return (
      <div className="page reunion-page">
        <header className="reunion-page__header">
          <p className="reunion-page__eyebrow">Próxima reunión</p>
          <h1>Reunión</h1>
        </header>
        <div className="reunion-page__card reunion-page__card--empty">
          <span className="reunion-page__empty-icon" aria-hidden>
            <CalendarClock size={28} />
          </span>
          <h2>Todavía no tenés reuniones agendadas</h2>
          <p>Cuando tu profe agende la próxima reunión, va a aparecer acá.</p>
          <Link className="btn btn--ghost" href={alumnaRoutes.rutina}>
            Volver a mi rutina
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page reunion-page">
      <header className={`reunion-page__header ${esHoy ? "reunion-page__header--today" : ""}`}>
        <p className="reunion-page__eyebrow">
          {esHoy ? "Tu reunión es hoy" : "Próxima reunión"}
          {esHoy ? <span className="reunion-page__today-chip">Hoy</span> : null}
        </p>
        <h1>{reunion.titulo}</h1>
        <p className="reunion-page__datetime">
          <CalendarClock size={16} aria-hidden />{" "}
          {formatReunionDate(reunion.fecha)} · {reunion.hora}
        </p>
      </header>

      {reunion.descripcion ? (
        <section className="reunion-page__card">
          <h2>Información</h2>
          <p>{reunion.descripcion}</p>
        </section>
      ) : null}

      <section className="reunion-page__card reunion-page__card--cta">
        <a
          className="btn btn--primary reunion-page__meet-btn"
          href={reunion.meetLink}
          target="_blank"
          rel="noreferrer"
        >
          <Video size={18} aria-hidden />
          Entrar a la reunión
        </a>
        <Link className="btn btn--ghost" href={alumnaRoutes.rutina}>
          Volver
        </Link>
      </section>
    </div>
  );
}
