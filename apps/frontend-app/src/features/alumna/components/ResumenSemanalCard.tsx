"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { apiFetch } from "@/lib/api";

type Resumen = {
  _id: string;
  semanaKey: string;
  entrenosCompletados: number;
  checkinsCumplidos: number;
  checkinsParciales: number;
  checkinsNoPude: number;
  racha: number;
  enviadoAt: string;
};

export function ResumenSemanalCard() {
  const [resumen, setResumen] = useState<Resumen | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await apiFetch<Resumen[]>(
          "/api/automatizaciones/resumenes-semanales",
        );
        if (!cancelled && Array.isArray(data) && data[0]) {
          setResumen(data[0]);
        }
      } catch {
        // optional widget
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!resumen) return null;

  return (
    <section className="feature-card resumen-semanal-card">
      <p className="pliegues-hero__eyebrow">Esta semana</p>
      <h2>Resumen</h2>
      <ul className="resumen-semanal-card__stats">
        <li>
          <strong>{resumen.entrenosCompletados}</strong>
          <span>entrenos</span>
        </li>
        <li>
          <strong>{resumen.checkinsCumplidos}</strong>
          <span>check-ins OK</span>
        </li>
        <li>
          <strong>{resumen.racha}</strong>
          <span>racha</span>
        </li>
      </ul>
    </section>
  );
}

export function PrintNowButton() {
  return (
    <Button type="button" onClick={() => window.print()}>
      Imprimir / guardar PDF
    </Button>
  );
}
