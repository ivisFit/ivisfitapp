"use client";

import { Box, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";

type LandingSectionHeaderProps = {
  eyebrow: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  highlight?: ReactNode;
  centered?: boolean;
  tone?: "light" | "dark" | "contact";
  id?: string;
  sx?: SxProps<Theme>;
};

export function LandingSectionHeader({
  eyebrow,
  title,
  subtitle,
  highlight,
  centered = false,
  tone = "light",
  id,
  sx,
}: LandingSectionHeaderProps) {
  const isDark = tone === "dark";
  const isContact = tone === "contact";
  const align = centered ? "center" : "flex-start";
  const textAlign = centered ? "center" : "left";

  return (
    <Box
      id={id}
      className={`landing-section-header${isContact ? " landing-section-header--contact" : ""}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: align,
        textAlign,
        mb: { xs: 2.5, md: 3.5 },
        ...sx,
      }}
    >
      <Box
        className={`landing-eyebrow-row ${
          isContact
            ? "landing-eyebrow-row--contact"
            : isDark
              ? "landing-eyebrow-row--dark"
              : "landing-eyebrow-row--light"
        }`}
        sx={{ justifyContent: centered ? "center" : "flex-start" }}
      >
        <Box className="landing-eyebrow-row__line" aria-hidden />
        <Box component="span" className="landing-section-eyebrow">
          {eyebrow}
        </Box>
        {centered ? <Box className="landing-eyebrow-row__line" aria-hidden /> : null}
      </Box>

      <Box
        component="h2"
        className={`landing-section-title ${isDark ? "landing-section-title--dark" : ""}`}
        sx={{
          fontSize: { xs: "2rem", sm: "2.5rem", md: "clamp(2.6rem, 3.4vw, 3.4rem)" },
          textAlign,
          mt: 1,
        }}
      >
        {title}
      </Box>

      {highlight ? (
        <Box
          component="p"
          className={`landing-section-highlight ${isDark ? "landing-section-highlight--dark" : ""}`}
          sx={{ textAlign, mt: isContact ? 0 : 0.5 }}
        >
          {highlight}
        </Box>
      ) : null}

      {subtitle ? (
        <Box
          component="p"
          className={`landing-section-lead ${isDark ? "landing-section-lead--dark" : ""}`}
          sx={{
            textAlign,
            maxWidth: centered ? "36rem" : "32rem",
            mt: 1.5,
            mx: centered ? "auto" : 0,
          }}
        >
          {subtitle}
        </Box>
      ) : null}
    </Box>
  );
}
