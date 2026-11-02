import { Suspense } from "react";
import { CatalogoView } from "@/features/profe/components/CatalogoView";
import { IvisContentLoader } from "@/components/IvisContentLoader";

function CatalogoFallback() {
  return <IvisContentLoader label="Cargando catálogo" />;
}

export default function Page() {
  return (
    <Suspense fallback={<CatalogoFallback />}>
      <CatalogoView />
    </Suspense>
  );
}
