import "./landing-loader.css";

type LandingLoaderProps = {
  exiting?: boolean;
};

export function LandingLoader({ exiting = false }: LandingLoaderProps) {
  return (
    <div
      role="status"
      aria-busy={!exiting}
      aria-label="Cargando página"
      className={`ivis-landing-loader${exiting ? " ivis-landing-loader--exiting" : ""}`}
    >
      <div className="ivis-landing-loader__spinner-wrap">
        <div className="ivis-landing-loader__spinner" />
      </div>
    </div>
  );
}
