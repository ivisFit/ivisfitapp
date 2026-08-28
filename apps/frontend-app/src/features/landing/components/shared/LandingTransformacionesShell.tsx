"use client";

import { Box } from "@mui/material";
import { HomeText } from "@/features/landing/cms/HomeCmsFields";
import { LandingSectionHeader } from "@/features/landing/components/shared/LandingSectionHeader";
import { landingSectionPaddingSx } from "@/features/landing/styles/landing-section";
import type { ReactNode } from "react";

export function LandingTransformacionesHeader() {
  return (
    <LandingSectionHeader
      centered
      tone="dark"
      sx={{ mb: { xs: 3, md: 4 }, mt: { xs: 2, md: 4 } }}
      eyebrow={<HomeText field="transformaciones.eyebrow" />}
      title={<HomeText field="transformaciones.title" />}
    />
  );
}

export function LandingTransformacionesShell({
  children,
  display,
}: {
  children: ReactNode;
  display: Record<string, string>;
}) {
  return (
    <Box
      component="section"
      className="landing-section landing-section--dark"
      sx={{
        display,
        flexDirection: "column",
        alignItems: "center",
        ...landingSectionPaddingSx,
      }}
    >
      <LandingTransformacionesHeader />
      {children}
    </Box>
  );
}
