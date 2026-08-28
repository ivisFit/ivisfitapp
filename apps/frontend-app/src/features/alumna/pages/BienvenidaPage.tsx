"use client";

import { ChartLine, Dumbbell, Hand, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { Button, Select } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { invalidateCache } from "@/lib/apiCache";
import { alumnaRoutes } from "@/routes/paths";
import type { UsuarioApiDoc } from "@/types/usuario";

type OnboardingApiResponse = UsuarioApiDoc;

const HORAS = Array.from({ length: 19 }, (_, i) => {
  const hora = i + 5;
  return `${String(hora).padStart(2, "0")}:00`;
});

const PASOS = ["Saludo", "Horario", "Recordatorios", "Tour"];

export function BienvenidaPage() {
  const { user, refreshProfile } = useAuth();
  const [paso, setPaso] = useState(0);
  const [horaEntrenamiento, setHoraEntrenamiento] = useState("08:00");
  const [recordatoriosEntrenamiento, setRecordatoriosEntrenamiento] =
    useState(true);
  const [recordatoriosPush, setRecordatoriosPush] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nombre = user?.name?.split(" ")[0] ?? "";

  async function finalizar() {
    setSubmitting(true);
    setError(null);
    try {
      const profile = await apiFetch<OnboardingApiResponse>("/api/me/onboarding", {
        method: "POST",
        body: JSON.stringify({
          horaEntrenamiento,
          recordatoriosEntrenamiento,
          recordatoriosPush,
        }),
      });

      invalidateCache("/api/me");
      await refreshProfile();

      const nextRoute =
        profile.tutorialesVistos === true
          ? alumnaRoutes.rutina
          : alumnaRoutes.tutoriales;

      window.location.assign(nextRoute);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No pudimos guardar tus preferencias. Probá de nuevo.",
      );
      setSubmitting(false);
    }
  }

  function siguiente() {
    setError(null);
    if (paso < PASOS.length - 1) {
      setPaso((current) => current + 1);
      return;
    }
    void finalizar();
  }

  function anterior() {
    setError(null);
    if (paso > 0) setPaso((current) => current - 1);
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <div className="onboarding-card__logo">IVIS Fit</div>

        <div className="onboarding-progress">
          {PASOS.map((_, index) => (
            <span
              key={index}
              aria-hidden
              className={`onboarding-progress__dot ${
                index <= paso ? "onboarding-progress__dot--active" : ""
              }`}
            />
          ))}
          <p className="onboarding-progress__label" aria-live="polite">
            Paso {paso + 1} de {PASOS.length}
          </p>
        </div>

        {paso === 0 ? (
          <section className="onboarding-step">
            <h1 className="onboarding-step__title">
              <span className="onboarding-step__title-row">
                ¡Hola{nombre ? `, ${nombre}` : ""}!
                <Hand className="onboarding-step__title-icon" size={28} aria-hidden />
              </span>
            </h1>
            <p className="onboarding-step__text">
              Te damos la bienvenida a tu espacio. Acá vas a encontrar tu
              rutina, tu plan de alimentación y todo el acompañamiento para
              avanzar con tu objetivo.
            </p>
            <p className="onboarding-step__text">
              Vamos a configurar un par de cosas para empezar con todo.
            </p>
            <Button type="button" onClick={siguiente}>
              Empezar
            </Button>
          </section>
        ) : null}

        {paso === 1 ? (
          <section className="onboarding-step">
            <h1 className="onboarding-step__title">¿A qué hora entrenás?</h1>
            <p className="onboarding-step__text">
              Elegí tu horario preferido de entrenamiento. Si activás el
              recordatorio por email y los avisos están activos en el servidor, te
              escribimos a esa hora cuando ya tengas rutina.
            </p>
            <Select
              label="Hora de entrenamiento"
              name="horaEntrenamiento"
              value={horaEntrenamiento}
              onChange={(event) => setHoraEntrenamiento(event.target.value)}
            >
              {HORAS.map((hora) => (
                <option key={hora} value={hora}>
                  {hora}
                </option>
              ))}
            </Select>
            <div className="onboarding-step__actions">
              <Button type="button" variant="ghost" onClick={anterior}>
                Atrás
              </Button>
              <Button type="button" onClick={siguiente}>
                Continuar
              </Button>
            </div>
          </section>
        ) : null}

        {paso === 2 ? (
          <section className="onboarding-step">
            <h1 className="onboarding-step__title">Recordatorios</h1>
            <p className="onboarding-step__text">
              Elegí cómo querés que te acompañemos.
            </p>

            <label className="onboarding-switch">
              <span className="onboarding-switch__text">
                <strong>Recordatorio por email</strong>
                <small>
                  Guardamos tu hora. Los emails se envían cuando la app tiene los
                  avisos activos (y si ya tenés rutina asignada).
                </small>
              </span>
              <input
                type="checkbox"
                className="onboarding-switch__input"
                checked={recordatoriosEntrenamiento}
                onChange={(event) =>
                  setRecordatoriosEntrenamiento(event.target.checked)
                }
              />
              <span className="onboarding-switch__track" aria-hidden>
                <span className="onboarding-switch__thumb" />
              </span>
            </label>

            <label className="onboarding-switch">
              <span className="onboarding-switch__text">
                <strong>Avisos de logros en la app</strong>
                <small>
                  Mostramos toasts y medallas cuando ganás XP o completás un
                  desafío (dentro de la app, no por push).
                </small>
              </span>
              <input
                type="checkbox"
                className="onboarding-switch__input"
                checked={recordatoriosPush}
                onChange={(event) => setRecordatoriosPush(event.target.checked)}
              />
              <span className="onboarding-switch__track" aria-hidden>
                <span className="onboarding-switch__thumb" />
              </span>
            </label>

            <div className="onboarding-step__actions">
              <Button type="button" variant="ghost" onClick={anterior}>
                Atrás
              </Button>
              <Button type="button" onClick={siguiente}>
                Continuar
              </Button>
            </div>
          </section>
        ) : null}

        {paso === 3 ? (
          <section className="onboarding-step">
            <h1 className="onboarding-step__title">Tu lugar, de un vistazo</h1>
            <div className="onboarding-tour">
              <div className="onboarding-tour__item">
                <span className="onboarding-tour__icon" aria-hidden>
                  <Dumbbell size={22} />
                </span>
                <div>
                  <strong>Rutina</strong>
                  <p>Tu entrenamiento día a día con videos y seguimiento.</p>
                </div>
              </div>
              <div className="onboarding-tour__item">
                <span className="onboarding-tour__icon" aria-hidden>
                  <UtensilsCrossed size={22} />
                </span>
                <div>
                  <strong>Alimentación</strong>
                  <p>Tu plan nutricional y el check-in diario de comidas.</p>
                </div>
              </div>
              <div className="onboarding-tour__item">
                <span className="onboarding-tour__icon" aria-hidden>
                  <ChartLine size={22} />
                </span>
                <div>
                  <strong>Progreso</strong>
                  <p>Tu evolución, logros y rachas para no perder el ritmo.</p>
                </div>
              </div>
            </div>
            {error ? (
              <p className="auth-error" role="alert">
                {error}
              </p>
            ) : null}
            <div className="onboarding-step__actions">
              <Button type="button" variant="ghost" onClick={anterior}>
                Atrás
              </Button>
              <Button
                type="button"
                onClick={() => void finalizar()}
                disabled={submitting}
              >
                {submitting ? "Guardando..." : "¡Arrancá!"}
              </Button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
