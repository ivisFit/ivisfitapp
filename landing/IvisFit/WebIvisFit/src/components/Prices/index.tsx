import { Box } from "@mui/material";
import { Card } from "../Card";
import imagen1 from "../../../public/imgs/imagenback1.jpg";
import imagen2 from "../../../public/imgs/imagenback2.jpg";
import imagen3 from "../../../public/imgs/imagenback3.jpg";
import { Card2 } from "../Card2";
import { plans } from "../../data/plans";

const planImages = [imagen2, imagen3, imagen2, imagen1, imagen1, imagen3];

export const Prices = () => {
  return (
    <Box sx={{ width: "100%", backgroundColor: "#ffffff" }} id="planes">
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          color: "#e1aa43",
          fontWeight: "bold",
          letterSpacing: "0.1rem",
          paddingTop: { xs: "3rem", md: "4.5rem" },
        }}
      >
        <Box
          sx={{
            minHeight: "30vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "0.6rem",
            px: 2,
          }}
          id="planes-section"
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "0.7rem",
              color: "#e1aa43",
              letterSpacing: "0.4rem",
              fontSize: { xs: "0.7rem", md: "0.9rem" },
              fontWeight: 600,
              textTransform: "uppercase",
              mb: 1,
            }}
          >
            <Box sx={{ width: "30px", height: "2px", backgroundColor: "#e1aa43" }} />
            Programas de entrenamiento
            <Box sx={{ width: "30px", height: "2px", backgroundColor: "#e1aa43" }} />
          </Box>
          <Box
            className="tituloAdaptable"
            sx={{
              textAlign: "center",
              fontSize: { xs: "1.9rem", smmid: "3.2rem" },
              color: "#1f2020",
              lineHeight: 1.1,
            }}
          >
            Elige el programa ideal para ti
          </Box>
          <Box
            sx={{
              textAlign: "center",
              fontSize: { xs: "0.95rem", md: "1.1rem" },
              color: "#6b6b6b",
              fontWeight: 400,
              letterSpacing: "normal",
              fontFamily: "Poppins",
              maxWidth: "620px",
              mt: 1,
            }}
          >
            Entrenamientos diseñados para acompañar tu objetivo, con seguimiento y nutrición incluidos.
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          width: "100%",
          display: { xs: "none", lg: "grid" },
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "30px",
          alignItems: "stretch",
          padding: "0 1vw",
          margin: "2rem 0 4rem",
          boxSizing: "border-box",
          justifyItems: "center",
        }}
      >
        {plans.map((plan, index) => (
          <Card
            key={plan.id}
            link={plan.route}
            imagen={planImages[index]}
            arreglo={plan.cardBullets}
            titulo={plan.shortTitle}
            subtitulo={plan.subtitle}
            tiempo1={plan.duration}
            precio1={plan.investment}
            badge={plan.badge}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: { xs: "flex", lg: "none" },
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "30px",
          boxSizing: "border-box",
          padding: "0 1vw",
          margin: "2rem 0 4rem",
        }}
      >
        {plans.map((plan, index) => (
          <Card2
            key={plan.id}
            link={plan.route}
            imagen={planImages[index]}
            arreglo={plan.cardBullets}
            titulo={plan.shortTitle}
            subtitulo={plan.subtitle}
            tiempo1={plan.duration}
            precio1={plan.investment}
            badge={plan.badge}
          />
        ))}
      </Box>

    </Box>
  );
};
