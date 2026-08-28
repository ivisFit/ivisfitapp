"use client";

import { Box, Typography } from "@mui/material";
import { ButtonPresentation } from "../Buttons/ButtonPresentation";
import { ButtonPresentation2 } from "../Buttons/ButtonPresentation2";
import { HomeImg, HomeText } from "@/features/landing/cms/HomeCmsFields";

const defaultImage = "/imgs/Presentacion.JPG";

export const Presentacion = () => {
  return (
    <Box component="section" sx={{ width: "100%" }} id="conoceme-section">
      <Box
        sx={{
          width: "100%",
          display: { xs: "none", sm: "flex" },
          alignItems: "stretch",
          minHeight: { sm: "560px", lg: "min(78vh, 760px)" },
          background: "linear-gradient(135deg, #ffffff 0%, var(--brand-paper) 100%)",
        }}
      >
        <Box
          sx={{
            width: "50%",
            position: "relative",
            flexShrink: 0,
            overflow: "hidden",
            minHeight: { sm: "560px", lg: "min(78vh, 760px)" },
            "& img": { objectFit: "cover", objectPosition: "center top" },
          }}
        >
          <HomeImg
            field="presentacion.image"
            fallback={defaultImage}
            alt="Ivis Fernández - Profesora de Educación Física"
            fill
            sizes="(max-width: 600px) 100vw, 50vw"
            priority
          />
        </Box>

        <Box
          sx={{
            width: "50%",
            padding: { xs: "2rem", lg: "clamp(3rem, 5vw, 5.5rem)" },
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            overflow: "visible",
          }}
        >
          <p className="landing-presentacion-greeting">
            <HomeText field="presentacion.greeting" />
          </p>

          <h2 className="landing-presentacion-name">
            <HomeText field="presentacion.title" />
          </h2>

          <div className="landing-presentacion-rule" />

          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "visible",
              py: 1,
            }}
          >
            <Typography className="landing-presentacion-body" sx={{ overflow: "visible", whiteSpace: "pre-line", "& br": { display: { xs: "none", md: "block" } } }}>
              <HomeText field="presentacion.body" multiline />
              {"\n\n"}
              <Box component="span" sx={{ color: "var(--brand-gold)", fontWeight: 700 }}>
                <HomeText field="presentacion.hashtag" as="span" />
              </Box>
            </Typography>

            <Box
              sx={{
                padding: "1.5rem 0 0 0",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "start",
                flexShrink: 0,
              }}
            >
              <a href="#planes-section" className="landing-cta-link" aria-label="Ver planes de entrenamiento">
                <ButtonPresentation />
              </a>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          width: "100%",
          display: { xs: "flex", sm: "none" },
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: { xs: "50vh", sm: "60vh" },
            overflow: "hidden",
            position: "relative",
            "& img": { objectFit: "cover", objectPosition: "center top" },
          }}
        >
          <HomeImg
            field="presentacion.image"
            fallback={defaultImage}
            alt="Ivis Fernández - Profesora de Educación Física"
            fill
            sizes="100vw"
            priority
          />
        </Box>

        <Box
          sx={{
            width: "100%",
            padding: "2rem",
            boxSizing: "border-box",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <p className="landing-presentacion-greeting" style={{ textAlign: "center" }}>
            <HomeText field="presentacion.greeting" />
          </p>

          <h2 className="landing-presentacion-name" style={{ textAlign: "center" }}>
            <HomeText field="presentacion.title" />
          </h2>

          <div className="landing-presentacion-rule" style={{ margin: "0.8rem auto 0" }} />

          <Typography className="landing-presentacion-body" sx={{ marginTop: "1rem", textAlign: "center", whiteSpace: "pre-line" }}>
            <HomeText field="presentacion.body" multiline />
            {"\n\n"}
            <Box component="span" sx={{ color: "var(--brand-gold)", fontWeight: 700 }}>
              <HomeText field="presentacion.hashtag" as="span" />
            </Box>
          </Typography>

          <Box
            sx={{
              padding: "2rem 0 0 0",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "end",
            }}
          >
            <a href="#planes-section" className="landing-cta-link" aria-label="Ver planes de entrenamiento">
              <ButtonPresentation2 />
            </a>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
