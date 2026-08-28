"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { useRequestHealthChanges } from "@/features/alumna/hooks/usePerfil";
import type { HealthChangesRequestInput } from "@/types/usuario";
import "./PerfilEditForm.css";

const personalSchema = z.object({
  telefono: z.string().min(1, "Teléfono requerido"),
  cedula: z
    .string()
    .regex(/^\d+$/, "Cédula solo números")
    .optional()
    .or(z.literal("")),
  fechaNacimiento: z.string().optional(),
  sexo: z.enum(["hombre", "mujer"]).optional(),
  alturaCm: z.coerce.number().positive().optional(),
});

const healthSchema = z.object({
  mutualista: z.string().min(1, "Mutualista requerida").optional(),
  coberturaEmergenciaMedica: z.string().min(1, "Cobertura requerida").optional(),
  lesionesPatologias: z.string().min(1, "Campo requerido").optional(),
  alergias: z.string().min(1, "Campo requerido").optional(),
});

const notificacionesSchema = z.object({
  recordatoriosEntrenamiento: z.boolean().optional(),
  horaEntrenamiento: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Formato HH:MM")
    .nullable()
    .optional(),
  notificarLogros: z.boolean().optional(),
  notificarCheckins: z.boolean().optional(),
});

type PersonalForm = z.infer<typeof personalSchema>;
type HealthForm = z.infer<typeof healthSchema>;
type NotificacionesForm = z.infer<typeof notificacionesSchema>;

interface PerfilEditFormProps {
  section: "personal" | "salud" | "notificaciones";
  initialData: PersonalForm | HealthForm | NotificacionesForm;
  onClose: () => void;
  onSuccess: () => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="perfil-edit__error" role="alert">
      {message}
    </p>
  );
}

function FieldLabel({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor: string;
}) {
  return (
    <label htmlFor={htmlFor} className="perfil-edit__label">
      {children}
    </label>
  );
}

