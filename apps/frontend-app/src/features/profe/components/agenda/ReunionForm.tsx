"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button, Input } from "@/components";
import { useAlumnas } from "@/features/profe/hooks/useAlumnas";
import {
  getReunionDateKey,
  type Reunion,
  type ReunionPayload,
  type ReunionUpdatePayload,
} from "@/features/profe/types/reunion";

type ReunionFormProps = {
  initialDate: string;
  editing?: Reunion | null;
  isSubmitting?: boolean;
  onSubmit: (payload: ReunionPayload | ReunionUpdatePayload) => Promise<boolean>;
  onCancel?: () => void;
};

function getEmptyForm(date: string): ReunionPayload {
  return {
    alumnaId: "",
    fecha: date,
    hora: "10:00",
    titulo: "Reunión",
    descripcion: "",
    meetLink: "",
  };
}

export function ReunionForm({
  initialDate,
  editing = null,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: ReunionFormProps) {
  const { alumnas, loading: alumnasLoading } = useAlumnas();
  const [form, setForm] = useState<ReunionPayload>(() =>
    editing
      ? {
          alumnaId: editing.alumnaId,
          fecha: getReunionDateKey(editing.fecha),
          hora: editing.hora,
          titulo: editing.titulo,
          descripcion: editing.descripcion,
          meetLink: editing.meetLink,
        }
      : getEmptyForm(initialDate),
  );

  useEffect(() => {
    if (editing) {
      setForm({
        alumnaId: editing.alumnaId,
        fecha: getReunionDateKey(editing.fecha),
        hora: editing.hora,
        titulo: editing.titulo,
        descripcion: editing.descripcion,
        meetLink: editing.meetLink,
      });
      return;
    }

    setForm(getEmptyForm(initialDate));
  }, [editing, initialDate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editing) {
      const payload: ReunionUpdatePayload = {
        fecha: form.fecha,
        hora: form.hora,
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        meetLink: form.meetLink.trim(),
      };
      await onSubmit(payload);
      return;
    }

    const payload: ReunionPayload = {
      alumnaId: form.alumnaId,
      fecha: form.fecha,
      hora: form.hora,
      titulo: form.titulo.trim() || "Reunión",
      descripcion: form.descripcion.trim(),
      meetLink: form.meetLink.trim(),
    };

    const success = await onSubmit(payload);
    if (success) {
      setForm(getEmptyForm(initialDate));
    }
  }

  return (
    <form className="ejercicio-form agenda-reunion-form" onSubmit={handleSubmit}>
      {!editing ? (
        <label className="field" htmlFor="alumnaId">
          <span className="field__label">Alumna</span>
          <select
            id="alumnaId"
            name="alumnaId"
            className="field__input"
            required
            value={form.alumnaId}
            disabled={alumnasLoading || isSubmitting}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                alumnaId: event.target.value,
              }))
            }
          >
            <option value="">
              {alumnasLoading ? "Cargando alumnas..." : "Seleccionar alumna"}
            </option>
            {alumnas.map((alumna) => (
              <option key={alumna.id} value={alumna.id}>
                {alumna.nombre}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="agenda-reunion-form__alumna">
          Alumna: <strong>{editing.alumna?.nombre ?? "Sin nombre"}</strong>
        </p>
      )}

      <div className="agenda-reunion-form__row">
        <Input
          label="Fecha"
          name="fecha"
          type="date"
          required
          value={form.fecha}
          disabled={isSubmitting}
          onChange={(event) =>
            setForm((current) => ({ ...current, fecha: event.target.value }))
          }
        />
        <Input
          label="Hora"
          name="hora"
          type="time"
          required
          value={form.hora}
          disabled={isSubmitting}
          onChange={(event) =>
            setForm((current) => ({ ...current, hora: event.target.value }))
          }
        />
      </div>

      <Input
        label="Título"
        name="titulo"
        required
        value={form.titulo}
        disabled={isSubmitting}
        onChange={(event) =>
          setForm((current) => ({ ...current, titulo: event.target.value }))
        }
      />

      <Input
        label="Link de Google Meet"
        name="meetLink"
        type="url"
        required
        placeholder="https://meet.google.com/..."
        value={form.meetLink}
        disabled={isSubmitting}
        onChange={(event) =>
          setForm((current) => ({ ...current, meetLink: event.target.value }))
        }
      />

      <label className="field" htmlFor="descripcion">
        <span className="field__label">Información para la alumna (opcional)</span>
        <textarea
          id="descripcion"
          name="descripcion"
          className="field__input field__textarea"
          rows={3}
          maxLength={500}
          placeholder="Temas a revisar, recordatorios..."
          value={form.descripcion}
          disabled={isSubmitting}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              descripcion: event.target.value,
            }))
          }
        />
      </label>

      <div className="ejercicio-form__actions">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando..."
            : editing
              ? "Guardar cambios"
              : "Agregar reunión"}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  );
}
