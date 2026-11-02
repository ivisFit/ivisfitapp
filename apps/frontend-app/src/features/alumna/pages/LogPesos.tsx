"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { IvisContentLoader } from "@/components/IvisContentLoader";
import { useAuth } from "@/context/AuthContext";
import { useMeProfile } from "@/features/alumna/hooks/useMeProfile";
import { useProgresoCargas } from "@/features/alumna/hooks/useProgresoCargas";
import { useProgresoCumplimiento } from "@/features/alumna/hooks/useProgresoCumplimiento";
import { useRutinaActiva } from "@/features/alumna/hooks/useRutinaActiva";
import { GamificacionWidget } from "@/features/gamificacion/components/GamificacionWidget";
import { ResumenSemanalCard } from "@/features/alumna/components/ResumenSemanalCard";
import { WaitingStateActions } from "@/features/alumna/components/WaitingStateActions";
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
  } = useRutinaActiva(user?.id);

  const hasRutina = Boolean(rutinaSummary?.id);

  const {
    summary,
    loading: cumplimientoLoading,
    error: cumplimientoError,
  } = useProgresoCumplimiento({
    rutinaId: rutinaSummary?.id,
    rutina,
    enabled: hasRutina,
  });

  const {
    series,
    loading: cargasLoading,
    error: cargasError,
  } = useProgresoCargas({
    rutinaId: rutinaSummary?.id,
    enabled: hasRutina,
  });

  const circunferenciasHabilitadas = profile?.circunferenciasHabilitadas === true;
  const tienePliegues = user?.tienePliegues === true;
  const loading =
    authLoading || rutinaLoading || (hasRutina && (cumplimientoLoading || cargasLoading));
  const error = rutinaError ?? cumplimientoError ?? cargasError;

  return (
    <div className="progreso-page page">
      <section className="pliegues-hero">
        <div className="pliegues-hero__copy">
          <span className="pliegues-hero__eyebrow">Tu avance</span>
          <h1>Progreso</h1>
          <p>
            Seguí tu cumplimiento diario y la evolución de las cargas que
            registrás en tu rutina.
          </p>
        </div>
      </section>

      <GamificacionWidget />
      <ResumenSemanalCard />

      {loading ? (
        <IvisContentLoader variant="section" label="Cargando tu progreso" />
      ) : error ? (
        <p className="auth-error">{error}</p>
      ) : !hasRutina ? (
        <div className="waiting-state">
          <p className="waiting-state__title">
            Tu progreso aparece cuando tengas rutina
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
      )}

      {tienePliegues || circunferenciasHabilitadas ? (
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
      ) : null}
    </div>
  );
}
