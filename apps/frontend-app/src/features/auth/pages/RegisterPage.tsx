"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RegisterStepper } from "@/features/auth/components/register/RegisterStepper";

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const planTitle = searchParams.get("planTitle");

  return <RegisterStepper planTitle={planTitle} />;
}

export function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageContent />
    </Suspense>
  );
}
