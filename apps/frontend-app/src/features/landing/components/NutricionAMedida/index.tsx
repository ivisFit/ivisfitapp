"use client";

import { Box, Typography, keyframes } from "@mui/material";
import { ButtonArrow } from "../Buttons/ButtonArrow";
import { HomeText } from "@/features/landing/cms/HomeCmsFields";
import { LandingSectionHeader } from "@/features/landing/components/shared/LandingSectionHeader";

const rotate = keyframes`
from { transform: rotate(0deg); }
to { transform: rotate(360deg); }
`;

type NutritionType = "Vegana" | "Gluten Free" | "Proteica" | "Vegetariana" | "Low Carb" | "Antiinflamatoria";

interface CircleProps {
  text: NutritionType;
}

const Circle = ({ text }: CircleProps) => {
  return (
    <Box
      sx={{
        width: { xs: 130, sm: 140, md: 150, lg: 160 },
        height: { xs: 130, sm: 140, md: 150, lg: 160 },
        borderRadius: "50%",
        background: "linear-gradient(160deg, #fff 0%, var(--brand-paper) 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(225, 170, 67, 0.5)",
        boxShadow: "0 14px 30px rgba(180, 140, 40, 0.12)",
        transition: "transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease",
        position: "relative",
        overflow: "hidden",
        "&:before": {
          content: '""',
          position: "absolute",
          width: "78%",
          height: "78%",
          borderRadius: "50%",
          border: "1px dashed rgba(225, 170, 67, 0.45)",
          opacity: 0.7,
          animation: `${rotate} 22s linear infinite`,
        },
        "&:hover": {
          transform: "translateY(-6px)",
          borderColor: "rgba(225, 170, 67, 0.9)",
          boxShadow: "0 20px 40px rgba(180, 140, 40, 0.2), 0 0 28px rgba(253,201,21,0.25)",
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 2, textAlign: "center", padding: "10px" }}>
        <Typography
          sx={{
            color: "var(--brand-dark)",
            fontWeight: 700,
            fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem", lg: "1.05rem" },
            lineHeight: 1.2,
            letterSpacing: "0.02rem",
          }}
        >
          {text}
        </Typography>
      </Box>
    </Box>
  );
};

export const NutricionAMedida = () => {
  const nutritionTypes: NutritionType[] = [
    "Vegana",
    "Gluten Free",
    "Proteica",
    "Vegetariana",
    "Low Carb",
    "Antiinflamatoria",
  ];

  return (
    <Box
      component="section"
      className="landing-section landing-section--light"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: "var(--landing-section-y)", md: "calc(var(--landing-section-y) + 1.5rem)" },
        px: { xs: 2, md: "clamp(2.5rem, 6vw, 6rem)" },
        overflow: "hidden",
        position: "relative",
        "&:before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 12%, rgb(225 170 67 / 14%) 0%, transparent 55%)",
          zIndex: 0,
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "48rem" }}>
        <LandingSectionHeader
          centered
          tone="light"
          eyebrow={<HomeText field="nutricion.eyebrow" />}
          title={<HomeText field="nutricion.title" />}
          subtitle={<HomeText field="nutricion.body" multiline />}
          sx={{ mb: { xs: 3, md: 4 } }}
        />
      </Box>

      {/* Grid de tipos de nutrición */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(6, 1fr)",
          },
          gap: { xs: 3, sm: 4, md: 4, lg: 4 },
          justifyItems: "center",
          alignItems: "center",
          maxWidth: { xs: "350px", sm: "600px", md: "800px", lg: "1100px" },
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
          width: "100%",
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {nutritionTypes.map((type) => (
          <Circle key={type} text={type} />
        ))}
      </Box>

      {/* CTA */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          marginTop: { xs: "2rem", md: "2.5rem" },
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <a href="#planes-section" className="landing-cta-link" aria-label="Quiero empezar con un plan">
          <ButtonArrow text="Quiero Empezar" />
        </a>
      </Box>
    </Box>
  );
};
