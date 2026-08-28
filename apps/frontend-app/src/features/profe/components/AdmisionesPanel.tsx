"use client";

import { Button } from "@/components";
import { UserAvatar } from "@/components/UserAvatar";
import { CardSkeleton } from "@/components/skeletons/AppSkeleton";
import type { AdmissionRequest } from "@/types/usuario";

function formatMetodo(metodo?: string) {
  return metodo === "whatsapp" ? "WhatsApp" : "Adjunto en la página";
}

function displayValue(value?: string) {
  return value?.trim() ? value : null;
}

function getWhatsappComprobanteUrl(nombre: string, telefono?: string) {
  const phone = telefono?.replace(/\D/g, "") ?? "";
  const message = encodeURIComponent(
    `Hola ${nombre}, no veo el comprobante de pago adjunto en tu solicitud de IVIS Fit. ¿Podés enviármelo por acá?`,
  );

  return phone
    ? `https://wa.me/${phone}?text=${message}`
    : `https://wa.me/?text=${message}`;
}

function isPdfComprobante(comprobante: { formato?: string; url: string }) {
  return (
    comprobante.formato?.toLowerCase() === "pdf" ||
    comprobante.url.toLowerCase().includes(".pdf")
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={value ? undefined : "is-empty"}>
        {value ?? "Sin dato"}
      </dd>
    </div>
  );
}

interface AdmisionesPanelProps {
  solicitudes: AdmissionRequest[];
  loading: boolean;
  actionId: string | null;
  error: string | null;
  onRetry: () => void;
  onDecidir: (id: string, accion: "admitir" | "rechazar") => void;
}

export function AdmisionesPanel({
  solicitudes,
  loading,
  actionId,
  error,
  onRetry,
  onDecidir,
}: AdmisionesPanelProps) {
  return (
    <>
      {error ? (
        <section>
          <p className="auth-error">{error}</p>
          <Button type="button" variant="ghost" onClick={onRetry}>
            Reintentar
          </Button>
        </section>
      ) : null}

      {loading ? (
        <div aria-busy="true" aria-label="Cargando solicitudes">
          <CardSkeleton lines={4} elevated />
          <CardSkeleton lines={4} elevated />
          <CardSkeleton lines={4} elevated />
        </div>
      ) : null}

      {!loading && solicitudes.length === 0 ? (
        <p className="admisiones-panel__empty">
          No hay solicitudes pendientes. Cuando una alumna complete el registro,
          aparecerá acá para que la revises.
        </p>
      ) : null}

      <div className="admisiones-list">
        {solicitudes.map((solicitud) => {
          const isProcessing = actionId === solicitud.id;
          const isWhatsapp = solicitud.metodoComprobante === "whatsapp";

          return (
            <article className="feature-card admision-card" key={solicitud.id}>
              <header className="admision-card__header">
                <UserAvatar
                  name={solicitud.nombre}
                  photoUrl={solicitud.fotoPerfil?.url ?? null}
                  className="admision-card__avatar"
                />
                <div className="admision-card__identity">
                  <h2>{solicitud.nombre}</h2>
                  <p>{solicitud.email}</p>
                </div>
                <div className="admision-card__badges">
                  <span className="admision-card__badge admision-card__badge--pending">
                    Pendiente
                  </span>
                  <span
                    className={`admision-card__badge ${
                      isWhatsapp
                        ? "admision-card__badge--whatsapp"
                        : "admision-card__badge--adjunto"
                    }`}
                  >
                    {formatMetodo(solicitud.metodoComprobante)}
                  </span>
                </div>
              </header>

              <div className="admision-card__sections">
                <section className="admision-card__section">
                  <h3 className="admision-card__section-title">Contacto</h3>
                  <dl className="admision-card__details">
                    <DetailItem
                      label="Teléfono"
                      value={displayValue(solicitud.telefono)}
                    />
                    <DetailItem
                      label="Solicitud"
                      value={displayValue(solicitud.fechaSolicitud)}
                    />
                  </dl>
                </section>

                <section className="admision-card__section">
                  <h3 className="admision-card__section-title">Datos personales</h3>
                  <dl className="admision-card__details">
                    <DetailItem
                      label="Cédula"
                      value={displayValue(solicitud.cedula)}
                    />
                    <DetailItem
                      label="Fecha de nacimiento"
                      value={displayValue(solicitud.fechaNacimiento)}
                    />
                    <DetailItem
                      label="Mutualista"
                      value={displayValue(solicitud.mutualista)}
                    />
                  </dl>
                </section>

                <section className="admision-card__section admision-card__section--salud admision-card__section--full">
                  <h3 className="admision-card__section-title">Salud</h3>
                  <dl className="admision-card__details">
                    <DetailItem
                      label="Emergencia médica"
                      value={displayValue(solicitud.coberturaEmergenciaMedica)}
                    />
                    <DetailItem
                      label="Lesiones / patologías"
                      value={displayValue(solicitud.lesionesPatologias)}
                    />
                    <DetailItem
                      label="Alergias"
                      value={displayValue(solicitud.alergias)}
                    />
                  </dl>
                </section>
              </div>

              {solicitud.comprobantePago?.url ? (
                <div className="admision-card__comprobante">
                  <p className="admision-card__comprobante-label">
                    Comprobante de pago
                  </p>
                  <div className="admision-card__comprobante-preview">
                    {isPdfComprobante(solicitud.comprobantePago) ? (
                      <iframe
                        src={solicitud.comprobantePago.url}
                        title={`Comprobante de pago de ${solicitud.nombre}`}
                      />
                    ) : (
                      <img
                        src={solicitud.comprobantePago.url}
                        alt={`Comprobante de pago de ${solicitud.nombre}`}
                      />
                    )}
                  </div>
                  <a
                    className="auth-link admision-card__comprobante-link"
                    href={solicitud.comprobantePago.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir comprobante en nueva pestaña
                  </a>
                </div>
              ) : (
                <p className="admision-card__hint">
                  {isWhatsapp
                    ? "La alumna eligió enviar el comprobante por WhatsApp."
                    : "No hay comprobante adjunto para esta solicitud."}{" "}
                  <a
                    className="auth-link"
                    href={getWhatsappComprobanteUrl(
                      solicitud.nombre,
                      solicitud.telefono,
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Pedir comprobante por WhatsApp
                  </a>
                </p>
              )}

              <div className="admision-card__actions">
                <Button
                  type="button"
                  className="admision-card__reject"
                  variant="ghost"
                  onClick={() => onDecidir(solicitud.id, "rechazar")}
                  disabled={isProcessing}
                >
                  Rechazar
                </Button>
                <Button
                  type="button"
                  onClick={() => onDecidir(solicitud.id, "admitir")}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Procesando…" : "Admitir alumna"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
