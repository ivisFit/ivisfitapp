"use client";

import { useState } from "react";
import { Button, Input, Select } from "@/components";
import { apiFetch } from "@/lib/api";
import type { AlumnaDetail, MembresiaEstado, UsuarioApiDoc } from "@/types/usuario";

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function MembresiaEditor({
  alumna,
  onUpdated,
  bare,
}: {
  alumna: AlumnaDetail;
  onUpdated?: () => void;
  /** Renderiza solo el formulario (sin tarjeta ni título) para usar dentro de un modal. */
  bare?: boolean;
}) {
  const [estado, setEstado] = useState<MembresiaEstado | "">(
    alumna.membresia?.estado ?? "",
  );
  const [fechaVencimiento, setFechaVencimiento] = useState(
    toDateInputValue(alumna.membresia?.fechaVencimiento),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await apiFetch<UsuarioApiDoc>(`/api/usuarios/${alumna.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          membresia: {
            estado: estado || undefined,
            fechaVencimiento: fechaVencimiento
              ? new Date(`${fechaVencimiento}T12:00:00`).toISOString()
              : null,
          },
        }),
      });
      setSuccess("Membresía actualizada");
      onUpdated?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar la membresía",
      );
    } finally {
      setSaving(false);
    }
  }

  const form = (
    <div className="membresia-editor">
      <Select
        label="Estado"
        name="membresiaEstado"
        value={estado}
        onChange={(event) =>
          setEstado(event.target.value as MembresiaEstado | "")
        }
      >
        <option value="">Sin definir</option>
        <option value="al_dia">Al día</option>
        <option value="por_vencer">Por vencer</option>
        <option value="vencida">Vencida</option>
      </Select>
      <Input
        label="Fecha de vencimiento"
        name="membresiaFecha"
        type="date"
        value={fechaVencimiento}
        onChange={(event) => setFechaVencimiento(event.target.value)}
      />
      <Button type="button" onClick={() => void handleSave()} disabled={saving}>
        {saving ? "Guardando..." : "Guardar"}
      </Button>
      {error ? <p className="auth-error">{error}</p> : null}
      {success ? <p className="auth-success">{success}</p> : null}
    </div>
  );

  if (bare) return form;

  return (
    <section className="alumna-profile-card">
      <h2>Membresía</h2>
      {form}
    </section>
  );
}
