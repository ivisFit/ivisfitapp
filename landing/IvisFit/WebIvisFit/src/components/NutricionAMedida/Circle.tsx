import { Box, Typography, keyframes } from "@mui/material";
import { ButtonArrow } from "../Buttons/ButtonArrow";

// Animaciones personalizadas
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(3deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Componente Circle mejorado
type NutritionType = "Vegana" | "Gluten Free" | "Proteica" | "Vegetariana" | "Low Carb" | "Antiinflamatoria";

interface CircleProps {
  text: NutritionType;
  delay?: number;
}

const Circle = ({ text, delay = 0 }: CircleProps) => {
  // Colores personalizados para cada tipo de nutrición
  const colorMap: Record<NutritionType, { main: string; light: string; dark: string }> = {
    "Vegana": { main: "#4CAF50", light: "#E8F5E9", dark: "#2E7D32" },
    "Gluten Free": { main: "#FF9800", light: "#FFF3E0", dark: "#EF6C00" },
    "Proteica": { main: "#F44336", light: "#FFEBEE", dark: "#C62828" },
    "Vegetariana": { main: "#9C27B0", light: "#F3E5F5", dark: "#6A1B9A" },
    "Low Carb": { main: "#2196F3", light: "#E3F2FD", dark: "#1565C0" },
    "Antiinflamatoria": { main: "#009688", light: "#E0F2F1", dark: "#00695C" }
  };

  const colors = colorMap[text] || { main: "#e1aa43", light: "#FFF9E6", dark: "#b8860b" };

  return (
    <Box
      sx={{
        width: { xs: 90, sm: 120, md: 150 },
        height: { xs: 90, sm: 120, md: 150 },
        borderRadius: "50%",
        backgroundColor: colors.light,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: `3px solid ${colors.main}`,
        boxShadow: `0 8px 16px rgba(0,0,0,0.1), inset 0 0 20px ${colors.light}`,
        animation: `${float} 4s ease-in-out infinite, ${pulse} 6s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
        "&:before": {
          content: '""',
          position: "absolute",
          width: "60%",
          height: "60%",
          borderRadius: "50%",
          border: `2px dashed ${colors.main}`,
          opacity: 0.3,
          animation: `${rotate} 20s linear infinite`,
        },
        "&:hover": {
          transform: "scale(1.1)",
          boxShadow: `0 12px 20px rgba(0,0,0,0.15), 0 0 30px ${colors.main}40`,
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          padding: "10px",
        }}
      >
        <Typography
          variant="body1"
          sx={{
            color: colors.dark,
            fontWeight: "bold",
            fontSize: { xs: "0.75rem", sm: "0.9rem", md: "1rem" },
            lineHeight: 1.2,
            textShadow: "0 1px 2px rgba(255,255,255,0.8)",
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
    "Antiinflamatoria"
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
        padding: { xs: "20px 0", md: "40px 0" },
        overflow: "hidden",
        position: "relative",
        "&:before": {
          content: '""',
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle at 20% 80%, #f8f9fa 0%, transparent 50%)",
          zIndex: 0,
        },
      }}
    >
      {/* Título */}
      <Box
        sx={{
          textAlign: "center",
          marginBottom: { xs: "30px", md: "50px" },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
            fontWeight: "bold",
            color: "#e1aa43",
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            marginBottom: "10px",
          }}
        >
          Nutrición a Medida
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "text.secondary",
            maxWidth: "600px",
            margin: "0 auto",
            fontSize: { xs: "1rem", md: "1.2rem" },
          }}
        >
          Descubre planes nutricionales personalizados para tu estilo de vida
        </Typography>
      </Box>

      {/* Círculos para pantallas grandes */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexWrap: "wrap",
          justifyContent: "center",
          gap: { xs: 3, md: 4, lg: 6 },
          maxWidth: "1200px",
          margin: "0 auto 50px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {nutritionTypes.map((type, index) => (
          <Circle
            key={type}
            text={type}
            delay={index * 0.2}
          />
        ))}
      </Box>

      {/* Círculos para pantallas móviles (carrusel simplificado) */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          overflowX: "auto",
          width: "100%",
          padding: "10px 0 30px",
          gap: "20px",
          justifyContent: "flex-start",
          scrollSnapType: "x mandatory",
          "& > *": {
            flexShrink: 0,
            scrollSnapAlign: "center",
          },
          "&::-webkit-scrollbar": {
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#e1aa43",
            borderRadius: "10px",
          },
        }}
      >
        {nutritionTypes.slice(0, 4).map((type, index) => (
          <Box key={type} sx={{ padding: "0 10px" }}>
            <Circle
              text={type}
              delay={index * 0.2}
            />
          </Box>
        ))}
      </Box>

      {/* Botón CTA */}
      <Box sx={{ position: "relative", zIndex: 1, marginTop: { xs: "20px", md: "40px" } }}>
        <ButtonArrow text="Quiero Empezar" />
      </Box>
    </Box>
  );
};