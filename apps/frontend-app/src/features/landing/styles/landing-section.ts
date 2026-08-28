import type { SxProps, Theme } from "@mui/material";

/** Dark section shell used across landing */
export const landingDarkSectionSx: SxProps<Theme> = {
  width: "100%",
  boxSizing: "border-box",
  background:
    "linear-gradient(160deg, var(--brand-dark) 0%, var(--brand-dark-soft) 55%, var(--brand-dark) 100%)",
  position: "relative",
};

export const landingLightSectionSx: SxProps<Theme> = {
  width: "100%",
  boxSizing: "border-box",
  background: "linear-gradient(135deg, #ffffff 0%, var(--brand-paper) 100%)",
};

export const landingAccentTopBarSx: SxProps<Theme> = {
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background:
      "linear-gradient(90deg, var(--brand-gold) 0%, var(--brand-gold-soft) 50%, var(--brand-gold) 100%)",
    zIndex: 1,
  },
};

export const landingSectionPaddingSx: SxProps<Theme> = {
  py: { xs: "var(--landing-section-y)", md: "calc(var(--landing-section-y) + 1.5rem)" },
  px: { xs: "1.25rem", sm: "2rem", md: "clamp(2.5rem, 6vw, 6rem)" },
};
