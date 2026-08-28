import { Suspense } from "react";
import { WebAdminView } from "@/features/profe/components/WebAdminView";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <WebAdminView />
    </Suspense>
  );
}
