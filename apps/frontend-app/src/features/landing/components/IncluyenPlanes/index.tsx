"use client";

import { Box } from "@mui/material"
import TrainingSelect from "../Select"
import { ButtonArrow } from "../Buttons/ButtonArrow"
import type { Plan } from "../../data/plans"
import { HomeImg, HomeText } from "@/features/landing/cms/HomeCmsFields";
import { LandingSectionHeader } from "../shared/LandingSectionHeader";
import { landingDarkSectionSx } from "@/features/landing/styles/landing-section";

const defaultDesktopImage = "/imgs/IncluyenPlanes.jpg";
const defaultMobileImage = "/imgs/pesas.jpg";

type IncluyenPlanesProps = {
  plans: Plan[];
};

function SectionIntro({ centered = false }: { centered?: boolean }) {
  return (
    <LandingSectionHeader
      centered={centered}
      tone="dark"
      eyebrow={<HomeText field="incluyenPlanes.eyebrow" />}
      title={<HomeText field="incluyenPlanes.title" />}
      highlight={<HomeText field="incluyenPlanes.highlight" />}
      subtitle={<HomeText field="incluyenPlanes.subtitle" multiline />}
    />
  );
}

export const IncluyenPlanes = ({ plans }: IncluyenPlanesProps) => {
  return (
    <Box component="section">
      <Box
        sx={{
          ...landingDarkSectionSx,
          display: { xs: "none", smmd: "flex" },
          alignItems: "stretch",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            width: "55%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "var(--landing-section-y) clamp(2.5rem, 5vw, 5rem)",
            boxSizing: "border-box",
          }}
        >
          <SectionIntro />
          <Box sx={{ mt: "2rem" }}>
            <TrainingSelect plans={plans} />
          </Box>
          <Box sx={{ mt: "1.5rem" }}>
            <a href="#planes-section" className="landing-cta-link" aria-label="Ver planes de entrenamiento">
              <ButtonArrow text="Ver planes" />
            </a>
          </Box>
        </Box>

        <Box
          sx={{
            width: "45%",
            position: "relative",
            boxSizing: "border-box",
            minHeight: "100%",
            overflow: "hidden",
            "& img": { objectFit: "cover", objectPosition: "center top" },
          }}
        >
          <HomeImg
            field="incluyenPlanes.imageDesktop"
            fallback={defaultDesktopImage}
            alt="Entrenamiento Ivis Fit"
            fill
            sizes="45vw"
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgb(9 7 8 / 85%) 0%, rgb(9 7 8 / 25%) 35%, rgb(9 7 8 / 10%) 100%)",
              pointerEvents: "none",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: "1.5rem",
              border: "1px solid rgb(253 201 21 / 45%)",
              borderRadius: "var(--radius-sm)",
              pointerEvents: "none",
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          ...landingDarkSectionSx,
          display: { xs: "flex", smmd: "none" },
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box sx={{ width: "100%", height: "42vh", position: "relative", boxSizing: "border-box", "& img": { objectFit: "cover", objectPosition: "center top" } }}>
          <HomeImg
            field="incluyenPlanes.imageMobile"
            fallback={defaultMobileImage}
            alt="Entrenamiento Ivis Fit"
            fill
            sizes="100vw"
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgb(9 7 8 / 25%) 0%, rgb(9 7 8 / 85%) 100%)",
              pointerEvents: "none",
            }}
          />
        </Box>

        <Box sx={{ width: "100%", padding: "2.5rem 1.5rem", boxSizing: "border-box" }}>
          <SectionIntro centered />
          <Box sx={{ mt: "1.5rem" }}>
            <TrainingSelect plans={plans} />
          </Box>
          <Box sx={{ mt: "1.5rem", display: "flex", justifyContent: "center" }}>
            <a href="#planes-section" className="landing-cta-link" aria-label="Ver planes de entrenamiento">
              <ButtonArrow text="Ver planes" />
            </a>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
