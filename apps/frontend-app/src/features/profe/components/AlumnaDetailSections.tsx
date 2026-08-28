"use client";

import { memo, useState } from "react";
import {
  AlertTriangle,
  ClipboardList,
  CreditCard,
  HeartPulse,
  MessageSquarePlus,
  Phone,
  Ruler,
  StickyNote,
} from "lucide-react";
import { MembresiaEditor } from "./MembresiaEditor";
import { CoachNotaComposer } from "./CoachNotaComposer";
import type { AlumnaDetail } from "@/types/usuario";

type SheetField = {
  label: string;
  value?: string;
  pending?: boolean;
};

function formatEstadoAdmision(estado: AlumnaDetail["estadoAdmision"]) {
  const labels: Record<AlumnaDetail["estadoAdmision"], string> = {
    pendiente: "Pendiente",
    admitida: "Admitida",
    rechazada: "Rechazada",
  };
  return labels[estado];
}

function calcularEdad(fecha?: string) {
  const match = fecha?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const nacimiento = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (Number.isNaN(nacimiento.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const cumple =
    new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate());
  if (hoy < cumple) edad -= 1;
  return edad >= 0 ? edad : null;
}

function initials(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function SheetRow({ field, highlight }: { field: SheetField; highlight?: boolean }) {
  const value = field.value?.trim() ? field.value : "Sin dato";
  return (
    <div
      className={`alumna-sheet__row${highlight && !field.value?.trim() ? " alumna-sheet__row--empty" : ""}`}
    >
      <dt>
        {field.label}
        {field.pending ? (
          <span
            className="alumna-detail__pending-badge"
            title="Pendiente de revisión"
          >
            ⏳
          </span>
        ) : null}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}

function SheetGroup({
  title,
  icon,
  fields,
  variant,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  fields?: SheetField[];
  variant?: "salud";
  children?: React.ReactNode;
}) {
  return (
    <section
      className={`alumna-sheet__group${variant === "salud" ? " alumna-sheet__group--salud" : ""}`}
    >
      <h2 className="alumna-sheet__group-title">
        <span className="alumna-sheet__group-icon" aria-hidden>
          {icon}
        </span>
        {title}
      </h2>
      {fields ? (
        <dl className="alumna-sheet__rows">
          {fields.map((field) => (
            <SheetRow key={field.label} field={field} highlight={variant === "salud"} />
          ))}
        </dl>
      ) : null}
      {children}
    </section>
  );
}

export function AlumnaProfileSections({
  alumna,
  onReviewHealthChanges,
  onAlumnaUpdated,
}: {
  alumna: AlumnaDetail;
  onReviewHealthChanges?: () => void;
  onAlumnaUpdated?: () => void;
}) {
  const [activePanel, setActivePanel] = useState<"membresia" | "nota" | null>(null);

  const healthPending = alumna.healthChangesPending;
  const isPending = (field: keyof NonNullable<AlumnaDetail["healthChangesPending"]>) =>
    Boolean(healthPending?.[field]);
  const pendingHealthCount = healthPending
    ? [
        healthPending.mutualista,
        healthPending.coberturaEmergenciaMedica,
        healthPending.lesionesPatologias,
        healthPending.alergias,
      ].filter(Boolean).length
    : 0;

  const edad = calcularEdad(alumna.fechaNacimiento);

  const contactoFields: SheetField[] = [
    { label: "Email", value: alumna.email },
    { label: "Teléfono", value: alumna.telefono },
    { label: "Cédula", value: alumna.cedula },
  ];

  const datosFisicosFields: SheetField[] = [
    {
      label: "Fecha de nacimiento",
      value: alumna.fechaNacimiento,
    },
    { label: "Edad", value: edad !== null ? `${edad} años` : undefined },
    {
      label: "Sexo",
      value:
        alumna.sexo === "hombre"
          ? "Hombre"
          : alumna.sexo === "mujer"
            ? "Mujer"
            : undefined,
    },
    {
      label: "Altura",
      value: alumna.alturaCm
        ? `${alumna.alturaCm.toLocaleString("es-UY")} cm`
        : undefined,
    },
  ];

  const saludFields: SheetField[] = [
    {
      label: "Mutualista",
      value: alumna.mutualista,
      pending: isPending("mutualista"),
    },
    {
      label: "Emergencia médica",
      value: alumna.coberturaEmergenciaMedica,
      pending: isPending("coberturaEmergenciaMedica"),
    },
    {
      label: "Lesiones / patologías",
      value: alumna.lesionesPatologias,
      pending: isPending("lesionesPatologias"),
    },
    { label: "Alergias", value: alumna.alergias, pending: isPending("alergias") },
  ];

  const expedienteFields: SheetField[] = [
    { label: "Fecha de registro", value: alumna.fechaRegistro },
    { label: "Fecha de admisión", value: alumna.fechaAdmision },
    ...(alumna.fechaRechazo?.trim()
      ? [{ label: "Fecha de rechazo", value: alumna.fechaRechazo }]
      : []),
    { label: "ID", value: alumna.id },
  ];

  return (
    <div className="alumna-sheet">
      <article className="alumna-sheet__document">
        <header className="alumna-sheet__header">
          <div className="alumna-sheet__portrait" aria-hidden>
            {alumna.fotoPerfil?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={alumna.fotoPerfil.url} alt="" />
            ) : (
              <span>{initials(alumna.nombre)}</span>
            )}
          </div>
          <div className="alumna-sheet__identity">
            <p className="alumna-sheet__kicker">Ficha técnica</p>
            <h2 className="alumna-sheet__name">{alumna.nombre}</h2>
            <div className="alumna-sheet__meta">
              <span
                className={`alumna-detail-badge alumna-detail-badge--${alumna.estadoAdmision}`}
              >
                {formatEstadoAdmision(alumna.estadoAdmision)}
              </span>
              {alumna.membresia?.estado ? (
                <span
                  className={`alumna-sheet__membresia alumna-sheet__membresia--${alumna.membresia.estado}`}
                >
                  Membresía {alumna.membresia.estado}
                </span>
              ) : null}
            </div>
          </div>
        </header>

        <div className="alumna-sheet__actions">
          <button
            type="button"
            className="alumna-sheet__action"
            onClick={() => setActivePanel("membresia")}
          >
            <CreditCard size={16} aria-hidden />
            Gestionar membresía
          </button>
          <button
            type="button"
            className="alumna-sheet__action"
            onClick={() => setActivePanel("nota")}
          >
            <MessageSquarePlus size={16} aria-hidden />
            Nota a la alumna
          </button>
        </div>

        <div className="alumna-sheet__body">
          <SheetGroup
            title="Contacto e identificación"
            icon={<Phone size={15} />}
            fields={contactoFields}
          />
          <SheetGroup
            title="Datos físicos"
            icon={<Ruler size={15} />}
            fields={datosFisicosFields}
          />
          <SheetGroup
            title="Salud y cobertura"
            icon={<HeartPulse size={15} />}
            fields={saludFields}
            variant="salud"
          >
            {pendingHealthCount > 0 && onReviewHealthChanges ? (
              <div className="alumna-detail__health-alert alumna-sheet__health-alert">
                <button
                  type="button"
                  className="alumna-detail__review-btn"
                  onClick={onReviewHealthChanges}
                >
                  <AlertTriangle size={15} aria-hidden />
                  <span>
                    {pendingHealthCount} cambio
                    {pendingHealthCount === 1 ? "" : "s"} de salud pendiente
                    {pendingHealthCount === 1 ? "" : "s"} de revisión
                  </span>
                  <span aria-hidden>→</span>
                </button>
              </div>
            ) : null}
          </SheetGroup>
          <SheetGroup
            title="Expediente"
            icon={<ClipboardList size={15} />}
            fields={expedienteFields}
          />
        </div>
      </article>

      {activePanel ? (
        <div
          className="alumna-sheet-modal-backdrop"
          role="presentation"
          onClick={() => setActivePanel(null)}
        >
          <div
            className="alumna-sheet-modal"
            role="dialog"
            aria-modal="true"
            aria-label={
              activePanel === "membresia" ? "Gestionar membresía" : "Nota a la alumna"
            }
            onClick={(event) => event.stopPropagation()}
          >
            <div className="alumna-sheet-modal__head">
              <h3>
                {activePanel === "membresia" ? (
                  <>
                    <CreditCard size={16} aria-hidden /> Membresía
                  </>
                ) : (
                  <>
                    <StickyNote size={16} aria-hidden /> Nota a la alumna
                  </>
                )}
              </h3>
              <button
                type="button"
                className="alumna-sheet-modal__close"
                onClick={() => setActivePanel(null)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="alumna-sheet-modal__content">
              {activePanel === "membresia" ? (
                <MembresiaEditor alumna={alumna} onUpdated={onAlumnaUpdated} bare />
              ) : (
                <CoachNotaComposer alumnaId={alumna.id} bare />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AlumnaDetailSectionsRaw({ alumna }: { alumna: AlumnaDetail }) {
  return <AlumnaProfileSections alumna={alumna} />;
}

export const AlumnaDetailSections = memo(AlumnaDetailSectionsRaw);
