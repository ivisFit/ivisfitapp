"use client";

import { useState } from "react";
import { Suspense } from "react";
import { Button } from "@/components/Button";
import { FormSkeleton, SkeletonLine } from "@/components/skeletons/AppSkeleton";
import { UserAvatar } from "@/components/UserAvatar";
import { getInitials } from "@/lib/display-name";
import { usePerfil, useInvalidatePerfil } from "@/features/alumna/hooks/usePerfil";
import { PerfilSections } from "@/features/alumna/components/PerfilSections";
import { PerfilEditForm } from "@/features/alumna/components/PerfilEditForm";
import { alumnaRoutes } from "@/routes/paths";
import { useRouter } from "next/navigation";
import "./PerfilPage.css";

function PerfilSkeleton() {
  return (
    <div className="perfil-page page" aria-busy="true" aria-label="Cargando perfil">
      <div className="perfil-skeleton-hero">
        <SkeletonLine size="xl" width="w-25" className="perfil-skeleton-avatar" />
        <SkeletonLine size="lg" width="w-48" />
        <SkeletonLine size="sm" width="w-40" />
        <SkeletonLine size="sm" width="w-25" />
      </div>
      <div className="perfil-skeleton-sections">
        <SkeletonLine size="md" width="w-32" gold />
        <div className="sk sk--card-elevated">
          <FormSkeleton fields={3} />
        </div>
        <SkeletonLine size="md" width="w-32" gold />
        <div className="sk sk--card-elevated">
          <FormSkeleton fields={4} />
        </div>
        <SkeletonLine size="md" width="w-32" gold />
        <div className="sk sk--card-elevated">
          <FormSkeleton fields={3} />
        </div>
      </div>
    </div>
  );
}

export function PerfilPage() {
  const router = useRouter();
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
      fechaNacimiento: alumna.fechaNacimiento ? new Date(alumna.fechaNacimiento).toISOString().split("T")[0] : "",
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
          gamificacion={alumna.gamificacion}
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