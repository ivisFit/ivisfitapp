"use client";

import { useCallback, useState } from "react";
import { Suspense } from "react";
import { Button } from "@/components/Button";
import { IvisContentLoader } from "@/components/IvisContentLoader";
import { useAuth } from "@/context/AuthContext";
import { usePerfil, useInvalidatePerfil } from "@/features/alumna/hooks/usePerfil";
import { PerfilSections } from "@/features/alumna/components/PerfilSections";
import { PerfilEditForm } from "@/features/alumna/components/PerfilEditForm";
import { apiFetch } from "@/lib/api";
import { invalidateCache } from "@/lib/apiCache";
import type { HealthChangesRequestInput, UsuarioApiDoc } from "@/types/usuario";
import "./PerfilPage.css";

function PerfilSkeleton() {
  return <IvisContentLoader label="Cargando perfil" />;
}

export function PerfilPage() {
  const { refreshProfile } = useAuth();
  const invalidatePerfil = useInvalidatePerfil();
  const { data: alumna, isLoading, error, refetch } = usePerfil();

  const [editingNotificaciones, setEditingNotificaciones] = useState(false);

  const handleEditSuccess = useCallback(() => {
    invalidatePerfil();
    invalidateCache("/api/me");
    void refetch();
    void refreshProfile({ silent: true });
  }, [invalidatePerfil, refetch, refreshProfile]);

  const savePersonalField = useCallback(
    async (field: string, value: string) => {
      const payload: Record<string, unknown> = {};

      switch (field) {
        case "nombre":
          if (!value.trim()) throw new Error("El nombre es requerido");
          payload.nombre = value.trim();
          break;
        case "apellido":
          payload.apellido = value.trim();
          break;
        case "telefono":
          payload.telefono = value;
          break;
        case "cedula":
          payload.cedula = value;
          break;
        case "fechaNacimiento":
          payload.fechaNacimiento = new Date(`${value}T12:00:00`).toISOString();
          break;
        case "sexo":
          payload.sexo = value || undefined;
          break;
        case "alturaCm": {
          const n = Number(value);
          if (!Number.isFinite(n) || n <= 0) {
            throw new Error("Ingresá una altura válida en cm");
          }
          payload.alturaCm = n;
          break;
        }
        default:
          throw new Error("Campo no editable");
      }

      await apiFetch<UsuarioApiDoc>("/api/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      handleEditSuccess();
    },
    [handleEditSuccess],
  );

  const saveHealthField = useCallback(
    async (field: string, value: string) => {
      const body: HealthChangesRequestInput = {
        [field as keyof HealthChangesRequestInput]: value,
      };
      await apiFetch<UsuarioApiDoc>("/api/me/health-changes", {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      handleEditSuccess();
    },
    [handleEditSuccess],
  );

  if (isLoading) {
    return <PerfilSkeleton />;
  }

  if (error) {
    return (
      <div className="perfil-page page">
        <p className="auth-error">
          {error instanceof Error ? error.message : "No se pudo cargar el perfil"}
        </p>
        <Button type="button" variant="ghost" onClick={() => void refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (!alumna) return null;

  const notificacionesInitial = {
    recordatoriosEntrenamiento: alumna.notificaciones?.recordatoriosEntrenamiento,
    horaEntrenamiento: alumna.notificaciones?.horaEntrenamiento,
    notificarLogros: alumna.notificaciones?.notificarLogros,
    notificarCheckins: alumna.notificaciones?.notificarCheckins,
  };

  return (
    <div className="perfil-page page">
      <Suspense fallback={<PerfilSkeleton />}>
        <PerfilSections
          alumna={alumna}
          onSavePersonalField={savePersonalField}
          onSaveHealthField={saveHealthField}
          onEditNotificaciones={() => setEditingNotificaciones(true)}
        />
      </Suspense>

      {editingNotificaciones ? (
        <PerfilEditForm
          section="notificaciones"
          initialData={notificacionesInitial}
          onClose={() => setEditingNotificaciones(false)}
          onSuccess={() => {
            handleEditSuccess();
            setEditingNotificaciones(false);
          }}
        />
      ) : null}
    </div>
  );
}
