"use client";

import { useEffect, useState } from "react";
import { Button, Input } from "@/components";
import { ListSkeleton } from "@/components/skeletons/AppSkeleton";
import { useChatbotLeads } from "@/features/profe/hooks/useChatbotLeads";

const OBSTACULO_LABELS: Record<string, string> = {
  tiempo: "No tiene tiempo",
  motivacion: "No tiene motivación",
  abandono: "Empieza y abandona",
  no_entrenar: "No sabe entrenar",
  no_comer: "No sabe comer",
  sola: "Se siente sola",
  acompanamiento: "Necesita acompañamiento",
};

const OBJETIVO_LABELS: Record<string, string> = {
  bajar_grasa: "Bajar grasa",
  ganar_masa: "Ganar masa muscular",
  tonificar: "Tonificar",
  mejorar_salud: "Mejorar salud",
  recuperar_rutina: "Recuperar la rutina",
  competir: "Prepararse para competir",
  otro: "Otro",
};

const NIVEL_LABELS: Record<string, string> = {
  nunca: "Nunca entrenó",
  a_veces: "Entrena a veces",
  seguido: "Entrena seguido",
  volviendo: "Está volviendo",
};

const FUENTE_LABELS: Record<string, string> = {
  instagram: "Instagram",
  google: "Google",
  facebook: "Facebook",
  amiga: "Amiga",
  otro: "Otro",
};

const GENERO_LABELS: Record<string, string> = {
  mujer: "Mujer",
  hombre: "Hombre",
};

function labelFrom(map: Record<string, string>, value?: string) {
  if (!value) return "Sin dato";
  return map[value] ?? value;
}

function displayValue(value?: string | number) {
  if (value === undefined || value === null || value === "") return "Sin dato";
  return String(value);
}

