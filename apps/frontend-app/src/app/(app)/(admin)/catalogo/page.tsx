import { Suspense } from "react";
import { CatalogoView } from "@/features/profe/components/CatalogoView";
import { ListSkeleton } from "@/components/skeletons/AppSkeleton";

function CatalogoFallback() {
  return (
    <div className="page catalogo-page" aria-busy="true" aria-label="Cargando catálogo">
      <div className="profe-tabbed-content">
        <div className="profe-chrome-tabs" aria-hidden>
          <span className="profe-chrome-tabs__tab is-active">
            <span className="profe-chrome-tabs__label">Ejercicios</span>
          </span>
          <span className="profe-chrome-tabs__tab">
            <span className="profe-chrome-tabs__label">Alimentos</span>
          </span>
          <span className="profe-chrome-tabs__tab">
            <span className="profe-chrome-tabs__label">Tutoriales</span>
          </span>
        </div>
        <div className="profe-tabbed-content__panel profe-embedded-page">
          <ListSkeleton items={5} />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<CatalogoFallback />}>
      <CatalogoView />
    </Suspense>
  );
}
