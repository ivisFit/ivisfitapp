import { Suspense } from "react";
import { CatalogoView } from "@/features/profe/components/CatalogoView";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CatalogoView />
    </Suspense>
  );
}
