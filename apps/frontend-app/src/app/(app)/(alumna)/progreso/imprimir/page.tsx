"use client";

import { PrintNowButton } from "@/features/alumna/components/ResumenSemanalCard";
import { LogPesos } from "@/features/alumna/pages/LogPesos";

export default function Page() {
  return (
    <div className="print-progreso-page">
      <div className="print-progreso-page__toolbar no-print">
        <PrintNowButton />
      </div>
      <LogPesos />
    </div>
  );
}
