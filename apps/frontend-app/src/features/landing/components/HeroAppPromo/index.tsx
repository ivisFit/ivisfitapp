"use client";

import { Box, type SxProps, type Theme } from "@mui/material";
import Link from "next/link";
import { ButtonArrowOutline } from "@/features/landing/components/Buttons/ButtonArrowOutline";
import { publicRoutes } from "@/routes/paths";
import { HomeImg } from "@/features/landing/cms/HomeCmsFields";

type FloatingKeywordBadgeProps = {
  label: string;
  className: string;
  sx?: SxProps<Theme>;
};

function FloatingKeywordBadge({ label, className, sx }: FloatingKeywordBadgeProps) {
  return (
    <Box
      className={className}
      aria-hidden
      sx={{
        position: "absolute",
        zIndex: 2,
        pointerEvents: "none",
        ...sx,
      }}
    >
      <Box
        sx={{
          whiteSpace: "nowrap",
          padding: { sm: "4px 10px", md: "4px 12px", lg: "5px 14px" },
          borderRadius: "999px",
          background: "transparent",
          border: "1px solid rgb(from var(--brand-gold) r g b / 85%)",
          boxShadow: "0 0 12px rgb(from var(--brand-gold) r g b / 35%)",
          color: "#fff",
          fontFamily: "var(--font-body)",
          fontSize: { sm: "0.52rem", md: "0.58rem", lg: "0.62rem" },
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          transform: "rotate(8deg)",
        }}
      >
        {label}
      </Box>
    </Box>
  );
}

function PhoneMockup() {
  const screenWidth = { sm: "124px", md: "146px", lg: "164px" };
  const glowSize = { sm: "220px", md: "260px", lg: "290px" };

  return (
    <Box
      sx={{
        position: "relative",
        flexShrink: 0,
        filter: "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.45))",
      }}
    >
      <Box className="ivis-hero-phone-float" sx={{ position: "relative" }}>
        <Box sx={{ position: "relative", transform: "rotate(-8deg)" }}>
          <Box
            aria-hidden
            className="ivis-hero-glow"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: glowSize,
              height: glowSize,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgb(from var(--brand-gold) r g b / 50%) 0%, rgb(from var(--brand-gold) r g b / 22%) 42%, rgb(from var(--brand-gold) r g b / 0%) 68%)",
              filter: "blur(18px)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          <FloatingKeywordBadge
            label="RESULTADOS"
            className="ivis-hero-badge-float"
            sx={{
              top: "8%",
              left: "88%",
            }}
          />
          <FloatingKeywordBadge
            label="DISCIPLINA"
            className="ivis-hero-badge-float-delayed"
            sx={{
              bottom: "24%",
              right: "88%",
            }}
          />
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              width: screenWidth,
              aspectRatio: "512 / 915",
              borderRadius: "24px",
              background: "linear-gradient(145deg, var(--brand-dark-soft) 0%, var(--brand-dark) 100%)",
              border: "2px solid rgb(255 255 255 / 8%)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "8px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "32%",
                height: "11px",
                borderRadius: "8px",
                backgroundColor: "var(--brand-dark)",
                zIndex: 2,
              }}
            />
            <HomeImg
              field="hero.appPreviewImage"
              fallback="/imgs/app-rutina-preview.png"
              alt="Pantalla de rutina IVIS Fit"
              fill
              sizes="(max-width: 900px) 124px, 164px"
              className="object-contain object-center"
              priority
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export function HeroAppPromo() {
  return (
    <Box
      className="ivis-fade-up-delay"
      sx={{
        width: "100%",
        maxWidth: { sm: "340px", md: "400px", lg: "440px" },
        marginRight: { sm: "3vw", md: "4vw", lg: "5vw" },
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { sm: "1rem", md: "1.25rem" },
        }}
      >
        <PhoneMockup />

        <Box sx={{ display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: 0 }}>
          <Box
            component="h2"
            className="oswald-fuente"
            sx={{
              margin: 0,
              color: "var(--brand-gold)",
              fontSize: { sm: "1.35rem", md: "1.55rem", lg: "1.7rem" },
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "0.02em",
              textShadow: "0 6px 30px rgba(0,0,0,0.45)",
            }}
          >
            {"\u00A1Lanzamos nuestra App!"}
          </Box>
          <Box
            component="p"
            sx={{
              margin: 0,
              color: "rgba(255,255,255,0.9)",
              fontFamily: "var(--font-body)",
              fontSize: { sm: "0.82rem", md: "0.92rem" },
              lineHeight: 1.5,
              textShadow: "0 6px 30px rgba(0,0,0,0.45)",
            }}
          >
            Lleva tus entrenamientos al siguiente nivel
          </Box>
          <Box className="ivis-fade-up-delay-2" sx={{ display: "flex", alignSelf: "flex-start" }}>
            <Link href={publicRoutes.registro} className="landing-cta-link" aria-label="Registrarse en IVIS Fit">
              <ButtonArrowOutline text="Iniciar" />
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
