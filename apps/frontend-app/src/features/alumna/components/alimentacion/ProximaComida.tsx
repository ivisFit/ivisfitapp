"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Clock, Lock } from "lucide-react";
import { CheckinAlimentacionCard } from "@/features/alumna/components/alimentacion/CheckinAlimentacionCard";
import {
  ComidaLeaders,
  ComidaNotas,
} from "@/features/alumna/components/alimentacion/ComidaLeaders";
import type {
  ComidaPlan,
  DiaPlanNutricional,
  MacrosObjetivo,
} from "@/features/alumna/types/plan-nutricional";

const UNLOCK_MINUTES_BEFORE = 15;

function parseHora(horario?: string): number | null {
  const match = horario?.match(/(\d{1,2})\s*[:.h]\s*(\d{2})?/i);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
}

function minutosDelDia(now: Date) {
  return now.getHours() * 60 + now.getMinutes();
}

function isComidaDesbloqueada(comida: ComidaPlan, now: Date) {
  const target = parseHora(comida.horario);
  if (target === null) return true;
  return minutosDelDia(now) >= target - UNLOCK_MINUTES_BEFORE;
}

function horaDesbloqueo(horario?: string) {
  const target = parseHora(horario);
  if (target === null) return null;
  const unlock = Math.max(0, target - UNLOCK_MINUTES_BEFORE);
  const hours = Math.floor(unlock / 60);
  const minutes = unlock % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function relativo(target: number | null, now: Date): string | null {
  if (target === null) return null;
  const diff = target - minutosDelDia(now);
  if (diff <= -30) return "Ya pasó el horario";
  if (diff <= 0) return "Es ahora";
  if (diff < 60) return `En ${diff} min`;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return `En ${hours} h${minutes ? ` ${minutes} min` : ""}`;
}

function kcalDelDia(dia: DiaPlanNutricional) {
  const total = dia.comidas.reduce(
    (sum, comida) => sum + (comida.macrosComida?.kcal ?? 0),
    0,
  );
  return total > 0 ? total : null;
}

function normalizeDone(value: unknown, total: number) {
  if (!Array.isArray(value)) return [];
  const indexes = new Set<number>();
  for (const item of value) {
    if (typeof item === "number" && item >= 0 && item < total) indexes.add(item);
  }
  return [...indexes].sort((a, b) => a - b);
}

function estadoLabel(done: boolean, current: boolean) {
  if (done) return "Hecha";
  if (current) return "Ahora";
  return "Más tarde";
}

function MenuRing({ done, total }: { done: number; total: number }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? done / total : 0;

  return (
    <div className="comida-ring" aria-hidden>
      <svg viewBox="0 0 56 56">
        <circle className="comida-ring__track" cx="28" cy="28" r={radius} />
        <circle
          className={`comida-ring__value${done > 0 ? " is-started" : ""}`}
          cx="28"
          cy="28"
          r={radius}
          strokeDasharray={`${(circumference * progress).toFixed(2)} ${circumference.toFixed(2)}`}
          transform="rotate(-90 28 28)"
        />
      </svg>
      <strong>
        {done}<span>/{total}</span>
      </strong>
    </div>
  );
}

function PlatoMacros({ macros }: { macros: MacrosObjetivo }) {
  const items = [
    { key: "p", label: "Proteína", value: macros.proteinaG, kcal: macros.proteinaG * 4 },
    { key: "c", label: "Carbos", value: macros.carbohidratosG, kcal: macros.carbohidratosG * 4 },
    { key: "g", label: "Grasas", value: macros.grasasG, kcal: macros.grasasG * 9 },
  ];
  const totalKcal = items.reduce((sum, item) => sum + item.kcal, 0) || 1;

  return (
    <ul className="comida-plato__macros" aria-label="Macros de esta comida">
      {items.map((item) => (
        <li key={item.key} className={`is-${item.key}`}>
          <span>{item.label}</span>
          <strong>
            {Math.round(item.value * 10) / 10}
            <small> g</small>
          </strong>
          <i aria-hidden>
            <b style={{ width: `${Math.round((item.kcal / totalKcal) * 100)}%` }} />
          </i>
        </li>
      ))}
    </ul>
  );
}

export function ProximaComida({
  dia,
  storageKey,
  preview = false,
}: {
  dia: DiaPlanNutricional;
  storageKey: string;
  preview?: boolean;
}) {
  const [done, setDone] = useState<number[]>([]);
  const [selection, setSelection] = useState<number | null>(null);
  const [now, setNow] = useState(() => new Date());
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pickedByUser = useRef(false);
  const total = dia.comidas.length;

  useEffect(() => {
    pickedByUser.current = false;
    setSelection(null);
    if (preview) {
      setDone([]);
      return;
    }
    try {
      setDone(normalizeDone(JSON.parse(localStorage.getItem(storageKey) ?? "[]"), total));
    } catch {
      setDone([]);
    }
  }, [preview, storageKey, total]);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);

  const pendienteIndex = dia.comidas.findIndex((_, index) => !done.includes(index));
  const allDone = total > 0 && pendienteIndex < 0;
  const selectedIndex = selection ?? (allDone ? null : pendienteIndex);
  const comida = selectedIndex !== null ? dia.comidas[selectedIndex] : null;
  const isDone = selectedIndex !== null && done.includes(selectedIndex);
  const isCurrent = selectedIndex === pendienteIndex && !allDone;
  const isLater = Boolean(comida) && !isDone && !isCurrent && !preview;
  const locked =
    !preview &&
    isCurrent &&
    comida !== null &&
    !isComidaDesbloqueada(comida, now);
  const unlockLabel = locked ? horaDesbloqueo(comida?.horario) : null;
  const rel =
    comida && !locked && !isLater
      ? relativo(parseHora(comida.horario), now)
      : null;
  const diaKcal = kcalDelDia(dia);

  useEffect(() => {
    if (!pickedByUser.current || selectedIndex === null) return;
    itemRefs.current[selectedIndex]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selectedIndex]);

  const finish = () => {
    if (!isCurrent || locked || pendienteIndex < 0) return;
    const next = normalizeDone([...done, pendienteIndex], total);
    setDone(next);
    setSelection(null);
    pickedByUser.current = false;
    if (preview) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* el avance de hoy queda en esta sesión */
    }
  };

  const pick = (index: number) => {
    pickedByUser.current = true;
    setSelection(index);
  };

  if (total === 0) return null;

  const kcalHechas = done.reduce(
    (sum, index) => sum + (dia.comidas[index]?.macrosComida?.kcal ?? 0),
    0,
  );
  const progreso = diaKcal ? Math.min(100, Math.round((kcalHechas / diaKcal) * 100)) : 0;
  const badge = isDone
    ? { label: "Hecha", tone: "done" }
    : locked
      ? { label: "Próxima", tone: "locked" }
      : isCurrent
        ? { label: "Ahora", tone: "now" }
        : isLater
          ? { label: "Más tarde", tone: "later" }
          : null;

  const volver = () => {
    pickedByUser.current = false;
    setSelection(null);
  };
  let cta: { label: string; disabled?: boolean; ghost?: boolean; onClick: () => void } | null =
    null;
  if (!allDone && selection !== null && selection !== pendienteIndex) {
    cta = { label: "Volver a ahora", ghost: true, onClick: volver };
  } else if (allDone && selection !== null) {
    cta = { label: "Volver a hoy", ghost: true, onClick: volver };
  } else if (isCurrent && comida) {
    cta = {
      label: `Terminé ${comida.nombre}`,
      disabled: locked,
      onClick: finish,
    };
  }

  return (
    <div className="comida-hoy">
      <header className="comida-hoy__top">
        <MenuRing done={done.length} total={total} />
        <div className="comida-hoy__titles">
          <p className="comida-kicker">Menú de hoy</p>
          <h2 className="comida-hoy__dia">{dia.nombre}</h2>
          <p className="comida-hoy__meta">
            {allDone ? "Día completo" : `${done.length} de ${total} comidas`}
          </p>
        </div>
        {diaKcal ? (
          <div className="comida-hoy__energy">
            <p>
              <strong>{kcalHechas}</strong>
              <span> / {diaKcal} kcal</span>
            </p>
            <div
              className="comida-hoy__bar"
              role="progressbar"
              aria-label="Calorías del día"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progreso}
            >
              <span style={{ width: `${progreso}%` }} />
            </div>
          </div>
        ) : null}
      </header>

      <div className="comida-hoy__body">

      <ol className="comida-timeline" aria-label="Comidas del día">
        {dia.comidas.map((item, index) => {
          const hecha = done.includes(index);
          const ahora = index === pendienteIndex && !allDone;
          const selected = index === selectedIndex;
          return (
            <li
              key={`${item.nombre}-${index}`}
              className={`comida-timeline__item${hecha ? " is-done" : ""}${
                ahora ? " is-now" : ""
              }${selected ? " is-selected" : ""}`}
            >
              <button
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                type="button"
                className="comida-timeline__btn"
                aria-current={selected ? "true" : undefined}
                aria-label={`${item.nombre}, ${estadoLabel(hecha, ahora)}`}
                onClick={() => pick(index)}
              >
                <span className="comida-timeline__dot" aria-hidden>
                  {hecha ? <Check size={13} strokeWidth={3} /> : null}
                </span>
                <span className="comida-timeline__text">
                  <span className="comida-timeline__hora">{item.horario ?? "—"}</span>
                  <span className="comida-timeline__nombre">{item.nombre}</span>
                </span>
                {item.macrosComida ? (
                  <span className="comida-timeline__kcal">{item.macrosComida.kcal} kcal</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>

      <article
        key={comida ? `${selectedIndex}-${comida.nombre}` : "dia-completo"}
        className="comida-plato"
        aria-live="polite"
      >
        {allDone && !comida ? (
          <>
            <p className="comida-kicker">Día completo</p>
            <h1>Listo por hoy</h1>
            <p className="comida-plato__later">
              Cumpliste las {total} comidas. Si querés, marcá cómo te fue.
            </p>
            {preview ? (
              <div className="checkin-alimentacion checkin-alimentacion--embedded">
                <h2 className="checkin-alimentacion__title">
                  ¿Cómo te fue con la alimentación hoy?
                </h2>
                <div className="checkin-alimentacion__chips">
                  {["Cumplí", "Parcial", "No pude"].map((label) => (
                    <button
                      key={label}
                      type="button"
                      className="checkin-alimentacion__chip"
                      disabled
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <CheckinAlimentacionCard embedded />
            )}
          </>
        ) : comida ? (
          <>
            <div className="comida-plato__head">
              <div className="comida-plato__meta">
                {badge ? (
                  <span className={`comida-badge comida-badge--${badge.tone}`}>
                    {badge.tone === "done" ? <Check size={12} strokeWidth={3} /> : null}
                    {badge.label}
                  </span>
                ) : null}
                {comida.horario || (!isDone && rel) ? (
                  <span className="comida-plato__time">
                    <Clock size={13} aria-hidden />
                    {[comida.horario, !isDone ? rel : null].filter(Boolean).join(" · ")}
                  </span>
                ) : null}
              </div>
              <h1 id="comida-plato-title">{comida.nombre}</h1>
              {comida.macrosComida ? (
                <p className="comida-plato__kcal">
                  <strong>{comida.macrosComida.kcal}</strong> kcal
                </p>
              ) : null}
            </div>
            {locked && unlockLabel ? (
              <p className="comida-plato__status" id="comida-plato-status">
                <Lock size={14} aria-hidden />
                Vas a poder marcarla desde las {unlockLabel}
              </p>
            ) : null}
            {isLater ? (
              <p className="comida-plato__later">
                <Lock size={14} aria-hidden />
                El detalle se abre cuando llegue esta comida.
              </p>
            ) : (
              <>
                {comida.macrosComida ? <PlatoMacros macros={comida.macrosComida} /> : null}
                <ComidaLeaders comida={comida} />
                <ComidaNotas comida={comida} />
              </>
            )}
          </>
        ) : null}

        {cta ? (
          <div className="comida-plato__footer">
            <button
              type="button"
              className={`comida-plato__cta${cta.ghost ? " comida-plato__cta--ghost" : ""}`}
              disabled={cta.disabled}
              aria-describedby={cta.disabled ? "comida-plato-status" : undefined}
              onClick={cta.onClick}
            >
              {cta.label}
            </button>
          </div>
        ) : null}
      </article>
      </div>
    </div>
  );
}
