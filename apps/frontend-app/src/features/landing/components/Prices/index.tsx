"use client";

import { Box } from "@mui/material";
import { SectionText } from "@/features/landing/cms/PlanCmsFields";
import { useLandingContent } from "@/features/landing/cms/LandingContentProvider";
import { landingColors } from "@/features/landing/styles/landing-colors";
import { LandingSectionHeader } from "@/features/landing/components/shared/LandingSectionHeader";
import { PlanPriceCard } from "./PlanPriceCard";

const DEFAULT_CARD_IMAGE = "/imgs/imagenback1.jpg";

export const Prices = () => {
  const { plans } = useLandingContent();

  return (
    <Box component="section" sx={{ width: "100%", backgroundColor: landingColors.white }} id="planes">
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          color: landingColors.gold,
          fontWeight: "bold",
          letterSpacing: "0.1rem",
          paddingTop: { xs: "3rem", md: "var(--landing-section-y)" },
        }}
      >
        <Box
          sx={{
            minHeight: { xs: "30vh", lg: "auto" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "0.6rem",
            px: 2,
            width: "100%",
          }}
          id="planes-section"
        >
          <LandingSectionHeader
            centered
            tone="light"
            eyebrow={<SectionText field="eyebrow" />}
            title={<SectionText field="title" />}
            subtitle={<SectionText field="subtitle" multiline />}
            sx={{ mb: 0 }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          width: "100%",
          display: { xs: "none", lg: "grid" },
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
          alignItems: "stretch",
          padding: "0 clamp(1.5rem, 4vw, 3rem)",
          margin: "3rem auto",
          maxWidth: "var(--landing-max-w)",
          boxSizing: "border-box",
          justifyItems: "stretch",
        }}
      >
        {plans.map((plan) => (
          <PlanPriceCard
            key={plan.id}
            variant="desktop"
            slug={plan.id}
            link={plan.route}
            cardBullets={plan.cardBullets}
            fallbackImage={plan.cardImage ?? DEFAULT_CARD_IMAGE}
            isActive={plan.isActive ?? true}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: { xs: "flex", lg: "none" },
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "28px",
          boxSizing: "border-box",
          padding: "0 1.25rem",
          margin: "2rem 0 4rem",
        }}
      >
        {plans.map((plan) => (
          <PlanPriceCard
            key={plan.id}
            variant="mobile"
            slug={plan.id}
            link={plan.route}
            cardBullets={plan.cardBullets}
            fallbackImage={plan.cardImage ?? DEFAULT_CARD_IMAGE}
            isActive={plan.isActive ?? true}
          />
        ))}
      </Box>
    </Box>
  );
};
