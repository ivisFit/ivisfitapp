import type { ReactNode } from "react";
import { LandingShell } from "@/features/landing/LandingShell";
import { LandingCmsWrapper } from "@/features/landing/cms/LandingCmsWrapper";
import { landingFontClassName } from "@/features/landing/landing-fonts";
import { fetchLandingPlans } from "@/features/landing/lib/fetch-landing-plans";
import { getSiteContentOverrides } from "@/lib/preview-cms/lib/site-content-public";

export const revalidate = 300;

export const metadata = {
  title: "IVIS Fit | Entrenamiento y nutrición personalizada",
  description:
    "Transformá tu cuerpo con planes de entrenamiento y nutrición personalizados. Online, presencial y programas específicos.",
};

export default async function LandingLayout({ children }: { children: ReactNode }) {
  const [overrides, plans] = await Promise.all([
    getSiteContentOverrides(),
    fetchLandingPlans(),
  ]);

  return (
    <div className={landingFontClassName}>
      <LandingShell>
        <LandingCmsWrapper plans={plans} overrides={overrides.es?.data ?? {}}>
          {children}
        </LandingCmsWrapper>
      </LandingShell>
    </div>
  );
}
