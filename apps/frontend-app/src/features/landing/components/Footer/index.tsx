"use client";

import { Box } from "@mui/material";
import { CONTACT_EMAIL, DISPLAY_PHONE, INSTAGRAM_URL, WEBSITE_URL } from "../../data/plans";
import { HomeImg, HomeText } from "@/features/landing/cms/HomeCmsFields";

const defaultLogo = "/imgs/LogoFooter.png";
const defaultInstagram = "/imgs/instagram.png";

const linkSx = {
  color: "rgba(255,255,255,0.78)",
  fontFamily: "var(--font-body)",
  fontSize: "0.95rem",
  letterSpacing: "0.02em",
  textDecoration: "none",
  transition: "color 0.25s ease",
  "&:hover": { color: "var(--brand-gold-soft)" },
} as const;

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        background:
          "linear-gradient(180deg, var(--brand-dark) 0%, #050404 100%)",
        borderTop: "1px solid rgba(225,170,67,0.25)",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          maxWidth: "var(--landing-max-w)",
          margin: "0 auto",
          px: { xs: "1.5rem", md: "clamp(2.5rem, 6vw, 6rem)" },
          py: { xs: "3rem", md: "4.5rem" },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr 0.8fr" },
          gap: { xs: "2.5rem", md: "3rem" },
          alignItems: "start",
          textAlign: { xs: "center", md: "left" },
          justifyItems: { xs: "center", md: "start" },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "1.1rem", alignItems: { xs: "center", md: "flex-start" } }}>
          <Box sx={{ width: "7.5rem", lineHeight: 0 }}>
            <HomeImg
              field="footer.logo"
              fallback={defaultLogo}
              alt="IVIS Fit"
              width={3000}
              height={3000}
              className="h-auto w-full"
            />
          </Box>
          <Box
            sx={{
              color: "rgba(255,255,255,0.6)",
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              lineHeight: 1.6,
              maxWidth: "26rem",
            }}
          >
            <HomeText field="footer.tagline" as="span" />
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: "0.9rem", alignItems: { xs: "center", md: "flex-start" } }}>
          <Box
            component="p"
            sx={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontSize: "0.95rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--brand-gold)",
            }}
          >
            Contacto
          </Box>
          <Box component="a" className="landing-footer-contact" sx={linkSx} href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </Box>
          <Box component="a" sx={linkSx} href={`tel:${DISPLAY_PHONE.replace(/\s/g, "")}`}>
            {DISPLAY_PHONE}
          </Box>
          <Box component="a" sx={linkSx} href={WEBSITE_URL} target="_blank" rel="noopener noreferrer">
            www.ivisfit.com
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: "0.9rem", alignItems: { xs: "center", md: "flex-start" } }}>
          <Box
            component="p"
            sx={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontSize: "0.95rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--brand-gold)",
            }}
          >
            Seguinos
          </Box>
          <Box
            component="a"
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram de IVIS Fit"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "1px solid rgba(225,170,67,0.45)",
              transition: "border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease",
              "&:hover": {
                borderColor: "var(--brand-gold-soft)",
                transform: "translateY(-3px)",
                boxShadow: "0 10px 24px rgba(253,201,21,0.25)",
              },
            }}
          >
            <Box sx={{ width: 22, height: 22, position: "relative", lineHeight: 0 }}>
              <HomeImg
                field="footer.instagramIcon"
                fallback={defaultInstagram}
                alt="Instagram"
                width={185}
                height={185}
                className="h-auto w-full"
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          py: "1.25rem",
          px: { xs: "1.5rem", md: "clamp(2.5rem, 6vw, 6rem)" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
          maxWidth: "var(--landing-max-w)",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <Box
          component="span"
          sx={{
            color: "rgba(255,255,255,0.45)",
            fontFamily: "var(--font-body)",
            fontSize: "0.78rem",
            letterSpacing: "0.04em",
          }}
        >
          © {year} IVIS Fit. Todos los derechos reservados.
        </Box>
        <Box
          component="span"
          sx={{
            color: "rgba(255,255,255,0.45)",
            fontFamily: "var(--font-body)",
            fontSize: "0.78rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Entrenamiento online
        </Box>
      </Box>
    </Box>
  );
};
