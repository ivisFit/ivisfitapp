import { Suspense } from "react";
import { RestablecerPasswordPage } from "@/features/auth/pages/RestablecerPasswordPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RestablecerPasswordPage />
    </Suspense>
  );
}
