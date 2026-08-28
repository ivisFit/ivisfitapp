"use client";

import type { Medicion } from "@/features/profe/types/medicion";
import type { MetodoCalculo } from "@/features/profe/types/medicion";
import type { Sexo } from "@/types/usuario";
import {
  formatGrasaCorporal,
  formatMedicionDate,
  formatMetodoCalculoLabel,
  sumMedicionValues,
} from "@/features/profe/utils/pliegues-period";

type PlieguesSummaryCardsProps = {
  mediciones: Medicion[];
  sexo: Sexo;
  metodo: MetodoCalculo;
};

function getSumLabel(metodo: MetodoCalculo) {
  if (metodo === "us-navy") return "Suma perímetros";
  if (metodo === "jp7") return "Suma pliegues (7)";
  return "Suma pliegues (3)";
}

function getSumUnit(metodo: MetodoCalculo) {
  return metodo === "us-navy" ? "cm" : "mm";
}

export function PlieguesSummaryCards({
  mediciones,
  sexo,
  metodo,
}: PlieguesSummaryCardsProps) {
  const sumLabel = getSumLabel(metodo);
  const sumUnit = getSumUnit(metodo);

  if (mediciones.length === 0) {
    return (
      <div className="pliegues-summary">
        <article className="pliegues-summary__card">
          <span className="pliegues-summary__label">Mediciones</span>
          <strong className="pliegues-summary__value">0</strong>
        </article>
        <article className="pliegues-summary__card">
          <span className="pliegues-summary__label">Última fecha</span>
          <strong className="pliegues-summary__value">—</strong>
        </article>
        <article className="pliegues-summary__card">
          <span className="pliegues-summary__label">{sumLabel}</span>
          <strong className="pliegues-summary__value">—</strong>
        </article>
        <article className="pliegues-summary__card">
          <span className="pliegues-summary__label">Grasa corporal</span>
          <strong className="pliegues-summary__value">—</strong>
        </article>
      </div>
    );
  }

  const latest = mediciones[mediciones.length - 1];
  const latestSum = sumMedicionValues(metodo, sexo, latest);

  return (
    <div className="pliegues-summary">
      <article className="pliegues-summary__card">
        <span className="pliegues-summary__label">Mediciones</span>
        <strong className="pliegues-summary__value">
          {mediciones.length} · {formatMetodoCalculoLabel(metodo)}
        </strong>
      </article>
      <article className="pliegues-summary__card">
        <span className="pliegues-summary__label">Última fecha</span>
        <strong className="pliegues-summary__value">
          {formatMedicionDate(latest.fecha)}
        </strong>
      </article>
      <article className="pliegues-summary__card">
        <span className="pliegues-summary__label">{sumLabel}</span>
        <strong className="pliegues-summary__value">
          {latestSum.toLocaleString("es-UY", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 1,
          })}{" "}
          {sumUnit}
        </strong>
      </article>
      <article className="pliegues-summary__card">
        <span className="pliegues-summary__label">Grasa corporal</span>
        <strong className="pliegues-summary__value">
          {formatGrasaCorporal(latest.metricas.porcentajeGrasaCorporal)}
        </strong>
      </article>
    </div>
  );
}
