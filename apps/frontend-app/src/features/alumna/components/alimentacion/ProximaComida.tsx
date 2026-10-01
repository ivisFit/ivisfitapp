"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, ChefHat, Clock3, Flame, Play, StickyNote } from "lucide-react";
import type {
  ComidaPlan,
  DiaPlanNutricional,
} from "@/features/alumna/types/plan-nutricional";
import { alumnaRoutes } from "@/routes/paths";

const UNLOCK_MINUTES_BEFORE = 15;

function parseHora(horario?: string): number | null {
  const m = horario?.match(/(\d{1,2})\s*[:.h]\s*(\d{2})?/i);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  return h < 24 && min < 60 ? h * 60 + min : null;
}

function minutosDelDia(now: Date) {
  return now.getHours() * 60 + now.getMinutes();
}

function isComidaDesbloqueada(comida: ComidaPlan, now: Date) {
  const target = parseHora(comida.horario);
  if (target === null) return true;
  return minutosDelDia(now) >= target - UNLOCK_MINUTES_BEFORE;
}

function minutosHastaDesbloqueo(comida: ComidaPlan, now: Date) {
  const target = parseHora(comida.horario);
  if (target === null) return 0;
  return Math.max(0, target - UNLOCK_MINUTES_BEFORE - minutosDelDia(now));
}

