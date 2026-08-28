import { Box } from "@mui/material"

import imagen from "./../../../public/imgs/IncluyenPlanes.jpg";
import imagen2 from "../../../public/imgs/pesas.jpg"
import TrainingSelect from "../Select"
import { ButtonArrow } from "../Buttons/ButtonArrow"

const Eyebrow = ({ centered = false }: { centered?: boolean }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: centered ? "center" : "flex-start",
      gap: "0.7rem",
      color: "#fdc915",
      letterSpacing: "0.4rem",
      fontSize: { xs: "0.7rem", md: "0.85rem" },
      fontWeight: 700,
      textTransform: "uppercase",
      mb: "1rem",
    }}
  >
    <Box sx={{ width: "34px", height: "2px", backgroundColor: "#fdc915" }} />
    {"Todo lo que recibes"}
    {centered && <Box sx={{ width: "34px", height: "2px", backgroundColor: "#fdc915" }} />}
  </Box>
)

const Heading = ({ centered = false }: { centered?: boolean }) => (
  <Box sx={{ textAlign: centered ? "center" : "left" }}>
    <Box
      component="h2"
      className="oswald-fuente"
      sx={{
        color: "white",
        fontSize: { xs: "2.3rem", md: "3.2rem" },
        lineHeight: 1.05,
        letterSpacing: "0.3rem",
        margin: 0,
      }}
    >
      {"\u00bfQu\u00e9 incluye cada plan?"}
    </Box>
    <Box
      component="span"
      className="oswald-fuente"
      sx={{
        display: "inline-block",
        color: "#fdc915",
        fontSize: { xs: "1.6rem", md: "2.1rem" },
        letterSpacing: "0.2rem",
        mt: "0.4rem",
      }}
    >
      {"\u00a1Desc\u00fabrelo!"}
    </Box>
    <Box
      component="p"
      sx={{
        color: "rgba(255,255,255,0.7)",
        fontFamily: "Poppins",
        fontSize: { xs: "0.95rem", md: "1.05rem" },
        lineHeight: 1.7,
        maxWidth: "32rem",
        mt: "1.2rem",
        mx: centered ? "auto" : 0,
      }}
    >
      {"Cada programa combina entrenamiento, nutrici\u00f3n y seguimiento personalizado. Despliega cada plan y descubre todo lo que vas a recibir."}
    </Box>
  </Box>
)

export const IncluyenPlanes = () => {
  return (
    <Box>
      {/* Desktop / tablet */}
      <Box
        sx={{
          width: "100%",
          display: { xs: "none", smmd: "flex" },
          alignItems: "stretch",
          justifyContent: "space-between",
          boxSizing: "border-box",
          background: "linear-gradient(160deg, #090708 0%, #14110f 55%, #090708 100%)",
          position: "relative",
        }}
      >
        <Box
          sx={{
            width: "55%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "5rem 3.5vw 5rem 5vw",
            boxSizing: "border-box",
          }}
        >
          <Eyebrow />
          <Heading />
          <Box sx={{ mt: "2rem" }}>
            <TrainingSelect />
          </Box>
          <Box sx={{ mt: "1.5rem" }}>
            <a href="#planes-section" style={{ textDecoration: "none", color: "white" }}>
              <ButtonArrow text="Ver planes" />
            </a>
          </Box>
        </Box>

        <Box
          sx={{
            width: "45%",
            position: "relative",
            boxSizing: "border-box",
            minHeight: "100%",
            overflow: "hidden",
          }}
        >
          <img
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              display: "block",
            }}
            src={imagen}
            alt="Entrenamiento Ivis Fit"
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(9,7,8,0.85) 0%, rgba(9,7,8,0.25) 35%, rgba(9,7,8,0.1) 100%)",
              pointerEvents: "none",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: "1.5rem",
              border: "1px solid rgba(253, 201, 21, 0.45)",
              borderRadius: "10px",
              pointerEvents: "none",
            }}
          />
        </Box>
      </Box>

      {/* Mobile */}
      <Box
        sx={{
          width: "100%",
          display: { xs: "flex", smmd: "none" },
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
          background: "linear-gradient(160deg, #090708 0%, #14110f 55%, #090708 100%)",
        }}
      >
        <Box sx={{ width: "100%", height: "42vh", position: "relative", boxSizing: "border-box" }}>
          <img
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              display: "block",
            }}
            src={imagen2}
            alt="Entrenamiento Ivis Fit"
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(9,7,8,0.25) 0%, rgba(9,7,8,0.85) 100%)",
              pointerEvents: "none",
            }}
          />
        </Box>

        <Box sx={{ width: "100%", padding: "2.5rem 1.5rem", boxSizing: "border-box" }}>
          <Eyebrow centered />
          <Heading centered />
          <Box sx={{ mt: "1.5rem" }}>
            <TrainingSelect />
          </Box>
          <Box sx={{ mt: "1.5rem", display: "flex", justifyContent: "center" }}>
            <a href="#planes-section" style={{ textDecoration: "none", color: "white" }}>
              <ButtonArrow text="Ver planes" />
            </a>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
