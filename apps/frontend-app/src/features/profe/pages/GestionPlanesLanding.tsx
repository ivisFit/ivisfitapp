"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button, Input } from "@/components";
import { ListSkeleton } from "@/components/skeletons/AppSkeleton";
import { PlanCardImagePicker } from "@/features/profe/components/PlanCardImagePicker";
import {
  type LandingPlanGestion,
  type LandingPlanPayload,
  useLandingPlanesGestion,
} from "@/features/profe/hooks/useLandingPlanesGestion";

function linesToList(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function listToLines(values: string[]) {
  return values.join("\n");
}

function getEmptyForm() {
  return {
    slug: "",
    orden: "1",
    title: "",
    shortTitle: "",
    route: "",
    subtitle: "",
    duration: "",
    format: "",
    investment: "",
    badge: "",
    cardBullets: "",
    intro: "",
    focus: "",
    methodology: "",
    extras: "",
    benefits: "",
    ctaLabel: "",
    cardImage: "",
    isActive: true,
  };
}

type FormState = ReturnType<typeof getEmptyForm>;

function formFromPlan(plan: LandingPlanGestion): FormState {
  return {
    slug: plan.slug,
    orden: String(plan.orden),
    title: plan.title,
    shortTitle: plan.shortTitle,
    route: plan.route,
    subtitle: plan.subtitle,
    duration: plan.duration,
    format: plan.format,
    investment: plan.investment,
    badge: plan.badge,
    cardBullets: listToLines(plan.cardBullets),
    intro: plan.intro,
    focus: plan.focus,
    methodology: plan.methodology,
    extras: listToLines(plan.extras),
    benefits: listToLines(plan.benefits),
    ctaLabel: plan.ctaLabel,
    cardImage: plan.cardImage,
    isActive: plan.isActive,
  };
}

function formToPayload(form: FormState): LandingPlanPayload {
  const methodology = form.methodology.trim();
  const cardImage = form.cardImage.trim();
  const benefits = linesToList(form.benefits);

  return {
    slug: form.slug.trim(),
    orden: Number.parseInt(form.orden, 10),
    title: form.title.trim(),
    shortTitle: form.shortTitle.trim(),
    route: form.route.trim(),
    subtitle: form.subtitle.trim(),
    duration: form.duration.trim(),
    format: form.format.trim(),
    investment: form.investment.trim(),
    badge: form.badge.trim(),
    cardBullets: linesToList(form.cardBullets),
    intro: form.intro.trim(),
    focus: form.focus.trim(),
    extras: linesToList(form.extras),
    ctaLabel: form.ctaLabel.trim(),
    isActive: form.isActive,
    ...(methodology ? { methodology } : {}),
    ...(cardImage ? { cardImage } : {}),
    ...(benefits.length > 0 ? { benefits } : {}),
  };
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  rows = 3,
  required = false,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field__label">{label}</span>
      <textarea
        id={id}
        name={id}
        className="field__input field__textarea"
        rows={rows}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

type GestionPlanesLandingProps = {
  embedded?: boolean;
  onPlanSaved?: () => void;
};

export function GestionPlanesLanding({
  embedded = false,
  onPlanSaved,
}: GestionPlanesLandingProps = {}) {
  const {
    planes,
    loading,
    error,
    actionId,
    refetch,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanActive,
  } = useLandingPlanesGestion();
  const [form, setForm] = useState(getEmptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingPlan = planes.find((plan) => plan.id === editingId);
  const activeCount = planes.filter((plan) => plan.isActive).length;
  const inactiveCount = planes.length - activeCount;
  const isSubmitting =
    actionId === "create" || (editingId !== null && actionId === editingId);

  function handleEdit(plan: LandingPlanGestion) {
    setEditingId(plan.id);
    setForm(formFromPlan(plan));
  }

  function resetForm() {
    setEditingId(null);
    setForm(getEmptyForm());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = formToPayload(form);

    const success = editingId
      ? await updatePlan(editingId, payload)
      : await createPlan(payload);

    if (success) {
      resetForm();
      onPlanSaved?.();
    }
  }

  async function handleDelete(plan: LandingPlanGestion) {
    const confirmed = window.confirm(
      `¿Eliminar "${plan.title}"? Desaparecerá de la landing pública.`,
    );

    if (!confirmed) return;

    const success = await deletePlan(plan.id);
    if (success) {
      onPlanSaved?.();
      if (editingId === plan.id) {
        resetForm();
      }
    }
  }

  async function handleToggleActive(plan: LandingPlanGestion) {
    const nextActive = !plan.isActive;
    const success = await togglePlanActive(plan.id, nextActive);

    if (success) {
      onPlanSaved?.();
      if (editingId === plan.id) {
        setForm((current) => ({ ...current, isActive: nextActive }));
      }
    }
  }

  return (
    <div className={embedded ? "planes-landing-page planes-landing-page--embedded" : "page planes-landing-page"}>
      {!embedded ? (
        <div className="page__actions">
          <div>
            <h1>Planes de la landing</h1>
            <p>Editá el contenido público de la web: tarjetas, detalle y precios.</p>
          </div>
          <Button type="button" variant="ghost" onClick={refetch}>
            Actualizar
          </Button>
        </div>
      ) : (
        <div className="planes-landing-page__embedded-header">
          <h2>Gestión de planes</h2>
          <Button type="button" variant="ghost" onClick={refetch}>
            Actualizar
          </Button>
        </div>
      )}

      <section className="planes-landing-form-card">
        <h2>{editingPlan ? "Editar plan" : "Nuevo plan"}</h2>
        <form className="planes-landing-form" onSubmit={handleSubmit}>
          <div className="planes-landing-form__section">
            <h3>Identidad</h3>
            <div className="planes-landing-form__grid">
              <Input
                label="Slug (id interno)"
                name="slug"
                required
                value={form.slug}
                onChange={(event) =>
                  setForm((current) => ({ ...current, slug: event.target.value }))
                }
              />
              <Input
                label="Orden"
                name="orden"
                type="number"
                min={1}
                required
                value={form.orden}
                onChange={(event) =>
                  setForm((current) => ({ ...current, orden: event.target.value }))
                }
              />
              <Input
                label="Ruta"
                name="route"
                required
                placeholder="/mi-plan"
                value={form.route}
                onChange={(event) =>
                  setForm((current) => ({ ...current, route: event.target.value }))
                }
              />
              <label className="field planes-landing-form__checkbox">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                />
                <span>Visible en la landing</span>
              </label>
            </div>
          </div>

          <div className="planes-landing-form__section">
            <h3>Tarjeta en home</h3>
            <div className="planes-landing-form__grid">
              <Input
                label="Título corto"
                name="shortTitle"
                required
                value={form.shortTitle}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    shortTitle: event.target.value,
                  }))
                }
              />
              <Input
                label="Subtítulo"
                name="subtitle"
                required
                value={form.subtitle}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    subtitle: event.target.value,
                  }))
                }
              />
              <Input
                label="Badge"
                name="badge"
                required
                value={form.badge}
                onChange={(event) =>
                  setForm((current) => ({ ...current, badge: event.target.value }))
                }
              />
              <Input
                label="Duración"
                name="duration"
                required
                value={form.duration}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    duration: event.target.value,
                  }))
                }
              />
              <Input
                label="Formato"
                name="format"
                required
                value={form.format}
                onChange={(event) =>
                  setForm((current) => ({ ...current, format: event.target.value }))
                }
              />
              <Input
                label="Inversión"
                name="investment"
                required
                value={form.investment}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    investment: event.target.value,
                  }))
                }
              />
            </div>
            <PlanCardImagePicker
              value={form.cardImage}
              onChange={(cardImage) =>
                setForm((current) => ({ ...current, cardImage }))
              }
              disabled={isSubmitting}
            />
            <TextAreaField
              id="cardBullets"
              label="Bullets de tarjeta (uno por línea)"
              required
              rows={4}
              value={form.cardBullets}
              onChange={(value) =>
                setForm((current) => ({ ...current, cardBullets: value }))
              }
            />
          </div>

          <div className="planes-landing-form__section">
            <h3>Página de detalle</h3>
            <div className="planes-landing-form__grid">
              <Input
                label="Título completo"
                name="title"
                required
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
              />
              <Input
                label="Texto del botón CTA"
                name="ctaLabel"
                required
                value={form.ctaLabel}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    ctaLabel: event.target.value,
                  }))
                }
              />
            </div>
            <TextAreaField
              id="intro"
              label="Introducción"
              required
              rows={3}
              value={form.intro}
              onChange={(value) => setForm((current) => ({ ...current, intro: value }))}
            />
            <TextAreaField
              id="focus"
              label="¿Qué vas a trabajar?"
              required
              rows={3}
              value={form.focus}
              onChange={(value) => setForm((current) => ({ ...current, focus: value }))}
            />
            <TextAreaField
              id="methodology"
              label="Metodología (opcional)"
              rows={3}
              value={form.methodology}
              onChange={(value) =>
                setForm((current) => ({ ...current, methodology: value }))
              }
            />
          </div>

          <div className="planes-landing-form__section">
            <h3>Listas</h3>
            <TextAreaField
              id="extras"
              label="Extras incluidos (uno por línea)"
              required
              rows={4}
              value={form.extras}
              onChange={(value) => setForm((current) => ({ ...current, extras: value }))}
            />
            <TextAreaField
              id="benefits"
              label="Beneficios clave (opcional, uno por línea)"
              rows={4}
              value={form.benefits}
              onChange={(value) =>
                setForm((current) => ({ ...current, benefits: value }))
              }
            />
          </div>

          <div className="planes-landing-form__actions">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Guardando..."
                : editingPlan
                  ? "Guardar cambios"
                  : "Crear plan"}
            </Button>
            {editingPlan ? (
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancelar
              </Button>
            ) : null}
          </div>
        </form>
      </section>

      {error ? (
        <section>
          <p className="auth-error">{error}</p>
        </section>
      ) : null}

      <section className="planes-landing-list-card">
        <div className="planes-landing-list-card__header">
          <h2>Planes publicados</h2>
          <span>
            {activeCount} activos · {inactiveCount} inactivos
          </span>
        </div>

        {loading ? (
          <div aria-busy="true" aria-label="Cargando planes">
            <ListSkeleton items={4} />
          </div>
        ) : null}

        {!loading && planes.length === 0 ? (
          <p className="alumnas-panel__status">Todavía no hay planes cargados.</p>
        ) : null}

        <ul className="planes-landing-list">
          {planes.map((plan) => {
            const isProcessing = actionId === plan.id;

            return (
              <li className="planes-landing-item" key={plan.id}>
                <div className="planes-landing-item__content">
                  <div className="planes-landing-item__heading">
                    <h3>{plan.title}</h3>
                    <div className="planes-landing-item__status">
                      <span
                        className={
                          plan.isActive
                            ? "planes-landing-item__status-label planes-landing-item__status-label--active"
                            : "planes-landing-item__status-label"
                        }
                      >
                        {plan.isActive ? "Activo" : "Inactivo"}
                      </span>
                      <label className="toggle planes-landing-item__toggle">
                        <input
                          type="checkbox"
                          checked={plan.isActive}
                          disabled={loading || isProcessing}
                          onChange={() => void handleToggleActive(plan)}
                          aria-label={`${plan.isActive ? "Desactivar" : "Activar"} ${plan.title}`}
                        />
                        <span className="toggle-slider" />
                      </label>
                    </div>
                  </div>
                  <p className="planes-landing-item__meta">
                    <span>Slug: {plan.slug}</span>
                    <span>Ruta: {plan.route}</span>
                    <span>Orden: {plan.orden}</span>
                    <span>{plan.investment}</span>
                  </p>
                </div>
                <div className="planes-landing-item__actions">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleEdit(plan)}
                    disabled={isProcessing}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => void handleDelete(plan)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Eliminando..." : "Eliminar"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
