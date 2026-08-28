"use client";

import { Box } from "@mui/material";
import { ButtonWhite } from "../Buttons/ButtonWhite";
import { HomeText } from "@/features/landing/cms/HomeCmsFields";

type SeparadorProps = {
  textKey: "transformacion" | "camino";
};

const Separador = ({ textKey }: SeparadorProps) => {
  return (
    <Box sx={{ width: "100%" }}>
      <Box
        className="landing-separator-band"
        sx={{
          display: { xs: "none", smmid: "flex" },
          justifyContent: "space-evenly",
          gap: "2rem",
          px: "2rem",
        }}
      >
        <Box component="h2" className="landing-separator-band__text">
          <HomeText field={`separadores.${textKey}`} />
        </Box>
        <ButtonWhite text="Quiero empezar" />
      </Box>
      <Box
        className="landing-separator-band"
        sx={{
          display: { xs: "flex", smmid: "none" },
          flexDirection: "column",
          gap: "1.25rem",
          px: "1rem",
        }}
      >
        <Box component="h2" className="landing-separator-band__text">
          <HomeText field={`separadores.${textKey}`} />
        </Box>
        <ButtonWhite text="Quiero empezar" />
      </Box>
    </Box>
  );
};

export default Separador;
