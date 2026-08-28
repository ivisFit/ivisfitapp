"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { apiFetch } from "@/lib/api";

type AutomatizacionesStatus = {
  enabled: boolean;
  tickMs: number;
  jobs: Array<{ id: string; label: string }>;
  latestRuns: Array<{ job: string; key: string; ranAt: string }>;
  alumnasInactivas: Array<{
    id: string;
    nombre: string;
    whatsappHref: string;
  }>;
  resumenesSemanales: Array<{
    id: string;
    alumnaNombre: string;
    semanaKey: string;
    entrenosCompletados: number;
    checkinsCumplidos: number;
    racha: number;
    enviadoAt: string;
  }>;
};

export function AutomatizacionesPage() {
  const [data, setData] = useState<AutomatizacionesStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch<AutomatizacionesStatus>(
        "/api/automatizaciones",
      );
      setData(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cargar automatizaciones",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="page automatizaciones-page">
      <div className="page__actions">
        <div>
          <h1>Automatizaciones</h1>
          <p>
            Recordatorios, insights de inactividad y resúmenes semanales. Activo
            solo si el servidor tiene SCHEDULER_ENABLED=true.
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={() => void load()}>
          Actualizar
        </Button>
      </div>

      {loading ? <p className="alumnas-panel__status">Cargando...</p> : null}
      {error ? <p className="auth-error">{error}</p> : null}

      {data ? (
        <>
          <section className="feature-card">
            <h2>Estado del scheduler</h2>
            <p>
              {data.enabled
                ? `Activo · tick cada ${Math.round(data.tickMs / 1000)}s`
                : "Deshabilitado en este entorno"}
            </p>
            <ul className="automatizaciones-jobs">
              {data.jobs.map((job) => (
                <li key={job.id}>
                  <strong>{job.label}</strong>
                  <span>{job.id}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="feature-card">
            <h2>Últimas corridas</h2>
            {data.latestRuns.length === 0 ? (
              <p className="alumnas-panel__status">Todavía no hay corridas registradas.</p>
            ) : (
              <ul className="automatizaciones-runs">
                {data.latestRuns.map((run) => (
                  <li key={`${run.job}-${run.key}`}>
                    <strong>{run.job}</strong>
                    <span>{run.key}</span>
                    <time dateTime={String(run.ranAt)}>
                      {new Date(run.ranAt).toLocaleString("es-UY")}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="feature-card">
            <h2>Alumnas inactivas (7+ días)</h2>
            {data.alumnasInactivas.length === 0 ? (
              <p className="alumnas-panel__status">Ninguna por ahora.</p>
            ) : (
              <ul className="automatizaciones-inactive">
                {data.alumnasInactivas.map((alumna) => (
                  <li key={alumna.id}>
                    <span>{alumna.nombre}</span>
                    <a
                      className="btn btn--ghost"
                      href={alumna.whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="feature-card">
            <h2>Resúmenes semanales recientes</h2>
            {data.resumenesSemanales.length === 0 ? (
              <p className="alumnas-panel__status">Todavía no hay resúmenes.</p>
            ) : (
              <ul className="automatizaciones-runs">
                {data.resumenesSemanales.map((item) => (
                  <li key={item.id}>
                    <strong>{item.alumnaNombre}</strong>
                    <span>
                      {item.entrenosCompletados} entrenos · racha {item.racha}
                    </span>
                    <time dateTime={String(item.enviadoAt)}>
                      {new Date(item.enviadoAt).toLocaleString("es-UY")}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
