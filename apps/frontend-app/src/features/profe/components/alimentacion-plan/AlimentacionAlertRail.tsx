"use client";

import { useEffect, useState } from "react";
import { Ban, CircleCheck, ShieldAlert, TriangleAlert } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { EvaluacionNutricionalApiDoc } from "@/features/alumna/types/evaluacion-nutricional";
import {
  getEvaluacionAlertas,
  getObjetivoLabel,
} from "@/features/profe/lib/nutricion-labels";

function meaningful(values?: string[]) {
  return (values ?? []).filter(
    (value) => value.trim() && !/^(ninguna|ninguno)$/i.test(value.trim()),
  );
}

export function AlimentacionAlertRail({ alumnaId }: { alumnaId: string }) {
  const [evaluacion, setEvaluacion] = useState<EvaluacionNutricionalApiDoc | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();
    void apiFetch<EvaluacionNutricionalApiDoc[]>(
      `/api/evaluacion-nutricional?alumnaId=${encodeURIComponent(alumnaId)}`,
      { signal: controller.signal },
    )
      .then((items) => setEvaluacion(items[0] ?? null))
      .catch(() => setEvaluacion(null));
    return () => controller.abort();
  }, [alumnaId]);

  if (!evaluacion) return null;

  const alergias = meaningful(evaluacion.alergias);
  const evitados = meaningful(evaluacion.alimentosEvitados);
  const avisos = getEvaluacionAlertas(evaluacion).filter(
    (alerta) => !alerta.startsWith("Alergias:"),
  );
  const sinAlertas =
    alergias.length === 0 && evitados.length === 0 && avisos.length === 0;

  return (
    <aside className="alimentacion-alert-rail" aria-label="Contexto de la alumna">
      <header className="alimentacion-alert-rail__header">
        <span className="alimentacion-alert-rail__header-icon" aria-hidden="true">
          <ShieldAlert size={18} />
        </span>
        <div>
          <h2 className="alimentacion-alert-rail__title">Contexto de la alumna</h2>
          <p className="alimentacion-alert-rail__subtitle">Tenelo presente al armar</p>
        </div>
      </header>

      <dl className="alimentacion-alert-rail__facts">
        <div>
          <dt>Objetivo</dt>
          <dd>{getObjetivoLabel(evaluacion)}</dd>
        </div>
        <div>
          <dt>Comidas por día</dt>
          <dd>{evaluacion.cantidadComidas}</dd>
        </div>
        <div>
          <dt>Tiempo de cocina</dt>
          <dd>{evaluacion.tiempoCocinaMinutos} min</dd>
        </div>
      </dl>

      {sinAlertas ? (
        <p className="alimentacion-alert-rail__clear">
          <CircleCheck size={16} aria-hidden="true" />
          Sin alergias ni restricciones registradas.
        </p>
      ) : null}

      {alergias.length > 0 ? (
        <section className="alimentacion-alert-rail__group alimentacion-alert-rail__group--danger">
          <h3>
            <TriangleAlert size={14} aria-hidden="true" />
            Alergias
          </h3>
          <ul className="alimentacion-alert-rail__chips">
            {alergias.map((label) => (
              <li
                key={label}
                className="alimentacion-alert-rail__chip alimentacion-alert-rail__chip--alergia"
              >
                {label}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {avisos.length > 0 ? (
        <section className="alimentacion-alert-rail__group alimentacion-alert-rail__group--warning">
          <h3>
            <ShieldAlert size={14} aria-hidden="true" />
            A tener en cuenta
          </h3>
          <ul className="alimentacion-alert-rail__alertas">
            {avisos.map((aviso) => (
              <li key={aviso}>{aviso}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {evitados.length > 0 ? (
        <section className="alimentacion-alert-rail__group">
          <h3>
            <Ban size={14} aria-hidden="true" />
            Alimentos a evitar
          </h3>
          <ul className="alimentacion-alert-rail__chips">
            {evitados.map((label) => (
              <li
                key={label}
                className="alimentacion-alert-rail__chip alimentacion-alert-rail__chip--evitado"
              >
                {label}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}
