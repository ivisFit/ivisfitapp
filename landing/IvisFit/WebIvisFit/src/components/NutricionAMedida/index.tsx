import { Box, Typography, keyframes } from "@mui/material";
import { ButtonArrow } from "../Buttons/ButtonArrow";

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
        background: "linear-gradient(160deg, #ffffff 0%, #fbf6ea 100%)",
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
            color: "#1a1410",
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
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #ffffff 0%, #faf4e6 55%, #f3ece0 100%)",
        padding: { xs: "60px 0", md: "90px 0" },
        overflow: "hidden",
        position: "relative",
        "&:before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 12%, rgba(225,170,67,0.14) 0%, rgba(225,170,67,0) 55%)",
          zIndex: 0,
        },
      }}
    >
      {/* Encabezado */}
      <Box
        sx={{
          textAlign: "center",
          marginBottom: { xs: "40px", md: "60px" },
          position: "relative",
          zIndex: 1,
          width: "100%",
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.7rem",
            color: "#c8902a",
            letterSpacing: "0.4rem",
            fontSize: { xs: "0.7rem", md: "0.85rem" },
            fontWeight: 700,
            textTransform: "uppercase",
            mb: "1rem",
          }}
        >
          <Box sx={{ width: "34px", height: "2px", backgroundColor: "#c8902a" }} />
          {"Alimentaci\u00f3n inteligente"}
          <Box sx={{ width: "34px", height: "2px", backgroundColor: "#c8902a" }} />
        </Box>
        <Box
          component="h2"
          className="oswald-fuente"
          sx={{
            color: "#1a1410",
            fontSize: { xs: "2.3rem", sm: "3rem", md: "3.5rem" },
            lineHeight: 1.05,
            letterSpacing: "0.3rem",
            margin: 0,
          }}
        >
          {"NUTRICI\u00d3N PARA TU OBJETIVO"}
        </Box>
        <Typography
          sx={{
            color: "rgba(26,20,16,0.65)",
            fontFamily: "Poppins",
            maxWidth: "620px",
            margin: "1.2rem auto 0",
            fontSize: { xs: "0.95rem", sm: "1.05rem" },
            lineHeight: 1.7,
          }}
        >
          {"Cada programa suma una gu\u00eda nutricional pensada para acompa\u00f1ar tu entrenamiento y potenciar tus objetivos."}
        </Typography>
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
          maxWidth: { xs: "350px", sm: "600px", md: "800px", lg: "1200px" },
          margin: "0 auto 50px",
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
          marginTop: { xs: "20px", md: "30px" },
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <a href="#planes-section" style={{ textDecoration: "none", color: "white" }}>
          <ButtonArrow text="Quiero Empezar" />
        </a>
      </Box>
    </Box>
  );
};
