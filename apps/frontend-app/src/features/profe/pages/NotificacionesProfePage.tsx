"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { apiFetch } from "@/lib/api";
import { refreshNotificacionesUnread } from "@/features/profe/hooks/useNotificacionesUnread";

type NotificacionItem = {
  id: string;
  tipo: string;
  titulo: string;
  cuerpo: string;
  href: string;
  leida: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

function formatWhen(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-UY", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function NotificacionesProfePage() {
  const router = useRouter();
  const [items, setItems] = useState<NotificacionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ items: NotificacionItem[] }>(
        "/api/notificaciones",
      );
      setItems(data.items);
      void refreshNotificacionesUnread();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar las notificaciones",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const unread = items.some((item) => !item.leida);

  async function openItem(item: NotificacionItem) {
    if (!item.leida) {
      try {
        await apiFetch(`/api/notificaciones/${item.id}/leida`, { method: "PATCH" });
        setItems((current) =>
          current.map((row) => (row.id === item.id ? { ...row, leida: true } : row)),
        );
        void refreshNotificacionesUnread();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo marcar como leída",
        );
        return;
      }
    }
    router.push(item.href);
  }

  async function markAll() {
    setMarkingAll(true);
    setError(null);
    try {
      await apiFetch("/api/notificaciones/leer-todas", { method: "POST" });
      setItems((current) => current.map((item) => ({ ...item, leida: true })));
      void refreshNotificacionesUnread();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron marcar como leídas",
      );
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <>
      <div className="page__actions">
        <div>
          <h1>Notificaciones</h1>
          <p>Avisos de alumnas: admisiones, mensajes, salud, alimentación y seguimiento.</p>
        </div>
        {unread ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => void markAll()}
            disabled={markingAll}
          >
            Marcar todas como leídas
          </Button>
        ) : null}
      </div>

      {loading ? <p className="alumnas-panel__status">Cargando...</p> : null}
      {error ? <p className="auth-error">{error}</p> : null}

      {!loading && !error && items.length === 0 ? (
        <section className="feature-card">
          <p>No tenés notificaciones.</p>
        </section>
      ) : null}

      {items.length > 0 ? (
        <ul className="notificaciones-profe__list">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={
                  item.leida
                    ? "notificaciones-profe__item"
                    : "notificaciones-profe__item notificaciones-profe__item--unread"
                }
                onClick={() => void openItem(item)}
              >
                <span className="notificaciones-profe__title">{item.titulo}</span>
                <span className="notificaciones-profe__body">{item.cuerpo}</span>
                <time dateTime={item.updatedAt ?? item.createdAt ?? undefined}>
                  {formatWhen(item.updatedAt ?? item.createdAt)}
                </time>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
