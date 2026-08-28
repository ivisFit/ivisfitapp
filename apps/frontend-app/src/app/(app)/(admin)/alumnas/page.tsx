import { Suspense } from "react";
import { GestorAlumnas } from "@/features/profe/pages/GestorAlumnas";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GestorAlumnas />
    </Suspense>
  );
}
