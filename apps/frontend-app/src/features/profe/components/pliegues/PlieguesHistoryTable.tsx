"use client";

import { memo } from "react";
import type { Medicion } from "@/features/profe/types/medicion";
import type { MetodoCalculo } from "@/features/profe/types/medicion";
import type { Sexo } from "@/types/usuario";
import {
  formatGrasaCorporal,
  formatMedicionDate,
  sumMedicionValues,
} from "@/features/profe/utils/pliegues-period";

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
    return [
      { key: "pectoral", label: "Pectoral", source: "pliegues" },
      { key: "axilarMedia", label: "Axilar", source: "pliegues" },
      { key: "tricipital", label: "Tríceps", source: "pliegues" },
      { key: "subescapular", label: "Subesc.", source: "pliegues" },
      { key: "abdominal", label: "Abdomen", source: "pliegues" },
      { key: "suprailiaco", label: "Suprail.", source: "pliegues" },
      { key: "muslo", label: "Muslo", source: "pliegues" },
    ];
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

function getCellValue(medicion: Medicion, column: Column) {
  if (column.source === "circ") {
    return medicion.circunferencias?.[
      column.key as keyof NonNullable<Medicion["circunferencias"]>
    ];
  }
  return medicion.pliegues?.[
    column.key as keyof NonNullable<Medicion["pliegues"]>
  ];
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
                    {getCellValue(medicion, column) ?? "—"}
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
