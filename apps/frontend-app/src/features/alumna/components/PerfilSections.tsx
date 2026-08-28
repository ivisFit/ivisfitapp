"use client";

import { UserAvatar } from "@/components/UserAvatar";
import { getInitials } from "@/lib/display-name";
import type { AlumnaDetail, HealthChangesPendingApiDoc } from "@/types/usuario";
import "./PerfilSections.css";

type DetailField = {
  label: string;
  value: string | number | undefined;
  icon?: React.ReactNode;
  pending?: boolean;
};

function displayValue(value?: string | number) {
  if (typeof value === "number") return value.toLocaleString("es-UY");
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

function getHealthIcon(field: string) {
  switch (field) {
    case "mutualista":
      return "🏥";
    case "coberturaEmergenciaMedica":
      return "🚑";
    case "lesionesPatologias":
      return "🩹";
    case "alergias":
      return "🌰";
    default:
      return "📋";
  }
}

function getPersonalIcon(field: string) {
  switch (field) {
    case "telefono":
      return "📱";
    case "cedula":
      return "🪪";
    case "fechaNacimiento":
      return "🎂";
    case "sexo":
      return "⚥";
    case "alturaCm":
      return "📏";
    default:
      return "👤";
  }
}

function getAdmissionIcon(field: string) {
  switch (field) {
    case "rol":
      return "👤";
    case "estadoAdmision":
      return "📄";
    case "fechaRegistro":
      return "📅";
    case "fechaAdmision":
      return "✅";
    case "fechaRechazo":
      return "❌";
    default:
      return "📋";
  }
}

function DetailSection({
  title,
  fields,
  icon,
}: { title: string; fields: DetailField[]; icon?: React.ReactNode }) {
  return (
    <section className="perfil-section">
      <header className="perfil-section__header">
        <h2 className="perfil-section__title">
          {icon && <span className="perfil-section__icon" aria-hidden>{icon}</span>}
          {title}
        </h2>
      </header>
      <dl className="perfil-fields">
        {fields.map((field, index) => (
          <div className="perfil-field" key={`${field.label}-${index}`}>
            <dt>
              {field.icon && <span className="perfil-field__icon" aria-hidden>{field.icon}</span>}
              {field.label}
              {field.pending && (
                <span className="perfil-field__badge-pending" title="Pendiente de revisión por tu profe">
                  ⏳
                </span>
              )}
            </dt>
            <dd>{displayValue(field.value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function HeroCard({ alumna }: { alumna: AlumnaDetail }) {
  const initials = getInitials(alumna.nombre);
  const estadoClass = `perfil-hero__badge--${alumna.estadoAdmision}`;

  return (
    <div className="perfil-hero">
      <div className="perfil-hero__avatar-wrapper">
        <UserAvatar
          name={alumna.nombre}
          photoUrl={alumna.fotoPerfil?.url ?? null}
          className="perfil-hero__avatar"
        />
      </div>
      <div className="perfil-hero__info">
        <h1 className="perfil-hero__name">{alumna.nombre}</h1>
        <p className="perfil-hero__email">{alumna.email}</p>
        <div className="perfil-hero__meta">
          <span className={`perfil-hero__badge ${estadoClass}`}>
            {formatEstadoAdmision(alumna.estadoAdmision)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function PerfilSections({
  alumna,
  gamificacion,
  onEditSection,
}: {
  alumna: AlumnaDetail;
  gamificacion?: AlumnaDetail["gamificacion"];
  onEditSection: (section: "personal" | "salud" | "notificaciones") => void;
}) {
  const healthPending = alumna.healthChangesPending;

  const isPending = (field: keyof HealthChangesPendingApiDoc) => !!healthPending?.[field];

  const personalFields: DetailField[] = [
    { label: "Teléfono", value: alumna.telefono, icon: getPersonalIcon("telefono") },
    { label: "Cédula", value: alumna.cedula, icon: getPersonalIcon("cedula") },
    { label: "Fecha de nacimiento", value: alumna.fechaNacimiento, icon: getPersonalIcon("fechaNacimiento") },
    {
      label: "Sexo",
      value: alumna.sexo === "hombre" ? "Hombre" : alumna.sexo === "mujer" ? "Mujer" : undefined,
      icon: getPersonalIcon("sexo"),
    },
    {
      label: "Altura",
      value: alumna.alturaCm ? `${alumna.alturaCm.toLocaleString("es-UY")} cm` : undefined,
      icon: getPersonalIcon("alturaCm"),
    },
  ];

  const healthFields: DetailField[] = [
    { label: "Mutualista", value: alumna.mutualista, icon: getHealthIcon("mutualista"), pending: isPending("mutualista") },
    { label: "Cobertura emergencia", value: alumna.coberturaEmergenciaMedica, icon: getHealthIcon("coberturaEmergenciaMedica"), pending: isPending("coberturaEmergenciaMedica") },
    { label: "Lesiones / patologías", value: alumna.lesionesPatologias, icon: getHealthIcon("lesionesPatologias"), pending: isPending("lesionesPatologias") },
    { label: "Alergias", value: alumna.alergias, icon: getHealthIcon("alergias"), pending: isPending("alergias") },
  ];

  const admissionFields: DetailField[] = [
    { label: "Rol", value: alumna.rol, icon: getAdmissionIcon("rol") },
    { label: "Estado de admisión", value: formatEstadoAdmision(alumna.estadoAdmision), icon: getAdmissionIcon("estadoAdmision") },
    { label: "Fecha de registro", value: alumna.fechaRegistro, icon: getAdmissionIcon("fechaRegistro") },
    { label: "Fecha de admisión", value: alumna.fechaAdmision, icon: getAdmissionIcon("fechaAdmision") },
    { label: "Fecha de rechazo", value: alumna.fechaRechazo, icon: getAdmissionIcon("fechaRechazo") },
  ];

  return (
    <div className="perfil-sections">
      <HeroCard alumna={alumna} />

      <DetailSection
        title="Datos personales"
        icon="👤"
        fields={personalFields}
      />

      <DetailSection
        title="Salud y cobertura"
        icon="🏥"
        fields={healthFields}
      />

      <DetailSection
        title="Admisión"
        icon="📄"
        fields={admissionFields}
      />

      {gamificacion && (
        <div className="perfil-section perfil-gamif">
          <header className="perfil-section__header">
            <h2 className="perfil-section__title">
              <span className="perfil-section__icon" aria-hidden>🏆</span>
              Gamificación
            </h2>
          </header>
          <GamificacionWidget gamificacion={gamificacion} />
        </div>
      )}
    </div>
  );
}

function GamificacionWidget({
  gamificacion,
}: {
  gamificacion: NonNullable<AlumnaDetail["gamificacion"]>;
}) {
  const xpProgreso =
    gamificacion.xpProgresoNivel != null &&
    gamificacion.xpSiguiente != null &&
    gamificacion.xpSiguiente > 0
      ? Math.min(
          100,
          Math.round(
            (gamificacion.xpProgresoNivel / gamificacion.xpSiguiente) * 100,
          ),
        )
      : 0;

  const badgesRecientes =
    gamificacion.badges
      ?.filter((b: { desbloqueado?: boolean }) => b.desbloqueado)
      .slice(-3)
      .reverse() ?? [];

  return (
    <div className="gamif-widget">
      <div className="gamif-widget__header">
        <span className="gamif-widget__eyebrow">Tu progreso</span>
      </div>
      <div className="gamif-widget__body">
        <div className="gamif-widget__level">
          <span className="gamif-widget__level-number">{gamificacion.nivel}</span>
          <span className="gamif-widget__level-label">Nivel</span>
        </div>
        <div className="gamif-widget__xp">
          <div className="gamif-widget__xp-row">
            <span>{gamificacion.xpTotal?.toLocaleString("es-UY") ?? 0} XP totales</span>
            <span>{gamificacion.xpProgresoNivel ?? 0}/{gamificacion.xpSiguiente ?? 0} XP al siguiente nivel</span>
          </div>
          <div className="gamif-widget__xp-bar">
            <div className="gamif-widget__xp-bar-fill" style={{ width: `${xpProgreso}%` }} />
          </div>
        </div>
      </div>
      <div className="gamif-widget__stats">
        <span title="Racha actual">
          <span aria-hidden>🔥</span> Racha: {gamificacion.rachaActual ?? 0} días
        </span>
        <span title="Mejor racha">
          <span aria-hidden>🏅</span> Mejor: {gamificacion.rachaMaxima ?? 0} días
        </span>
      </div>
      {badgesRecientes.length > 0 && (
        <div className="gamif-widget__badges">
          {badgesRecientes.map((badge) => (
            <span key={badge.codigo} className="gamif-widget__badge" title={badge.codigo}>
              {badge.icono ?? "🏅"}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}