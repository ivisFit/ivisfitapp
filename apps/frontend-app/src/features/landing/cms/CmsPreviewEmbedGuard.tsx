"use client";

import { type ReactNode, useEffect, useState } from "react";
import { RoleGuard } from "@/routes/RoleGuard";

type CmsPreviewEmbedGuardProps = {
  children: ReactNode;
};

function getEmbeddedState(): boolean {
  return typeof window !== "undefined" && window.parent !== window;
}

export function CmsPreviewEmbedGuard({ children }: CmsPreviewEmbedGuardProps) {
  const [embedded, setEmbedded] = useState(getEmbeddedState);

  useEffect(() => {
    setEmbedded(window.parent !== window);
  }, []);

  if (embedded) {
    return <>{children}</>;
  }

  return <RoleGuard allowedRoles={["profe"]}>{children}</RoleGuard>;
}
