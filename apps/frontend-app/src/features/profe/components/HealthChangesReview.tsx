"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { useApproveHealthChanges, useRejectHealthChanges } from "@/features/alumna/hooks/usePerfil";
import type { AlumnaDetail, ApproveHealthChangesInput } from "@/types/usuario";
import "./HealthChangesReview.css";

type HealthField = {
  key: keyof NonNullable<AlumnaDetail["healthChangesPending"]>;
  label: string;
  icon: string;
};

const HEALTH_FIELDS: HealthField[] = [
  { key: "mutualista", label: "Mutualista", icon: "🏥" },
  { key: "coberturaEmergenciaMedica", label: "Cobertura emergencia", icon: "🚑" },
  { key: "lesionesPatologias", label: "Lesiones / patologías", icon: "🩹" },
  { key: "alergias", label: "Alergias", icon: "🌰" },
];

interface HealthChangesReviewProps {
  alumna: AlumnaDetail;
  onClose: () => void;
  onChange: () => void;
}

export function HealthChangesReview({ alumna, onClose, onChange }: HealthChangesReviewProps) {
  const [approvingFields, setApprovingFields] = useState<Set<string>>(new Set());
  const [rejectingFields, setRejectingFields] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const approveMutation = useApproveHealthChanges();
  const rejectMutation = useRejectHealthChanges();

  const pending = alumna.healthChangesPending;
  if (!pending) return null;

  const pendingHealth = pending;

  const hasPending = HEALTH_FIELDS.some((f) => pendingHealth[f.key]);

  if (!hasPending) return null;

  async function handleApprove(field: HealthField["key"]) {
    setError(null);
    setApprovingFields((prev) => new Set(prev).add(field));

    try {
      await approveMutation.mutateAsync({
        alumnaId: alumna.id,
        data: { fields: [field] },
      });
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo aprobar");
    } finally {
      setApprovingFields((prev) => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    }
  }

  async function handleReject(field: HealthField["key"]) {
    setError(null);
    setRejectingFields((prev) => new Set(prev).add(field));

    try {
      await rejectMutation.mutateAsync({
        alumnaId: alumna.id,
        data: { fields: [field] },
      });
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo rechazar");
    } finally {
      setRejectingFields((prev) => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    }
  }

  async function handleApproveAll() {
    const fields = HEALTH_FIELDS.filter((f) => pendingHealth[f.key]).map(
      (f) => f.key,
    );
    if (fields.length === 0) return;

    setError(null);
    setApprovingFields(new Set(fields));

    try {
      await approveMutation.mutateAsync({
        alumnaId: alumna.id,
        data: { fields },
      });
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo aprobar todo");
    } finally {
      setApprovingFields(new Set());
    }
  }

  async function handleRejectAll() {
    const fields = HEALTH_FIELDS.filter((f) => pendingHealth[f.key]).map(
      (f) => f.key,
    );
    if (fields.length === 0) return;

    setError(null);
    setRejectingFields(new Set(fields));

    try {
      await rejectMutation.mutateAsync({
        alumnaId: alumna.id,
        data: { fields },
      });
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo rechazar todo");
    } finally {
      setRejectingFields(new Set());
    }
  }

  const isLoading = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="health-review" role="dialog" aria-modal="true" aria-labelledby="health-review-title">
      <div className="health-review__backdrop" onClick={onClose} aria-hidden />
      <div className="health-review__panel">
        <header className="health-review__header">
          <h2 id="health-review-title" className="health-review__title">
            Revisar cambios de salud
          </h2>
          <p className="health-review__subtitle">
            {alumna.nombre} solicitó actualizar sus datos de salud. Revisá cada campo y decidí si aprobar o rechazar.
          </p>
          <button
            type="button"
            className="health-review__close"
            onClick={onClose}
            aria-label="Cerrar"
            disabled={isLoading}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {error && (
          <div className="health-review__error" role="alert">
            {error}
          </div>
        )}

        <div className="health-review__list">
          {HEALTH_FIELDS.map((field) => {
            const change = pendingHealth[field.key];
            if (!change) return null;

            const isApproving = approvingFields.has(field.key);
            const isRejecting = rejectingFields.has(field.key);
            const isDisabled = isApproving || isRejecting;

            return (
              <article key={field.key} className="health-review__item">
                <div className="health-review__field-info">
                  <span className="health-review__icon" aria-hidden>{field.icon}</span>
                  <div className="health-review__field-meta">
                    <h3 className="health-review__field-label">{field.label}</h3>
                    <div className="health-review__values">
                      <div className="health-review__value-row">
                        <span className="health-review__value-label">Actual:</span>
                        <span className="health-review__value health-review__value--current">
                          {change.current || "—"}
                        </span>
                      </div>
                      <div className="health-review__value-row">
                        <span className="health-review__value-label">Propuesto:</span>
                        <span className="health-review__value health-review__value--proposed">
                          {change.proposed}
                        </span>
                      </div>
                    </div>
                    <time className="health-review__requested" dateTime={change.requestedAt}>
                      Solicitado: {new Date(change.requestedAt).toLocaleString("es-UY", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                </div>

                <div className="health-review__actions">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => handleApprove(field.key)}
                    disabled={isDisabled || isLoading}
                    className="health-review__btn-approve"
                  >
                    {isApproving ? "Aprobando..." : "Aprobar"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleReject(field.key)}
                    disabled={isDisabled || isLoading}
                    className="health-review__btn-reject"
                  >
                    {isRejecting ? "Rechazando..." : "Rechazar"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        <footer className="health-review__footer">
          <Button
            type="button"
            variant="ghost"
            onClick={handleRejectAll}
            disabled={isLoading}
            className="health-review__btn-reject-all"
          >
            Rechazar todos
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleApproveAll}
            disabled={isLoading}
            className="health-review__btn-approve-all"
          >
            Aprobar todos
          </Button>
        </footer>
      </div>
    </div>
  );
}