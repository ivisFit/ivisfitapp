"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components";
import { ListSkeleton } from "@/components/skeletons/AppSkeleton";
import { AgendaCalendario } from "@/features/profe/components/agenda/AgendaCalendario";
import { AgendaDiaDetalle } from "@/features/profe/components/agenda/AgendaDiaDetalle";
import { AgendaDiaModal } from "@/features/profe/components/agenda/AgendaDiaModal";
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
  const [modalDateKey, setModalDateKey] = useState<string | null>(null);
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

  function dayHasReuniones(dateKey: string) {
    return reuniones.some(
      (reunion) => getReunionDateKey(reunion.fecha) === dateKey,
    );
  }

  function handleSelectDate(dateKey: string) {
    setSelectedDate(dateKey);

    if (dayHasReuniones(dateKey)) {
      setModalDateKey(dateKey);
      return;
    }

    setModalDateKey(null);
    setEditingReunion(null);
    setShowForm(false);
  }

  function closeModal() {
    setModalDateKey(null);
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
    closeModal();
  }

  function openEditForm(reunion: Reunion) {
    setEditingReunion(reunion);
    setShowForm(true);
    closeModal();
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
    const confirmed = window.confirm(
      `¿Eliminar la reunión con ${reunion.alumna?.nombre ?? "la alumna"}?`,
    );
    if (!confirmed) return;

    const dateKey = getReunionDateKey(reunion.fecha);
    const success = await deleteReunion(reunion.id);
    if (!success) return;

    const remaining = reuniones.filter(
      (item) =>
        item.id !== reunion.id && getReunionDateKey(item.fecha) === dateKey,
    );

    if (remaining.length === 0) {
      closeModal();
    }
  }

  const selectedDayHasReuniones = selectedDate
    ? dayHasReuniones(selectedDate)
    : false;
  const showSidebarDetail = Boolean(selectedDate) && (!selectedDayHasReuniones || showForm);

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

          <AgendaDiaModal
            dateKey={modalDateKey}
            reuniones={reuniones}
            actionId={actionId}
            onClose={closeModal}
            onAdd={openCreateForm}
            onEdit={openEditForm}
            onDelete={(reunion) => void handleDelete(reunion)}
          />

          <div className="agenda-layout__detail">
            {showSidebarDetail ? (
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
                  Elegí un día libre para agendar una nueva reunión, o tocá un día
                  con citas para ver el detalle.
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
