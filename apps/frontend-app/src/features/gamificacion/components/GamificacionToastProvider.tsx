"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  useGamificacion,
  wasRecentGamificationMutation,
} from "@/features/gamificacion/hooks/useGamificacion";
import type { GamificacionBadge, GamificacionPerfil } from "@/features/gamificacion/types";

interface GamifToast {
  id: number;
  icono: string;
  titulo: string;
  detalle: string;
}

function snapshot(data: GamificacionPerfil | undefined) {
  return {
    xpTotal: data?.xpTotal ?? 0,
    nivel: data?.nivel ?? 1,
    badges: new Set(
      (data?.badges ?? []).filter((badge) => badge.desbloqueado).map((badge) => badge.codigo),
    ),
  };
}

let nextToastId = 0;

export function GamificacionToastProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isAlumna = user?.role === "alumna";
  const { data } = useGamificacion(isAlumna);

  const [toasts, setToasts] = useState<GamifToast[]>([]);
  const prevRef = useRef<ReturnType<typeof snapshot> | null>(null);
  const firstRunRef = useRef(true);

  useEffect(() => {
    if (!isAlumna || !data) return;
    if (firstRunRef.current) {
      firstRunRef.current = false;
      prevRef.current = snapshot(data);
      return;
    }

    const prev = prevRef.current ?? snapshot(data);
    const next = snapshot(data);
    prevRef.current = next;

    const newBadges: GamificacionBadge[] = (data.badges ?? []).filter(
      (badge) => badge.desbloqueado && !prev.badges.has(badge.codigo),
    );
    const xpGanado = next.xpTotal - prev.xpTotal;
    const subioNivel = next.nivel > prev.nivel;
    const reciente = wasRecentGamificationMutation();

    const queue: GamifToast[] = [];

    for (const badge of newBadges) {
      queue.push({
        id: ++nextToastId,
        icono: badge.icono,
        titulo: `¡Logro desbloqueado!`,
        detalle: badge.nombre,
      });
    }

    if (subioNivel) {
      queue.push({
        id: ++nextToastId,
        icono: "⬆️",
        titulo: `¡Subiste al nivel ${next.nivel}!`,
        detalle: `${next.xpTotal} XP totales`,
      });
    } else if (xpGanado > 0 && reciente) {
      queue.push({
        id: ++nextToastId,
        icono: "✨",
        titulo: `+${xpGanado} XP`,
        detalle: "Seguí así, estás sumando puntos.",
      });
    }

    if (queue.length === 0) return;

    setToasts((current) => [...current, ...queue]);

    for (const toast of queue) {
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, 4000);
    }
  }, [data, isAlumna]);

  return (
    <>
      {children}
      {toasts.length > 0 ? (
        <div className="gamif-toasts" aria-live="polite" aria-label="Notificaciones de logros">
          {toasts.map((toast) => (
            <div key={toast.id} className="gamif-toast">
              <span className="gamif-toast__icon" aria-hidden>
                {toast.icono}
              </span>
              <span className="gamif-toast__copy">
                <span className="gamif-toast__title">{toast.titulo}</span>
                <span className="gamif-toast__detail">{toast.detalle}</span>
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}