function FormShell({
  title,
  subtitle,
  error,
  submitting,
  onClose,
  onSubmit,
  children,
}: {
  title: string;
  subtitle: string;
  error: string | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="perfil-edit"
      role="dialog"
      aria-modal="true"
      aria-labelledby="perfil-edit-title"
    >
      <div className="perfil-edit__backdrop" onClick={onClose} aria-hidden />
      <div className="perfil-edit__panel">
        <header className="perfil-edit__header">
          <h2 id="perfil-edit-title" className="perfil-edit__title">
            {title}
          </h2>
          <p className="perfil-edit__subtitle">{subtitle}</p>
          <button
            type="button"
            className="perfil-edit__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {error ? (
          <div className="perfil-edit__global-error" role="alert">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="perfil-edit__form">
          {children}
          <div className="perfil-edit__actions">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

async function patchMe(data: unknown) {
  const response = await fetch("/api/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      typeof err?.message === "string" ? err.message : "Error al actualizar",
    );
  }
}

function PersonalEditForm({
  initialData,
  onClose,
  onSuccess,
}: {
  initialData: PersonalForm;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalForm>({
    resolver: zodResolver(personalSchema),
    defaultValues: personalSchema.parse(initialData),
    mode: "onBlur",
  });

  async function onSubmit(data: PersonalForm) {
    setSubmitting(true);
    setError(null);
    try {
      await patchMe(data);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormShell
      title="Datos personales"
      subtitle="Teléfono, cédula, fecha de nacimiento, sexo y altura"
      error={error}
      submitting={submitting}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="perfil-edit__field">
        <FieldLabel htmlFor="telefono">Teléfono</FieldLabel>
        <Input
          label=""
          id="telefono"
          type="tel"
          placeholder="09X XXX XXX"
          {...register("telefono")}
          disabled={submitting}
        />
        <FieldError message={errors.telefono?.message} />
      </div>

      <div className="perfil-edit__field">
        <FieldLabel htmlFor="cedula">Cédula (sin puntos ni guión)</FieldLabel>
        <Input
          label=""
          id="cedula"
          type="text"
          placeholder="12345678"
          {...register("cedula")}
          disabled={submitting}
        />
        <FieldError message={errors.cedula?.message} />
      </div>

      <div className="perfil-edit__field">
        <FieldLabel htmlFor="fechaNacimiento">Fecha de nacimiento</FieldLabel>
        <Input
          label=""
          id="fechaNacimiento"
          type="date"
          {...register("fechaNacimiento")}
          disabled={submitting}
        />
        <FieldError message={errors.fechaNacimiento?.message} />
      </div>

      <div className="perfil-edit__field">
        <FieldLabel htmlFor="sexo">Sexo</FieldLabel>
        <Select id="sexo" label="" {...register("sexo")} disabled={submitting}>
          <option value="">Seleccionar</option>
          <option value="hombre">Hombre</option>
          <option value="mujer">Mujer</option>
        </Select>
        <FieldError message={errors.sexo?.message} />
      </div>

      <div className="perfil-edit__field">
        <FieldLabel htmlFor="alturaCm">Altura (cm)</FieldLabel>
        <Input
          label=""
          id="alturaCm"
          type="number"
          min="50"
          max="250"
          step="1"
          placeholder="170"
          {...register("alturaCm", { valueAsNumber: true })}
          disabled={submitting}
        />
        <FieldError message={errors.alturaCm?.message} />
      </div>
    </FormShell>
  );
}

function HealthEditForm({
  initialData,
  onClose,
  onSuccess,
}: {
  initialData: HealthForm;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestHealthChanges = useRequestHealthChanges();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HealthForm>({
    resolver: zodResolver(healthSchema),
    defaultValues: healthSchema.parse(initialData),
    mode: "onBlur",
  });

  async function onSubmit(data: HealthForm) {
    setSubmitting(true);
    setError(null);
    try {
      await requestHealthChanges.mutateAsync(data as HealthChangesRequestInput);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormShell
      title="Salud y cobertura"
      subtitle="Mutualista, cobertura de emergencia, lesiones y alergias. Los cambios requieren validación de tu profe."
      error={error}
      submitting={submitting}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="perfil-edit__field">
        <FieldLabel htmlFor="mutualista">Mutualista</FieldLabel>
        <Input
          label=""
          id="mutualista"
          type="text"
          placeholder="Ej: CASMU, COMERO, etc."
          {...register("mutualista")}
          disabled={submitting}
        />
        <FieldError message={errors.mutualista?.message} />
      </div>

      <div className="perfil-edit__field">
        <FieldLabel htmlFor="coberturaEmergenciaMedica">
          Cobertura de emergencia médica
        </FieldLabel>
        <Input
          label=""
          id="coberturaEmergenciaMedica"
          type="text"
          placeholder="Ej: Emergencia móvil, SEMM, etc."
          {...register("coberturaEmergenciaMedica")}
          disabled={submitting}
        />
        <FieldError message={errors.coberturaEmergenciaMedica?.message} />
      </div>

      <div className="perfil-edit__field">
        <FieldLabel htmlFor="lesionesPatologias">Lesiones / patologías</FieldLabel>
        <textarea
          id="lesionesPatologias"
          rows={3}
          placeholder="Describe lesiones actuales, cirugías previas, condiciones médicas..."
          className="perfil-edit__textarea"
          {...register("lesionesPatologias")}
          disabled={submitting}
        />
        <FieldError message={errors.lesionesPatologias?.message} />
      </div>

      <div className="perfil-edit__field">
        <FieldLabel htmlFor="alergias">Alergias</FieldLabel>
        <textarea
          id="alergias"
          rows={3}
          placeholder="Medicamentos, alimentos, látex, etc."
          className="perfil-edit__textarea"
          {...register("alergias")}
          disabled={submitting}
        />
        <FieldError message={errors.alergias?.message} />
      </div>

      <p className="perfil-edit__hint">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        Los cambios en esta sección requieren validación de tu profe. Verás un
        indicador &quot;⏳ Pendiente de revisión&quot; hasta que sean aprobados.
      </p>
    </FormShell>
  );
}

function NotificacionesEditForm({
  initialData,
  onClose,
  onSuccess,
}: {
  initialData: NotificacionesForm;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<NotificacionesForm>({
    resolver: zodResolver(notificacionesSchema),
    defaultValues: notificacionesSchema.parse(initialData),
    mode: "onBlur",
  });

  async function onSubmit(data: NotificacionesForm) {
    setSubmitting(true);
    setError(null);
    try {
      await patchMe(data);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormShell
      title="Notificaciones"
      subtitle="Preferencias de recordatorios por email"
      error={error}
      submitting={submitting}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
    >
      <fieldset className="perfil-edit__fieldset">
        <legend className="perfil-edit__legend">Recordatorio por email</legend>
        <p className="perfil-edit__hint">
          Guardamos tu hora. Los emails se envían cuando los avisos están activos
          en el servidor y ya tenés rutina asignada.
        </p>
        <div className="perfil-edit__toggle">
          <FieldLabel htmlFor="recordatoriosEntrenamiento">
            Activar recordatorios
          </FieldLabel>
          <input
            id="recordatoriosEntrenamiento"
            type="checkbox"
            {...register("recordatoriosEntrenamiento")}
            disabled={submitting}
            className="perfil-edit__checkbox"
          />
        </div>
        <div className="perfil-edit__field">
          <FieldLabel htmlFor="horaEntrenamiento">
            Hora del recordatorio
          </FieldLabel>
          <Input
            label=""
            id="horaEntrenamiento"
            type="time"
            {...register("horaEntrenamiento")}
            disabled={submitting || !watch("recordatoriosEntrenamiento")}
          />
          <FieldError message={errors.horaEntrenamiento?.message} />
        </div>
      </fieldset>

      <fieldset className="perfil-edit__fieldset">
        <legend className="perfil-edit__legend">Otras notificaciones</legend>
        <div className="perfil-edit__toggle">
          <FieldLabel htmlFor="notificarLogros">
            Avisos de logros en la app
          </FieldLabel>
          <input
            id="notificarLogros"
            type="checkbox"
            {...register("notificarLogros")}
            disabled={submitting}
            className="perfil-edit__checkbox"
          />
        </div>
        <p className="perfil-edit__hint">
          Toasts y medallas dentro de la app (no es push del sistema).
        </p>
        <div className="perfil-edit__toggle">
          <FieldLabel htmlFor="notificarCheckins">
            Notificar check-ins de alimentación
          </FieldLabel>
          <input
            id="notificarCheckins"
            type="checkbox"
            {...register("notificarCheckins")}
            disabled={submitting}
            className="perfil-edit__checkbox"
          />
        </div>
      </fieldset>
    </FormShell>
  );
}

export function PerfilEditForm({
  section,
  initialData,
  onClose,
  onSuccess,
}: PerfilEditFormProps) {
  if (section === "salud") {
    return (
      <HealthEditForm
        initialData={initialData as HealthForm}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );
  }

  if (section === "notificaciones") {
    return (
      <NotificacionesEditForm
        initialData={initialData as NotificacionesForm}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <PersonalEditForm
      initialData={initialData as PersonalForm}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