function formatDate(value?: string) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-UY", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function LeadsChatbotPage({
  embedded = false,
  onRefetchReady,
  onCountChange,
}: {
  embedded?: boolean;
  onRefetchReady?: (refetch: () => void) => void;
  onCountChange?: (count: number) => void;
}) {
  const { leads, loading, error, filters, setFilters, refetch, markContactada } =
    useChatbotLeads();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    onRefetchReady?.(() => void refetch());
  }, [onRefetchReady, refetch]);

  useEffect(() => {
    if (!loading) {
      onCountChange?.(leads.length);
    }
  }, [leads.length, loading, onCountChange]);

  return (
    <>
      {!embedded ? (
        <div className="page__actions">
          <div>
            <h1>Leads del chatbot</h1>
            <p>Evaluaciones comerciales completadas desde la web.</p>
          </div>
          <Button type="button" variant="ghost" onClick={() => void refetch()}>
            Actualizar
          </Button>
        </div>
      ) : null}

      <section className="leads-chatbot-filters">
        <div className="leads-chatbot-filters__grid">
          <label className="field" htmlFor="leads-filter-status">
            <span className="field__label">Estado</span>
            <select
              id="leads-filter-status"
              className="field__input"
              value={filters.status ?? ""}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  status: event.target.value || undefined,
                }))
              }
            >
              <option value="">Todos</option>
              <option value="completed">Completados</option>
              <option value="incomplete">Incompletos</option>
            </select>
          </label>
          <label className="field" htmlFor="leads-filter-fuente">
            <span className="field__label">Fuente</span>
            <select
              id="leads-filter-fuente"
              className="field__input"
              value={filters.fuente ?? ""}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  fuente: event.target.value || undefined,
                }))
              }
            >
              <option value="">Todas</option>
              <option value="instagram">Instagram</option>
              <option value="google">Google</option>
              <option value="facebook">Facebook</option>
              <option value="amiga">Amiga</option>
              <option value="otro">Otro</option>
            </select>
          </label>
          <label className="field" htmlFor="leads-filter-plan">
            <span className="field__label">Plan recomendado</span>
            <select
              id="leads-filter-plan"
              className="field__input"
              value={filters.plan ?? ""}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  plan: event.target.value || undefined,
                }))
              }
            >
              <option value="">Todos</option>
              <option value="online">Plan Total / Online</option>
              <option value="mami-fit">Mami Fit</option>
              <option value="abs-power">Abs Power</option>
              <option value="gluteos">Glúteos de Acero</option>
            </select>
          </label>
          <Input
            label="Desde"
            name="leads-filter-desde"
            type="date"
            value={filters.desde ?? ""}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                desde: event.target.value || undefined,
              }))
            }
          />
          <Input
            label="Hasta"
            name="leads-filter-hasta"
            type="date"
            value={filters.hasta ?? ""}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                hasta: event.target.value || undefined,
              }))
            }
          />
        </div>
      </section>

      {error ? (
        <section>
          <p className="auth-error">{error}</p>
        </section>
      ) : null}

      {loading ? (
        <section aria-busy="true" aria-label="Cargando leads">
          <ListSkeleton items={5} withAvatar />
        </section>
      ) : null}

      {!loading && leads.length === 0 ? (
        <section>
          <p className="alumnas-panel__status">No hay leads todavía.</p>
        </section>
      ) : null}

      <div className="leads-chatbot-list">
        {leads.map((lead) => {
          const isExpanded = expandedId === lead._id;
          return (
            <article className="feature-card leads-chatbot-card" key={lead._id}>
              <div className="leads-chatbot-card__header">
                <div>
                  <h2>{displayValue(lead.nombre)}</h2>
                  <p>{displayValue(lead.email)}</p>
                </div>
                <div className="leads-chatbot-card__badges">
                  {lead.obstaculo ? (
                    <span className="leads-chatbot-card__badge leads-chatbot-card__badge--barrera">
                      {OBSTACULO_LABELS[lead.obstaculo] ?? lead.obstaculo}
                    </span>
                  ) : null}
                  <span
                    className={
                      lead.status === "completed"
                        ? "leads-chatbot-card__badge leads-chatbot-card__badge--done"
                        : "leads-chatbot-card__badge"
                    }
                  >
                    {lead.status === "completed" ? "Completado" : "Incompleto"}
                  </span>
                  <button
                    type="button"
                    className={
                      lead.contactada
                        ? "leads-chatbot-card__badge leads-chatbot-card__badge--contactada"
                        : "leads-chatbot-card__badge leads-chatbot-card__badge--pendiente"
                    }
                    onClick={() => void markContactada(lead._id, !lead.contactada)}
                  >
                    {lead.contactada ? "Contactada ✓" : "Marcar contactada"}
                  </button>
                </div>
              </div>

              <dl className="leads-chatbot-card__summary">
                <div>
                  <dt>WhatsApp</dt>
                  <dd>{displayValue(lead.whatsapp)}</dd>
                </div>
                <div>
                  <dt>Fuente</dt>
                  <dd>{labelFrom(FUENTE_LABELS, lead.fuente)}</dd>
                </div>
                <div>
                  <dt>Género</dt>
                  <dd>{labelFrom(GENERO_LABELS, lead.genero)}</dd>
                </div>
                <div>
                  <dt>Objetivo</dt>
                  <dd>{labelFrom(OBJETIVO_LABELS, lead.objetivo)}</dd>
                </div>
                <div>
                  <dt>Plan recomendado</dt>
                  <dd>{displayValue(lead.planRecomendadoTitulo ?? lead.planRecomendadoSlug)}</dd>
                </div>
                <div>
                  <dt>Fecha</dt>
                  <dd>{formatDate(lead.createdAt ?? lead.fecha)}</dd>
                </div>
              </dl>

              <button
                type="button"
                className="auth-link leads-chatbot-card__toggle"
                onClick={() => setExpandedId(isExpanded ? null : lead._id)}
              >
                {isExpanded ? "Ocultar detalle" : "Ver evaluación completa"}
              </button>

              {isExpanded ? (
                <dl className="leads-chatbot-card__details">
                  <div>
                    <dt>Nivel</dt>
                    <dd>{labelFrom(NIVEL_LABELS, lead.nivel)}</dd>
                  </div>
                  <div>
                    <dt>Motivo abandono</dt>
                    <dd>{displayValue(lead.motivoAbandono)}</dd>
                  </div>
                  <div>
                    <dt>Días / semana</dt>
                    <dd>{displayValue(lead.diasSemana)}</dd>
                  </div>
                  <div>
                    <dt>Tiempo por sesión</dt>
                    <dd>{displayValue(lead.tiempoSesion)}</dd>
                  </div>
                  <div>
                    <dt>Lugar</dt>
                    <dd>{displayValue(lead.lugar)}</dd>
                  </div>
                  <div>
                    <dt>Materiales</dt>
                    <dd>{lead.materiales?.length ? lead.materiales.join(", ") : "Sin dato"}</dd>
                  </div>
                  <div>
                    <dt>Alimentación</dt>
                    <dd>{displayValue(lead.alimentacion)}</dd>
                  </div>
                  <div>
                    <dt>Obstáculo</dt>
                    <dd>{displayValue(lead.obstaculo)}</dd>
                  </div>
                  <div>
                    <dt>Confianza</dt>
                    <dd>{displayValue(lead.confianza)}</dd>
                  </div>
                  {lead.resumenTexto ? (
                    <div className="leads-chatbot-card__resumen">
                      <dt>Resumen</dt>
                      <dd>
                        <pre>{lead.resumenTexto}</pre>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}
            </article>
          );
        })}
      </div>
    </>
  );
}
