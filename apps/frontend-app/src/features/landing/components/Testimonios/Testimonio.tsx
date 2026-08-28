"use client";

import { Box, Typography } from "@mui/material";
import { Star } from "lucide-react";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { HomeArrayText } from "@/features/landing/cms/HomeCmsFields";
import { useLandingContent } from "@/features/landing/cms/LandingContentProvider";
import { DEFAULT_HOME_DICTIONARY } from "@/features/landing/cms/home-dictionary";
import { getByPath } from "@/lib/preview-cms/lib/content-edit/paths";

type TestimonioProps = {
  index: number;
};

export const Testimonio = ({ index }: TestimonioProps) => {
  const { dictionary } = useLandingContent();
  const items = getByPath(dictionary, "home.testimonios.items");
  const fallback = DEFAULT_HOME_DICTIONARY.home.testimonios.items[index];
  const item =
    Array.isArray(items) && items[index]
      ? (items[index] as { nombre?: string; textos?: string[] })
      : fallback;
  const textosCount = item?.textos?.length ?? fallback?.textos.length ?? 0;
  const nombre = item?.nombre ?? fallback?.nombre ?? "A";

  return (
    <Box
      component="article"
      className="landing-testimonial-card"
      aria-label={`Testimonio de ${nombre}`}
      sx={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        textAlign: "left",
        p: { xs: 3, md: 3.5 },
        borderRadius: "18px",
        background:
          "linear-gradient(160deg, rgba(22,18,16,0.92) 0%, rgba(12,10,9,0.94) 100%)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgb(253 201 21 / 22%)",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
        transition: "transform .35s ease, border-color .35s ease, box-shadow .35s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          borderColor: "rgba(253, 201, 21, 0.55)",
          boxShadow: "0 24px 55px rgba(0,0,0,0.55)",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 6,
          right: 10,
          opacity: 0.08,
          pointerEvents: "none",
        }}
      >
        <FormatQuoteIcon sx={{ fontSize: "5rem", color: "var(--brand-gold-soft)", transform: "rotate(180deg)" }} />
      </Box>

      <Box component="span" className="visually-hidden">
        5 de 5 estrellas
      </Box>
      <Box sx={{ display: "flex", gap: "3px", mb: 2 }} aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={18} color="var(--brand-gold-soft)" fill="var(--brand-gold-soft)" />
        ))}
      </Box>

      <Box sx={{ position: "relative", zIndex: 1, flexGrow: 1 }}>
        {Array.from({ length: textosCount }).map((_, textIndex) => (
          <Typography
            key={textIndex}
            component="p"
            sx={{
              color: "rgba(255,255,255,0.85)",
              fontFamily: "var(--font-accent)",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: { xs: "1.1rem", md: "1.18rem" },
              lineHeight: 1.6,
              mb: textIndex < textosCount - 1 ? 1.4 : 0,
            }}
          >
            <HomeArrayText path={`home.testimonios.items.${index}.textos.${textIndex}`} multiline />
          </Typography>
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mt: 3,
          pt: 2.5,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "1.1rem",
            color: "#1f1402",
            background: "linear-gradient(135deg, var(--brand-gold-soft) 0%, #f0a500 100%)",
            boxShadow: "0 6px 16px rgba(253,201,21,0.3)",
          }}
        >
          {nombre.charAt(0).toUpperCase()}
        </Box>
        <Box>
          <Typography sx={{ color: "white", fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "1rem", lineHeight: 1.2 }}>
            <HomeArrayText path={`home.testimonios.items.${index}.nombre`} />
          </Typography>
          <Typography
            sx={{
              color: "var(--brand-gold-soft)",
              fontSize: "0.72rem",
              letterSpacing: "0.06rem",
              textTransform: "uppercase",
            }}
          >
            <HomeArrayText path={`home.testimonios.items.${index}.role`} />
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
