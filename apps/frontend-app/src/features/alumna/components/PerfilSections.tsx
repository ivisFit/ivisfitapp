"use client";

import {
  Bell,
  ClipboardList,
  HeartPulse,
  User,
} from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { GamificacionWidget } from "@/features/gamificacion/components/GamificacionWidget";
import type { AlumnaDetail, HealthChangesPendingApiDoc } from "@/types/usuario";
import "./PerfilSections.css";

type SheetField = {
  label: string;
  value?: string;
  pending?: boolean;
};

function displayValue(value?: string) {
  return value?.trim() ? value : "Sin dato";
}

function formatEstadoAdmision(estado: AlumnaDetail["estadoAdmision"]) {
  const labels: Record<AlumnaDetail["estadoAdmision"], string> = {
    pendiente: "Pendiente",
    admitida: "Admitida",
    rechazada: "Rechazada",
  };
  return labels[estado];
}

function SheetRow({
  field,
  highlight,
}: {
  field: SheetField;
  highlight?: boolean;
}) {
  const value = displayValue(field.value);
  return (
    <div
      className={`alumna-sheet__row${highlight && !field.value?.trim() ? " alumna-sheet__row--empty" : ""}`}
    >
      <dt>
        {field.label}
        {field.pending ? (
          <span
            className="alumna-detail__pending-badge"
            title="Pendiente de revisión por tu profe"
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
  onEdit,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  fields?: SheetField[];
  variant?: "salud";
  onEdit?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={`alumna-sheet__group${variant === "salud" ? " alumna-sheet__group--salud" : ""}`}
    >
      <div className="perfil-sheet__group-head">
        <h2 className="alumna-sheet__group-title">
          <span className="alumna-sheet__group-icon" aria-hidden>
            {icon}
          </span>
          {title}
        </h2>
        {onEdit ? (
          <button
            type="button"
            className="perfil-sheet__edit btn btn--ghost"
            onClick={onEdit}
          >
            Editar
          </button>
        ) : null}
      </div>
      {fields ? (
        <dl className="alumna-sheet__rows">
          {fields.map((field) => (
            <SheetRow
              key={field.label}
              field={field}
              highlight={variant === "salud"}
            />
          ))}
        </dl>
      ) : null}
      {children}
    </section>
  );
}

export function PerfilSections({
  alumna,
  onEditSection,
}: {
  alumna: AlumnaDetail;
  onEditSection: (section: "personal" | "salud" | "notificaciones") => void;
}) {
  const healthPending = alumna.healthChangesPending;
  const isPending = (field: keyof HealthChangesPendingApiDoc) =>
    Boolean(healthPending?.[field]);

  const personalFields: SheetField[] = [
    { label: "Teléfono", value: alumna.telefono },
    { label: "Cédula", value: alumna.cedula },
    { label: "Fecha de nacimiento", value: alumna.fechaNacimiento },
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

  const healthFields: SheetField[] = [
    {
      label: "Mutualista",
      value: alumna.mutualista,
      pending: isPending("mutualista"),
    },
    {
      label: "Cobertura emergencia",
      value: alumna.coberturaEmergenciaMedica,
      pending: isPending("coberturaEmergenciaMedica"),
    },
    {
      label: "Lesiones / patologías",
      value: alumna.lesionesPatologias,
      pending: isPending("lesionesPatologias"),
    },
    {
      label: "Alergias",
      value: alumna.alergias,
      pending: isPending("alergias"),
    },
  ];

  const admissionFields: SheetField[] = [
    { label: "Rol", value: alumna.rol },
    {
      label: "Estado de admisión",
      value: formatEstadoAdmision(alumna.estadoAdmision),
    },
    { label: "Fecha de registro", value: alumna.fechaRegistro },
    { label: "Fecha de admisión", value: alumna.fechaAdmision },
    ...(alumna.fechaRechazo?.trim()
      ? [{ label: "Fecha de rechazo", value: alumna.fechaRechazo }]
      : []),
  ];

  return (
    <div className="perfil-sections">
      <div className="alumna-sheet">
        <article className="alumna-sheet__document">
          <header className="alumna-sheet__header">
            <UserAvatar
              name={alumna.nombre}
              photoUrl={alumna.fotoPerfil?.url ?? null}
              className="alumna-sheet__portrait"
            />
            <div className="alumna-sheet__identity">
              <p className="alumna-sheet__kicker">Mi perfil</p>
              <p className="alumna-sheet__name">{alumna.nombre}</p>
              <p className="perfil-sheet__email">{alumna.email}</p>
              <div className="alumna-sheet__meta">
                <span
                  className={`alumna-detail-badge alumna-detail-badge--${alumna.estadoAdmision}`}
                >
                  {formatEstadoAdmision(alumna.estadoAdmision)}
                </span>
              </div>
            </div>
          </header>

          <div className="alumna-sheet__body">
            <SheetGroup
              title="Datos personales"
              icon={<User size={15} />}
              fields={personalFields}
              onEdit={() => onEditSection("personal")}
            />
            <SheetGroup
              title="Salud y cobertura"
              icon={<HeartPulse size={15} />}
              fields={healthFields}
              variant="salud"
              onEdit={() => onEditSection("salud")}
            />
            <SheetGroup
              title="Admisión"
              icon={<ClipboardList size={15} />}
              fields={admissionFields}
            />
            <SheetGroup
              title="Notificaciones"
              icon={<Bell size={15} />}
              onEdit={() => onEditSection("notificaciones")}
            >
              <p className="perfil-sheet__hint">
                Recordatorios de entrenamiento, logros y check-ins de alimentación.
              </p>
            </SheetGroup>
          </div>
        </article>
      </div>

      <GamificacionWidget />
    </div>
  );
}
