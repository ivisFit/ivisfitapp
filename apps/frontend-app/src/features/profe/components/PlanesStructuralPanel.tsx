"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button, Input } from "@/components";
import { ListSkeleton } from "@/components/skeletons/AppSkeleton";
import {
  type LandingPlanGestion,
  type LandingPlanPayload,
  useLandingPlanesGestion,
} from "@/features/profe/hooks/useLandingPlanesGestion";
import { buildPreviewRoutesFromSlugs } from "@/config/cms.config.shared";

function getDefaultCreatePayload(
  slug: string,
  route: string,
  orden: number,
): LandingPlanPayload {
  return {
    slug,
    orden,
    route,
    title: "Nuevo plan",
    shortTitle: "Nuevo plan",
    subtitle: "Descripción breve del plan",
    duration: "4 semanas",
    format: "Digital",
    investment: "$0",
    badge: "NUEVO",
    cardBullets: ["Beneficio principal del plan"],
    intro: "Introducción del plan. Editá el contenido en la vista previa.",
    focus: "Enfoque del plan",
    extras: ["Extra incluido"],
    ctaLabel: "Consultar",
    isActive: false,
  };
}

type PlanesStructuralPanelProps = {
  onStructureChange?: () => void;
};

export function PlanesStructuralPanel({ onStructureChange }: PlanesStructuralPanelProps) {
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

  const [slug, setSlug] = useState("");
  const [route, setRoute] = useState("");
  const [orden, setOrden] = useState("1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSlug, setEditSlug] = useState("");
  const [editRoute, setEditRoute] = useState("");
  const [editOrden, setEditOrden] = useState("1");

  const activeCount = planes.filter((plan) => plan.isActive).length;
  const inactiveCount = planes.length - activeCount;

  async function notifyChange() {
    onStructureChange?.();
    await refetch();
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanSlug = slug.trim();
    const cleanRoute = route.trim().startsWith("/")
      ? route.trim()
      : `/${route.trim()}`;
    const payload = getDefaultCreatePayload(
      cleanSlug,
      cleanRoute,
      Number.parseInt(orden, 10),
    );

    const success = await createPlan(payload);
    if (success) {
      setSlug("");
      setRoute("");
      setOrden(String(planes.length + 1));
      await notifyChange();
    }
  }

  function startEdit(plan: LandingPlanGestion) {
    setEditingId(plan.id);
    setEditSlug(plan.slug);
    setEditRoute(plan.route);
    setEditOrden(String(plan.orden));
  }

  async function handleStructuralSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) return;

    const plan = planes.find((item) => item.id === editingId);
    if (!plan) return;

    const payload: LandingPlanPayload = {
      slug: editSlug.trim(),
      orden: Number.parseInt(editOrden, 10),
      route: editRoute.trim(),
      title: plan.title,
      shortTitle: plan.shortTitle,
      subtitle: plan.subtitle,
      duration: plan.duration,
      format: plan.format,
      investment: plan.investment,
      badge: plan.badge,
      cardBullets: plan.cardBullets,
      intro: plan.intro,
      focus: plan.focus,
      extras: plan.extras,
      ctaLabel: plan.ctaLabel,
      isActive: plan.isActive,
      ...(plan.methodology ? { methodology: plan.methodology } : {}),
      ...(plan.cardImage ? { cardImage: plan.cardImage } : {}),
      ...(plan.benefits.length > 0 ? { benefits: plan.benefits } : {}),
    };

    const success = await updatePlan(editingId, payload);
    if (success) {
      setEditingId(null);
      await notifyChange();
    }
  }

  async function handleDelete(plan: LandingPlanGestion) {
    const confirmed = window.confirm(
      `¿Eliminar "${plan.title}"? Desaparecerá de la landing pública.`,
    );
    if (!confirmed) return;

    const success = await deletePlan(plan.id);
    if (success) {
      if (editingId === plan.id) setEditingId(null);
      await notifyChange();
    }
  }

  async function handleToggleActive(plan: LandingPlanGestion) {
    const success = await togglePlanActive(plan.id, !plan.isActive);
    if (success) {
      await notifyChange();
    }
  }

  return (
    <aside className="planes-landing-structural">
      <div className="planes-landing-structural__header">
        <h2>Estructura</h2>
        <span>
          {activeCount} activos · {inactiveCount} inactivos
        </span>
      </div>

      <form className="planes-landing-structural__form" onSubmit={handleCreate}>
        <h3>Crear plan</h3>
        <Input
          id="new-slug"
          label="Slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          required
        />
        <Input
          id="new-route"
          label="Ruta"
          value={route}
          onChange={(event) => setRoute(event.target.value)}
          placeholder="/mi-plan"
          required
        />
        <Input
          id="new-orden"
          label="Orden"
          type="number"
          min={1}
          value={orden}
          onChange={(event) => setOrden(event.target.value)}
          required
        />
        <Button type="submit" disabled={actionId === "create"}>
          {actionId === "create" ? "Creando..." : "Crear plan"}
        </Button>
      </form>

      {editingId ? (
        <form className="planes-landing-structural__form" onSubmit={handleStructuralSave}>
          <h3>Editar estructura</h3>
          <Input
            id="edit-slug"
            label="Slug"
            value={editSlug}
            onChange={(event) => setEditSlug(event.target.value)}
            required
          />
          <Input
            id="edit-route"
            label="Ruta"
            value={editRoute}
            onChange={(event) => setEditRoute(event.target.value)}
            required
          />
          <Input
            id="edit-orden"
            label="Orden"
            type="number"
            min={1}
            value={editOrden}
            onChange={(event) => setEditOrden(event.target.value)}
            required
          />
          <div className="planes-landing-structural__actions">
            <Button type="submit" disabled={actionId === editingId}>
              Guardar estructura
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : null}

      {error ? <p className="auth-error">{error}</p> : null}

      {loading ? (
        <div aria-busy="true" aria-label="Cargando planes">
          <ListSkeleton items={4} />
        </div>
      ) : null}

      <ul className="planes-landing-list">
        {planes.map((plan) => {
          const isProcessing = actionId === plan.id;
          return (
            <li className="planes-landing-item" key={plan.id}>
              <div className="planes-landing-item__content">
                <div className="planes-landing-item__heading">
                  <h3>{plan.shortTitle}</h3>
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
                  </div>
                </div>
                <p className="planes-landing-item__meta">
                  {plan.slug} · {plan.route} · orden {plan.orden}
                </p>
              </div>
              <div className="planes-landing-item__actions">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isProcessing}
                  onClick={() => startEdit(plan)}
                >
                  Estructura
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isProcessing}
                  onClick={() => void handleToggleActive(plan)}
                >
                  {plan.isActive ? "Desactivar" : "Activar"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isProcessing}
                  onClick={() => void handleDelete(plan)}
                >
                  Eliminar
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export function usePlanesPreviewRoutes(planes: LandingPlanGestion[]) {
  return useMemo(
    () =>
      buildPreviewRoutesFromSlugs(
        planes.map((plan) => ({
          slug: plan.slug,
          shortTitle: plan.shortTitle,
          route: plan.route,
        })),
      ),
    [planes],
  );
}
