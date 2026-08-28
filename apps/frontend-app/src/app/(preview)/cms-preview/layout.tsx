import type { ReactNode } from "react";
import { LandingShell } from "@/features/landing/LandingShell";
import { CmsPreviewEmbedGuard } from "@/features/landing/cms/CmsPreviewEmbedGuard";
import "@/styles/preview-cms.css";

export default function CmsPreviewLayout({ children }: { children: ReactNode }) {
  return (
    <CmsPreviewEmbedGuard>
      <LandingShell variant="preview">{children}</LandingShell>
    </CmsPreviewEmbedGuard>
  );
}
