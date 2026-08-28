import { Box } from "@mui/material"
import imagen from "../../../public/imgs/testimonio.jpg"
import { Testimonio } from "./Testimonio"

const testimonios = [
  {
    nombre: "Mica",
    textos: [
      "Mi experiencia ha sido muy buena, aprend\u00ed a alimentarme mejor sin pasar hambre y comiendo variado.",
      "Tu acompa\u00f1amiento me ayuda a sentirme contenida en los momentos que necesito motivaci\u00f3n.",
    ],
  },
  {
    nombre: "Pablo",
    role: "Alumno Ivis Fit",
    textos: [
      "Excelente. Mi cambio f\u00edsico fue muy notorio gracias a tus rutinas.",
      "Antes iba al gimnasio y no ten\u00eda una rutina realmente pensada en mis objetivos.",
    ],
  },
  {
    nombre: "Carla",
    textos: [
      "Nunca cre\u00ed que iba a ver estos cambios en mi f\u00edsico.",
      "Logr\u00e9 bajar much\u00edsimo mi porcentaje graso y sentirme c\u00f3moda con mi cuerpo y con m\u00e1s energ\u00eda.",
      "Gracias por ayudarme a lograr mejores h\u00e1bitos.",
    ],
  },
]

export const Testimonios = () => {
  return (
    <Box
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
        py: { xs: "4rem", md: "6rem" },
        px: { xs: "1.4rem", sm: "2.5rem", md: "5vw" },
      }}
    >
      {/* Fondo con overlay premium */}
      <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <img
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            display: "block",
          }}
          src={imagen}
          alt="Fondo de testimonios"
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

      {/* Encabezado */}
      <Box sx={{ position: "relative", zIndex: 1, textAlign: "center", mb: { xs: "2.5rem", md: "3.5rem" } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
          {"Historias reales"}
          <Box sx={{ width: "34px", height: "2px", backgroundColor: "#fdc915" }} />
        </Box>
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
          {"TESTIMONIOS"}
        </Box>
        <Box
          component="p"
          sx={{
            color: "rgba(255,255,255,0.7)",
            fontFamily: "Poppins",
            fontSize: { xs: "0.95rem", md: "1.05rem" },
            lineHeight: 1.7,
            maxWidth: "34rem",
            mt: "1.2rem",
            mx: "auto",
          }}
        >
          {"Resultados reales de personas que confiaron en el proceso. Esto es lo que viven d\u00eda a d\u00eda entrenando conmigo."}
        </Box>
      </Box>

      {/* Grid de testimonios */}
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
        {testimonios.map((t) => (
          <Testimonio key={t.nombre} nombre={t.nombre} role={t.role} textos={t.textos} />
        ))}
      </Box>
    </Box>
  )
}
