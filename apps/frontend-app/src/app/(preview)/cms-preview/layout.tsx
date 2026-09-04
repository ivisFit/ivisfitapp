import type { ReactNode } from "react";
import { LandingShell } from "@/features/landing/LandingShell";
import { CmsPreviewEmbedGuard } from "@/features/landing/cms/CmsPreviewEmbedGuard";
import { landingFontClassName } from "@/features/landing/landing-fonts";
import "@/styles/preview-cms.css";

export default function CmsPreviewLayout({ children }: { children: ReactNode }) {
  return (
    <div className={landingFontClassName}>
      <CmsPreviewEmbedGuard>
        <LandingShell variant="preview">{children}</LandingShell>
      </CmsPreviewEmbedGuard>
    </div>
  );
}
