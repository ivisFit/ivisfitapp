"use client";

import { Box } from "@mui/material";
import { useLandingContent } from "@/features/landing/cms/LandingContentProvider";
import {
  DEFAULT_HOME_DICTIONARY,
  type TestimonioItem,
} from "@/features/landing/cms/home-dictionary";
import { HomeImg, HomeText } from "@/features/landing/cms/HomeCmsFields";
import { LandingSectionHeader } from "@/features/landing/components/shared/LandingSectionHeader";
import { getByPath } from "@/lib/preview-cms/lib/content-edit/paths";
import { Testimonio } from "./Testimonio";

const defaultBackgroundImage = "/imgs/testimonio.jpg";

function getTestimonios(dictionary: Record<string, unknown>): TestimonioItem[] {
  const items = getByPath(dictionary, "home.testimonios.items");
  if (Array.isArray(items) && items.length > 0) {
    return items as TestimonioItem[];
  }
  return DEFAULT_HOME_DICTIONARY.home.testimonios.items;
}

export const Testimonios = () => {
  const { dictionary } = useLandingContent();
  const testimonios = getTestimonios(dictionary);

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        width: "100%",
        minHeight: { xs: "auto", smmd: "100vh" },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        boxSizing: "border-box",
        py: { xs: "4rem", md: "calc(var(--landing-section-y) + 1.5rem)" },
        px: { xs: "1.4rem", sm: "2.5rem", md: "clamp(2.5rem, 6vw, 6rem)" },
      }}
    >
      <Box sx={{ position: "absolute", inset: 0, zIndex: 0, "& img": { objectFit: "cover", objectPosition: "center top" } }}>
        <HomeImg
          field="testimonios.backgroundImage"
          fallback={defaultBackgroundImage}
          alt="Fondo de testimonios"
          fill
          sizes="100vw"
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(9,7,8,0.82) 0%, rgba(9,7,8,0.7) 50%, rgba(9,7,8,0.88) 100%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 15%, rgba(253,201,21,0.12) 0%, rgba(253,201,21,0) 55%)",
          }}
        />
      </Box>

      <Box sx={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "48rem", px: 2 }}>
        <LandingSectionHeader
          centered
          tone="dark"
          eyebrow={<HomeText field="testimonios.eyebrow" />}
          title={<HomeText field="testimonios.title" />}
          subtitle={<HomeText field="testimonios.subtitle" multiline />}
          sx={{ mb: { xs: "2.5rem", md: "3.5rem" } }}
        />
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "1180px",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", smmd: "repeat(3, 1fr)" },
          gap: { xs: "1.4rem", md: "1.8rem" },
          alignItems: "stretch",
        }}
      >
        {testimonios.map((item, index) => (
          <Testimonio key={`${item.nombre}-${index}`} index={index} />
        ))}
      </Box>
    </Box>
  );
};
