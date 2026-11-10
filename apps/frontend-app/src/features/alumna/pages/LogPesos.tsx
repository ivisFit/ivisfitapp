"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { IvisContentLoader } from "@/components/IvisContentLoader";
import { useAuth } from "@/context/AuthContext";
import { useMeProfile } from "@/features/alumna/hooks/useMeProfile";
import { useProgresoCargas } from "@/features/alumna/hooks/useProgresoCargas";
import { useProgresoCumplimiento } from "@/features/alumna/hooks/useProgresoCumplimiento";
import { useRutinaActiva } from "@/features/alumna/hooks/useRutinaActiva";
import { ProgresoCheckinsSemana } from "@/features/alumna/components/ProgresoCheckinsSemana";
import { GamificacionWidget } from "@/features/gamificacion/components/GamificacionWidget";
import { ResumenSemanalCard } from "@/features/alumna/components/ResumenSemanalCard";
import { WaitingStateActions } from "@/features/alumna/components/WaitingStateActions";
import { resolveModoPlan } from "@/lib/modo-plan";
import { alumnaRoutes } from "@/routes/paths";

const ProgresoCumplimientoChart = dynamic(
  () =>
    import("@/features/alumna/components/ProgresoCumplimientoChart").then(
      (mod) => mod.ProgresoCumplimientoChart,
    ),
  {
    ssr: false,
    loading: () => (
      <IvisContentLoader variant="section" label="Cargando cumplimiento" />
    ),
  },
);

const ProgresoCargasChart = dynamic(
  () =>
    import("@/features/alumna/components/ProgresoCargasChart").then(
      (mod) => mod.ProgresoCargasChart,
    ),
  {
    ssr: false,
    loading: () => (
      <IvisContentLoader variant="section" label="Cargando cargas" />
    ),
  },
);

export function LogPesos() {
  const { user, loading: authLoading } = useAuth();
  const { profile } = useMeProfile();
  const {
    rutina,
    rutinaSummary,
    loading: rutinaLoading,
    error: rutinaError,
    refetch: refetchRutina,
  } = useRutinaActiva(user?.id);

  const hasRutina = Boolean(rutinaSummary?.id);

  const {
    summary,
    loading: cumplimientoLoading,
    error: cumplimientoError,
    refetch: refetchCumplimiento,
  } = useProgresoCumplimiento({
    rutinaId: rutinaSummary?.id,
    rutina,
    enabled: hasRutina,
  });

  const {
    series,
    loading: cargasLoading,
    error: cargasError,
    refetch: refetchCargas,
  } = useProgresoCargas({
    rutinaId: rutinaSummary?.id,
    enabled: hasRutina,
  });

  const modoPlan = resolveModoPlan(user);
  const showTraining = modoPlan !== "alimentacion";
  const showFood = modoPlan !== "rutina";
  const circunferenciasHabilitadas = profile?.circunferenciasHabilitadas === true;
  const tienePliegues = user?.tienePliegues === true;
  const showCuerpo = tienePliegues || circunferenciasHabilitadas;
  const trainingLoading =
    showTraining &&
    (authLoading || rutinaLoading || (hasRutina && (cumplimientoLoading || cargasLoading)));
  const trainingError = rutinaError ?? cumplimientoError ?? cargasError;

  function retryTraining() {
    refetchRutina();
    refetchCumplimiento();
    refetchCargas();
  }

  const heroCopy = showTraining && showFood
    ? "Tu cuerpo, cómo venís con la comida y, cuando tengas rutina, el cumplimiento y las cargas."
    : showFood
      ? "Cómo venís con la comida y, si tu profe las habilitó, tus mediciones."
      : "Tu cuerpo y la evolución de los entrenamientos que registrás.";

  return (
    <div className="progreso-page page">
      <section className="pliegues-hero">
        <div className="pliegues-hero__copy">
          <span className="pliegues-hero__eyebrow">Tu avance</span>
          <h1>Progreso</h1>
          <p>{heroCopy}</p>
        </div>
      </section>

      {showCuerpo ? (
        <section className="progreso-cuerpo" aria-labelledby="progreso-cuerpo-title">
          <div className="progreso-cuerpo__header">
            <h2 id="progreso-cuerpo-title">Tu cuerpo</h2>
            <p>Las mediciones que tu profe habilita viven acá, junto con el resto de tu avance.</p>
          </div>
          <div className="progreso-mediciones-ctas">
            {tienePliegues ? (
              <section className="progreso-circunferencias-cta">
                <h2>Pliegues</h2>
                <p>
                  Mirá cómo evolucionó tu grasa corporal y las fotos de cada
                  control.
                </p>
                <Link href={alumnaRoutes.pliegues} className="btn btn--primary">
                  Ver tu evolución
                </Link>
              </section>
            ) : null}
            {circunferenciasHabilitadas ? (
              <section className="progreso-circunferencias-cta">
                <h2>Circunferencias</h2>
                <p>
                  Registrá tus mediciones de cuello, cintura y cadera para calcular tu
                  porcentaje de grasa corporal.
                </p>
                <Link href={alumnaRoutes.circunferencias} className="btn btn--primary">
                  Ir a Circunferencias
                </Link>
              </section>
            ) : null}
          </div>
        </section>
      ) : null}

      {showFood ? <ProgresoCheckinsSemana /> : null}

      {showTraining && hasRutina && !trainingLoading && !trainingError ? (
        <>
          <GamificacionWidget />
          <ResumenSemanalCard />
        </>
      ) : null}

      {showTraining ? (
        trainingLoading ? (
          <IvisContentLoader variant="section" label="Cargando tu progreso" />
        ) : trainingError ? (
          <div className="progreso-page__error" role="alert">
            <p>{trainingError}</p>
            <button type="button" className="btn btn--ghost" onClick={retryTraining}>
              Reintentar
            </button>
          </div>
        ) : !hasRutina ? (
          <div className="waiting-state">
            <p className="waiting-state__title">
              Tu progreso de entrenamiento aparece cuando tengas rutina
            </p>
            <p className="waiting-state__text">
              Cuando tu coach te asigne el plan, vas a ver cumplimiento y cargas
              acá.
            </p>
            <WaitingStateActions
              nombre={user?.name}
              whatsappTema="consulto por mi progreso / rutina"
            />
          </div>
        ) : (
          <div className="progreso-page__charts">
            <ProgresoCumplimientoChart summary={summary} />
            <ProgresoCargasChart series={series} />
          </div>
        )
      ) : null}
    </div>
  );
}
