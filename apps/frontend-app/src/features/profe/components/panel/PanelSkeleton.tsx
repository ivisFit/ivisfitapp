"use client";

import { memo } from "react";
import { IvisContentLoader } from "@/components/IvisContentLoader";

export const PanelSkeleton = memo(function PanelSkeleton() {
  return <IvisContentLoader variant="section" label="Cargando panel" />;
});