function horaDesbloqueo(horario?: string) {
  const target = parseHora(horario);
  if (target === null) return null;
  const unlock = target - UNLOCK_MINUTES_BEFORE;
  const h = Math.floor(unlock / 60);
  const m = unlock % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function etiquetaEspera(comida: ComidaPlan, now: Date) {
  const wait = minutosHastaDesbloqueo(comida, now);
  if (wait <= 0) return null;
  if (wait < 60) return `Disponible en ${wait} min`;
  const h = Math.floor(wait / 60);
  const m = wait % 60;
  return `Disponible en ${h} h${m ? ` ${m} min` : ""}`;
}

function relativo(target: number | null, now: Date): string | null {
  if (target === null) return null;
  const diff = target - (now.getHours() * 60 + now.getMinutes());
  if (diff <= -30) return "Ya pasó tu horario";
  if (diff <= 0) return "¡Es ahora!";
  if (diff < 60) return `En ${diff} min`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `En ${h} h${m ? ` ${m} min` : ""}`;
}

function ComidaDetalle({ comida }: { comida: ComidaPlan }) {
  return (
    <div className="proxima-comida__detail">
      <ul>
        {comida.ingredientes.map((ing, i) => (
          <li key={`${ing.nombre}-${i}`}>
            <span>{ing.nombre}</span>
            <strong>
              {ing.cantidad}
              {ing.unidad}
            </strong>
          </li>
        ))}
      </ul>
      {comida.preparacion ? (
        <p>
          <ChefHat size={15} aria-hidden />
          <span>{comida.preparacion}</span>
        </p>
      ) : null}
      {comida.notas ? (
        <p>
          <StickyNote size={15} aria-hidden />
          <span>{comida.notas}</span>
        </p>
      ) : null}
    </div>
  );
}

export function ProximaComida({
  dia,
  storageKey,
}: {
  dia: DiaPlanNutricional;
  storageKey: string;
}) {
  const [done, setDone] = useState<number[]>([]);
  const [started, setStarted] = useState(false);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    try {
      setDone(JSON.parse(localStorage.getItem(storageKey) ?? "[]"));
    } catch {
      setDone([]);
    }
    setStarted(false);
    setViewingIndex(null);
  }, [storageKey]);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const total = dia.comidas.length;
  const pendienteIndex = dia.comidas.findIndex((_, i) => !done.includes(i));
  const pendiente = pendienteIndex >= 0 ? dia.comidas[pendienteIndex] : null;
  const desbloqueada =
    pendiente !== null && isComidaDesbloqueada(pendiente, now);
  const modoRevision =
    viewingIndex !== null && done.includes(viewingIndex);
  const comida = modoRevision
    ? dia.comidas[viewingIndex!]
    : pendienteIndex >= 0
      ? dia.comidas[pendienteIndex]
      : null;
  const modoBloqueado = !modoRevision && pendiente !== null && !desbloqueada;

  const finish = () => {
    if (pendienteIndex < 0 || modoRevision || modoBloqueado) return;
    const next = [...done, pendienteIndex];
    setDone(next);
    setStarted(false);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
  };

  if (total === 0) return null;

  const quickLinks = (
    <nav className="proxima-comida__links" aria-label="Accesos rápidos">
      <Link href={alumnaRoutes.alimentacionCompras} className="proxima-comida__link">
        Ver lista de compras
      </Link>
      <Link href={alumnaRoutes.alimentacionObjetivo} className="proxima-comida__link">
        Ver Objetivo
      </Link>
    </nav>
  );

  if (!comida) {
    return (
      <section className="proxima-comida proxima-comida--done" aria-live="polite">
        <div className="proxima-comida__body">
          <CheckCircle2 size={40} aria-hidden />
          <h2>¡Completaste tu día!</h2>
          <p>Cumpliste las {total} comidas de hoy. Mañana seguimos.</p>
          {done.length > 0 ? (
            <ul className="proxima-comida__hechas" aria-label="Comidas completadas hoy">
              {done.map((i) => (
                <li key={i}>
                  <button
                    type="button"
                    className="proxima-comida__hecha"
                    onClick={() => setViewingIndex(i)}
                  >
                    <CheckCircle2 size={16} aria-hidden />
                    {dia.comidas[i]?.nombre}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="proxima-comida__actions">{quickLinks}</div>
      </section>
    );
  }

  const rel = relativo(parseHora(comida.horario), now);
  const nombre = comida.nombre;
  const espera = modoBloqueado ? etiquetaEspera(comida, now) : null;
  const unlockLabel = modoBloqueado ? horaDesbloqueo(comida.horario) : null;

  return (
    <section
      className={`proxima-comida${modoBloqueado ? " proxima-comida--locked" : ""}`}
      aria-labelledby="proxima-comida-title"
    >
      <div className="proxima-comida__body">
        <div className="proxima-comida__steps" aria-label={`${done.length} de ${total} comidas`}>
          {dia.comidas.map((c, i) => {
            let stepClass = "";
            if (done.includes(i)) stepClass = "is-done";
            else if (i === pendienteIndex && desbloqueada) stepClass = "is-current";
            else if (i === pendienteIndex) stepClass = "is-locked";
            return (
              <button
                key={`${c.nombre}-${i}`}
                type="button"
                className={stepClass || undefined}
                disabled={!done.includes(i)}
                aria-label={
                  done.includes(i)
                    ? `Ver ${c.nombre}, completada`
                    : i === pendienteIndex && !desbloqueada
                      ? `${c.nombre}, bloqueada`
                      : c.nombre
                }
                onClick={() => {
                  if (done.includes(i)) {
                    setViewingIndex(i);
                    setStarted(false);
                  }
                }}
              />
            );
          })}
        </div>

        {done.length > 0 ? (
          <ul className="proxima-comida__hechas" aria-label="Comidas completadas hoy">
            {done.map((i) => (
              <li key={i}>
                <button
                  type="button"
                  className={`proxima-comida__hecha${viewingIndex === i ? " is-active" : ""}`}
                  onClick={() => {
                    setViewingIndex(i);
                    setStarted(false);
                  }}
                >
                  <CheckCircle2 size={16} aria-hidden />
                  {dia.comidas[i]?.nombre}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <span className="proxima-comida__eyebrow">
          {modoRevision
            ? "Comida completada"
            : modoBloqueado
              ? "Próxima comida (bloqueada)"
              : done.length === 0
                ? "Tu primera comida de hoy"
                : "Tu próxima comida"}
        </span>
        <h2 id="proxima-comida-title">{nombre}</h2>

        <div className="proxima-comida__meta">
          {comida.horario ? (
            <span>
              <Clock3 size={15} aria-hidden />
              {comida.horario}
            </span>
          ) : null}
          {modoBloqueado && unlockLabel ? (
            <span className="proxima-comida__rel">Se desbloquea a las {unlockLabel}</span>
          ) : null}
          {!modoBloqueado && rel ? <span className="proxima-comida__rel">{rel}</span> : null}
          {modoBloqueado && espera ? (
            <span className="proxima-comida__rel">{espera}</span>
          ) : null}
          {comida.macrosComida ? (
            <span>
              <Flame size={15} aria-hidden />
              {comida.macrosComida.kcal} kcal
            </span>
          ) : null}
        </div>

        {modoBloqueado ? (
          <p className="proxima-comida__lock-msg">
            Podés comenzar {UNLOCK_MINUTES_BEFORE} minutos antes del horario de esta comida.
          </p>
        ) : null}

        {modoRevision || (started && desbloqueada) ? <ComidaDetalle comida={comida} /> : null}
      </div>

      <div className="proxima-comida__actions">
        {quickLinks}
        {modoRevision ? (
          <button
            type="button"
            className="proxima-comida__cta"
            onClick={() => setViewingIndex(null)}
          >
            Volver a hoy
          </button>
        ) : modoBloqueado ? (
          <button type="button" className="proxima-comida__cta" disabled>
            {espera ?? "Todavía no disponible"}
          </button>
        ) : (
          <button
            type="button"
            className="proxima-comida__cta"
            onClick={started ? finish : () => setStarted(true)}
          >
            {started ? (
              <>
                <CheckCircle2 size={20} aria-hidden />
                Terminé {nombre}
              </>
            ) : (
              <>
                <Play size={20} aria-hidden />
                Comenzar {nombre}
              </>
            )}
          </button>
        )}
      </div>
    </section>
  );
}
