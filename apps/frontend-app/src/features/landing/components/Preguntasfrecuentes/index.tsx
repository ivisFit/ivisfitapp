"use client";

import { Box, Typography } from "@mui/material";
import { FaqAccordionList } from "./FaqAccordionList";
import { HomeText } from "@/features/landing/cms/HomeCmsFields";
import { landingColors } from "@/features/landing/styles/landing-colors";
import { LandingSectionHeader } from "@/features/landing/components/shared/LandingSectionHeader";

const faqSurfaceSx = {
  padding: "1.5rem",
  backgroundColor: landingColors.white,
  borderRadius: "var(--radius-md)",
  boxShadow: "var(--shadow-soft)",
  transition: "box-shadow 0.25s ease",
  "&:hover": { boxShadow: "0 14px 36px rgba(0,0,0,0.1)" },
} as const;

export const PreguntasFrecuentes = () => {
  return (
    <Box
      component="section"
      id="preguntas-frecuentes"
      className="landing-section landing-section--light landing-section--accent-top"
      sx={{
        minHeight: { xs: "auto", lg: "75vh" },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: { xs: "var(--landing-section-y)", lg: "calc(var(--landing-section-y) + 1rem)" },
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1, width: "100%", display: "flex", justifyContent: "center" }}>
        <LandingSectionHeader
          centered
          tone="light"
          id="faq-section"
          eyebrow={<HomeText field="faq.eyebrow" />}
          title={<HomeText field="faq.title" />}
          subtitle={<HomeText field="faq.subtitle" />}
        />
      </Box>

      <Box
        className="landing-surface-card"
        sx={{
          width: "90%",
          maxWidth: "800px",
          display: { xs: "flex", lg: "none" },
          flexDirection: "column",
          gap: "1rem",
          marginTop: "1rem",
          position: "relative",
          zIndex: 1,
          ...faqSurfaceSx,
        }}
      >
        <FaqAccordionList />
      </Box>

      <Box
        sx={{
          width: "90%",
          maxWidth: "1200px",
          display: { xs: "none", lg: "flex" },
          flexDirection: "row",
          gap: "2rem",
          margin: "2rem 0 0",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box className="landing-surface-card" sx={{ flex: 1, ...faqSurfaceSx }}>
          <FaqAccordionList start={0} end={8} />
        </Box>
        <Box className="landing-surface-card" sx={{ flex: 1, ...faqSurfaceSx }}>
          <FaqAccordionList start={8} compact />
        </Box>
      </Box>
    </Box>
  );
};
