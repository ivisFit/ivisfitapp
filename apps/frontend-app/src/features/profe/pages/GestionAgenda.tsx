"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components";
import { useAppDialog } from "@/components/AppDialogProvider";
import { ListSkeleton } from "@/components/skeletons/AppSkeleton";
import { AgendaCalendario } from "@/features/profe/components/agenda/AgendaCalendario";
import { AgendaDiaDetalle } from "@/features/profe/components/agenda/AgendaDiaDetalle";
import { ReunionForm } from "@/features/profe/components/agenda/ReunionForm";
import { useReuniones } from "@/features/profe/hooks/useReuniones";
import {
  formatDateParam,
  getReunionDateKey,
  type Reunion,
  type ReunionPayload,
  type ReunionUpdatePayload,
} from "@/features/profe/types/reunion";

export function GestionAgenda({
  embedded = false,
  onRefetchReady,
  onCountChange,
}: {
  embedded?: boolean;
  onRefetchReady?: (refetch: () => void) => void;
  onCountChange?: (count: number) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const [monthCursor, setMonthCursor] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(
    formatDateParam(today),
  );
  const [showForm, setShowForm] = useState(false);
  const [editingReunion, setEditingReunion] = useState<Reunion | null>(null);

  const {
    reuniones,
    loading,
    error,
    actionId,
    refetch,
    createReunion,
    updateReunion,
    deleteReunion,
  } = useReuniones(monthCursor.year, monthCursor.month);
  const dialog = useAppDialog();

  useEffect(() => {
    onRefetchReady?.(refetch);
  }, [onRefetchReady, refetch]);

  useEffect(() => {
    if (!loading) {
      onCountChange?.(reuniones.length);
    }
  }, [loading, onCountChange, reuniones.length]);

  const isSubmitting =
    actionId === "create" || (editingReunion !== null && actionId === editingReunion.id);

  function handleSelectDate(dateKey: string) {
    setSelectedDate(dateKey);
    setEditingReunion(null);
    setShowForm(false);
  }

  function handlePrevMonth() {
    setMonthCursor((current) => {
      const date = new Date(current.year, current.month - 1, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  function handleNextMonth() {
    setMonthCursor((current) => {
      const date = new Date(current.year, current.month + 1, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  function openCreateForm() {
    setEditingReunion(null);
    setShowForm(true);
  }

  function openEditForm(reunion: Reunion) {
    setEditingReunion(reunion);
    setShowForm(true);
  }

  function closeForm() {
    setEditingReunion(null);
    setShowForm(false);
  }

  async function handleSubmit(
    payload: ReunionPayload | ReunionUpdatePayload,
  ): Promise<boolean> {
    if (editingReunion) {
      const success = await updateReunion(
        editingReunion.id,
        payload as ReunionUpdatePayload,
      );
      if (success) closeForm();
      return success;
    }

    const created = await createReunion(payload as ReunionPayload);
    if (created) {
      closeForm();
      setSelectedDate(getReunionDateKey(created.fecha));
      return true;
    }

    return false;
  }

  async function handleDelete(reunion: Reunion) {
    const confirmed = await dialog.confirm({
      title: "Eliminar reunión",
      message: `¿Eliminar la reunión con ${reunion.alumna?.nombre ?? "la alumna"}?`,
      tone: "danger",
      confirmLabel: "Eliminar",
    });
    if (!confirmed) return;

    await deleteReunion(reunion.id);
  }

  return (
    <>
      {!embedded ? (
        <div className="page__actions">
          <div>
            <h1>Agenda de reuniones</h1>
            <p>Agendá reuniones individuales con tus alumnas y compartí el link de Meet.</p>
          </div>
          <Button type="button" variant="ghost" onClick={refetch}>
            Actualizar
          </Button>
        </div>
      ) : null}

      {error ? (
        <section>
          <p className="auth-error">{error}</p>
        </section>
      ) : null}

      {loading ? (
        <div aria-busy="true" aria-label="Cargando agenda">
          <ListSkeleton items={6} withAvatar />
        </div>
      ) : (
        <div className="agenda-layout">
          <AgendaCalendario
            year={monthCursor.year}
            month={monthCursor.month}
            reuniones={reuniones}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />

          <div className="agenda-layout__detail">
            {selectedDate ? (
              <AgendaDiaDetalle
                dateKey={selectedDate}
                reuniones={reuniones}
                actionId={actionId}
                onAdd={openCreateForm}
                onEdit={openEditForm}
                onDelete={(reunion) => void handleDelete(reunion)}
              />
            ) : (
              <section className="agenda-dia-detalle agenda-dia-detalle--empty">
                <p className="alumnas-panel__status">
                  Elegí un día en el calendario; el detalle y las acciones aparecen
                  al lado.
                </p>
              </section>
            )}

            {showForm && selectedDate ? (
              <section className="ejercicio-form-card agenda-form-card">
                <h3>{editingReunion ? "Editar reunión" : "Nueva reunión"}</h3>
                <ReunionForm
                  initialDate={selectedDate}
                  editing={editingReunion}
                  isSubmitting={isSubmitting}
                  onSubmit={handleSubmit}
                  onCancel={closeForm}
                />
              </section>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
