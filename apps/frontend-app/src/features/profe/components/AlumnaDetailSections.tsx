"use client";

import { memo, useCallback, useState } from "react";
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
import { InlineEditableSheetRow } from "@/components/sheet/InlineEditableSheetRow";
import { MembresiaEditor } from "./MembresiaEditor";
import { CoachNotaComposer } from "./CoachNotaComposer";
import { UserAvatar } from "@/components/UserAvatar";
import { patchAlumnaField } from "@/features/profe/lib/patch-alumna-field";
import type { AlumnaDetail } from "@/types/usuario";
import { fechaToDateInputValue } from "@/types/usuario";

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

  const saveField = useCallback(
    async (payload: Record<string, unknown>) => {
      await patchAlumnaField(alumna.id, payload);
      onAlumnaUpdated?.();
    },
    [alumna.id, onAlumnaUpdated],
  );

  const expedienteFields: SheetField[] = [
    { label: "Fecha de registro", value: alumna.fechaRegistro },
    { label: "Fecha de admisión", value: alumna.fechaAdmision },
    ...(alumna.fechaRechazo?.trim()
      ? [{ label: "Fecha de rechazo", value: alumna.fechaRechazo }]
      : []),
    { label: "ID", value: alumna.id },
  ];

  const sexoDisplay =
    alumna.sexo === "hombre"
      ? "Hombre"
      : alumna.sexo === "mujer"
        ? "Mujer"
        : undefined;

  return (
    <div className="alumna-sheet">
      <article className="alumna-sheet__document">
        <header className="alumna-sheet__header">
          <UserAvatar
            name={alumna.nombre}
            photoUrl={alumna.fotoPerfil?.url ?? null}
            className="alumna-sheet__portrait"
          />
          <div className="alumna-sheet__identity">
            <p className="alumna-sheet__kicker">Ficha técnica</p>
            <p className="alumna-sheet__name">{alumna.nombre}</p>
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
          <SheetGroup title="Contacto e identificación" icon={<Phone size={15} />}>
            <dl className="alumna-sheet__rows">
              <InlineEditableSheetRow
                label="Nombre"
                value={alumna.nombre}
                onSave={(v) => saveField({ nombre: v })}
              />
              <InlineEditableSheetRow
                label="Email"
                kind="email"
                value={alumna.email}
                onSave={(v) => saveField({ correo: v.trim().toLowerCase() })}
              />
              <InlineEditableSheetRow
                label="Teléfono"
                kind="tel"
                value={alumna.telefono}
                onSave={(v) => saveField({ telefono: v })}
              />
              <InlineEditableSheetRow
                label="Cédula"
                value={alumna.cedula ?? ""}
                inputMode="numeric"
                onSave={(v) => saveField({ cedula: v })}
              />
            </dl>
          </SheetGroup>

          <SheetGroup title="Datos físicos" icon={<Ruler size={15} />}>
            <dl className="alumna-sheet__rows">
              <InlineEditableSheetRow
                label="Fecha de nacimiento"
                kind="date"
                value={fechaToDateInputValue(alumna.fechaNacimiento)}
                displayValue={alumna.fechaNacimiento}
                onSave={(v) =>
                  saveField({
                    fechaNacimiento: new Date(`${v}T12:00:00`).toISOString(),
                  })
                }
              />
              <SheetRow
                field={{
                  label: "Edad",
                  value: edad !== null ? `${edad} años` : undefined,
                }}
              />
              <InlineEditableSheetRow
                label="Sexo"
                kind="select"
                value={alumna.sexo ?? ""}
                displayValue={sexoDisplay}
                selectOptions={[
                  { value: "", label: "Sin especificar" },
                  { value: "mujer", label: "Mujer" },
                  { value: "hombre", label: "Hombre" },
                ]}
                onSave={(v) => saveField({ sexo: v || undefined })}
              />
              <InlineEditableSheetRow
                label="Altura"
                kind="number"
                value={alumna.alturaCm ? String(alumna.alturaCm) : ""}
                displayValue={
                  alumna.alturaCm
                    ? `${alumna.alturaCm.toLocaleString("es-UY")} cm`
                    : undefined
                }
                onSave={(v) => {
                  const n = Number(v);
                  if (!Number.isFinite(n) || n <= 0) {
                    throw new Error("Ingresá una altura válida en cm");
                  }
                  return saveField({ alturaCm: n });
                }}
              />
            </dl>
          </SheetGroup>

          <SheetGroup
            title="Salud y cobertura"
            icon={<HeartPulse size={15} />}
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
            <dl className="alumna-sheet__rows">
              <InlineEditableSheetRow
                label="Mutualista"
                value={alumna.mutualista ?? ""}
                pending={isPending("mutualista")}
                highlight
                onSave={(v) => saveField({ mutualista: v })}
              />
              <InlineEditableSheetRow
                label="Emergencia médica"
                value={alumna.coberturaEmergenciaMedica ?? ""}
                pending={isPending("coberturaEmergenciaMedica")}
                highlight
                onSave={(v) => saveField({ coberturaEmergenciaMedica: v })}
              />
              <InlineEditableSheetRow
                label="Lesiones / patologías"
                kind="textarea"
                value={alumna.lesionesPatologias ?? ""}
                pending={isPending("lesionesPatologias")}
                highlight
                onSave={(v) => saveField({ lesionesPatologias: v })}
              />
              <InlineEditableSheetRow
                label="Alergias"
                kind="textarea"
                value={alumna.alergias ?? ""}
                pending={isPending("alergias")}
                highlight
                onSave={(v) => saveField({ alergias: v })}
              />
            </dl>
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
