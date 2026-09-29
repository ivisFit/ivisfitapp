"use client";

import { memo } from "react";
import type {
  Medicion,
  MetodoCalculo,
  PlieguesMedicion,
} from "@/features/profe/types/medicion";
import type { Sexo } from "@/types/usuario";
import {
  formatGrasaCorporal,
  formatMedicionDate,
  JP7_PLIEGUE_SITES,
  sumMedicionValues,
} from "@/features/profe/utils/pliegues-period";
import { normalizePlieguesJP7 } from "@/lib/jp7-pliegues";

type PlieguesHistoryTableProps = {
  mediciones: Medicion[];
  sexo: Sexo;
  metodo: MetodoCalculo;
};

type Column = { key: string; label: string; source: "pliegues" | "circ" };

function getColumns(metodo: MetodoCalculo, sexo: Sexo): Column[] {
  if (metodo === "us-navy") {
    const cols: Column[] = [
      { key: "cuelloCm", label: "Cuello", source: "circ" },
      { key: "cinturaCm", label: "Cintura", source: "circ" },
    ];
    if (sexo === "mujer") {
      cols.push({ key: "caderaCm", label: "Cadera", source: "circ" });
    }
    return cols;
  }
  if (metodo === "jp7") {
    return JP7_PLIEGUE_SITES.map((site) => ({
      key: site.key,
      label: site.label,
      source: "pliegues" as const,
    }));
  }
  if (sexo === "mujer") {
    return [
      { key: "tricipital", label: "Tríceps", source: "pliegues" },
      { key: "suprailiaco", label: "Suprail.", source: "pliegues" },
      { key: "muslo", label: "Muslo", source: "pliegues" },
    ];
  }
  return [
    { key: "pectoral", label: "Pectoral", source: "pliegues" },
    { key: "abdominal", label: "Abdomen", source: "pliegues" },
    { key: "muslo", label: "Muslo", source: "pliegues" },
  ];
}

function getCellValue(medicion: Medicion, column: Column, metodo: MetodoCalculo) {
  if (column.source === "circ") {
    return medicion.circunferencias?.[
      column.key as keyof NonNullable<Medicion["circunferencias"]>
    ];
  }
  const pliegues: PlieguesMedicion | undefined =
    metodo === "jp7" && medicion.pliegues
      ? normalizePlieguesJP7(medicion.pliegues)
      : medicion.pliegues;
  return pliegues?.[column.key as keyof PlieguesMedicion];
}

export const PlieguesHistoryTable = memo(function PlieguesHistoryTable({
  mediciones,
  sexo,
  metodo,
}: PlieguesHistoryTableProps) {
  const columns = getColumns(metodo, sexo);
  const sumUnit = metodo === "us-navy" ? "cm" : "mm";

  if (mediciones.length === 0) {
    return (
      <section className="pliegues-history-table">
        <h2>Historial</h2>
        <p className="pliegues-empty">
          No hay mediciones de este método en el período seleccionado.
        </p>
      </section>
    );
  }

  const rows = [...mediciones].sort(
    (a, b) => b.fecha.getTime() - a.fecha.getTime(),
  );

  return (
    <section className="pliegues-history-table">
      <h2>Historial</h2>
      <div className="pliegues-history-table__wrap">
        <table className="pliegues-history-table__table">
          <thead>
            <tr>
              <th scope="col">Fecha</th>
              {columns.map((column) => (
                <th key={column.key} scope="col">
                  {column.label}
                </th>
              ))}
              <th scope="col">Suma</th>
              <th scope="col">% grasa</th>
              <th scope="col">Notas</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((medicion) => (
              <tr key={medicion.id}>
                <td data-label="Fecha">{formatMedicionDate(medicion.fecha)}</td>
                {columns.map((column) => (
                  <td key={column.key} data-label={column.label}>
                    {getCellValue(medicion, column, metodo) ?? "—"}
                  </td>
                ))}
                <td data-label="Suma">
                  {sumMedicionValues(metodo, sexo, medicion).toLocaleString(
                    "es-UY",
                    {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 1,
                    },
                  )}{" "}
                  {sumUnit}
                </td>
                <td data-label="% grasa">
                  {formatGrasaCorporal(
                    medicion.metricas.porcentajeGrasaCorporal,
                  )}
                </td>
                <td data-label="Notas">{medicion.notas?.trim() || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
});
