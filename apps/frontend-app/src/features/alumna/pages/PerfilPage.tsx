"use client";

import { useState } from "react";
import { Suspense } from "react";
import { Button } from "@/components/Button";
import { FormSkeleton, SkeletonCard, SkeletonLine } from "@/components/skeletons/AppSkeleton";
import { usePerfil, useInvalidatePerfil } from "@/features/alumna/hooks/usePerfil";
import { PerfilSections } from "@/features/alumna/components/PerfilSections";
import { PerfilEditForm } from "@/features/alumna/components/PerfilEditForm";
import { fechaToDateInputValue } from "@/types/usuario";
import "./PerfilPage.css";

function PerfilSkeleton() {
  return (
    <div className="perfil-page page" aria-busy="true" aria-label="Cargando perfil">
      <SkeletonCard elevated className="perfil-skeleton-sheet">
        <div className="perfil-skeleton-sheet__header">
          <span className="sk sk--avatar-lg" aria-hidden />
          <div className="sk-header">
            <SkeletonLine size="xs" width="w-25" gold />
            <SkeletonLine size="lg" width="w-48" />
            <SkeletonLine size="sm" width="w-40" />
          </div>
        </div>
        <FormSkeleton fields={5} showButton={false} />
      </SkeletonCard>
      <div
        className="sk sk--card-elevated perfil-skeleton-gamif"
        aria-hidden
      />
    </div>
  );
}

export function PerfilPage() {
  const invalidatePerfil = useInvalidatePerfil();
  const { data: alumna, isLoading, error, refetch } = usePerfil();

  const [editingSection, setEditingSection] = useState<"personal" | "salud" | "notificaciones" | null>(null);

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

  const handleEditSection = (section: "personal" | "salud" | "notificaciones") => {
    setEditingSection(section);
  };

  const handleEditClose = () => {
    setEditingSection(null);
  };

  const handleEditSuccess = () => {
    invalidatePerfil();
    refetch();
  };

  const initialData = {
    personal: {
      telefono: alumna.telefono,
      cedula: alumna.cedula,
      fechaNacimiento: fechaToDateInputValue(alumna.fechaNacimiento),
      sexo: alumna.sexo,
      alturaCm: alumna.alturaCm,
    },
    salud: {
      mutualista: alumna.mutualista,
      coberturaEmergenciaMedica: alumna.coberturaEmergenciaMedica,
      lesionesPatologias: alumna.lesionesPatologias,
      alergias: alumna.alergias,
    },
    notificaciones: {
      recordatoriosEntrenamiento: alumna.notificaciones?.recordatoriosEntrenamiento,
      horaEntrenamiento: alumna.notificaciones?.horaEntrenamiento,
      notificarLogros: alumna.notificaciones?.notificarLogros,
      notificarCheckins: alumna.notificaciones?.notificarCheckins,
    },
  };

  return (
    <div className="perfil-page page">
      <Suspense fallback={<PerfilSkeleton />}>
        <PerfilSections
          alumna={alumna}
          onEditSection={handleEditSection}
        />
      </Suspense>

      {editingSection && (
        <PerfilEditForm
          section={editingSection}
          initialData={initialData[editingSection]}
          onClose={handleEditClose}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}