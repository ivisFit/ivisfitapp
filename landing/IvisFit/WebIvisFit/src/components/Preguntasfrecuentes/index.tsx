import { Box, Typography } from "@mui/material"
import { AccordionFAQ } from "./AccordionFAQ"
import { AccordionFAQ2 } from "./AccordionFAQ2"
import { AccordionFAQ3 } from "./AccordionFAQ3"

export const PreguntasFrecuentes = () => {
  
  return (
    <Box 
    id="preguntas-frecuentes"
      sx={{
        minHeight: { xs: "90vh", lg: "75vh" },
        width: "100%", 
        backgroundColor: "#faf8f5", 
        display: "flex",  
        flexDirection: "column", 
        alignItems: "center",
        background: "linear-gradient(135deg, #ffffff 0%, #fdfaf0 100%)",
        padding: { xs: "2rem 0", lg: "3rem 0" },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #e1aa43 0%, #ffd700 50%, #e1aa43 100%)",
        }
      }}
    >
      {/* Elementos decorativos */}
      <Box 
        sx={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: "rgba(225, 170, 67, 0.1)",
          filter: "blur(8px)",
          zIndex: 0
        }}
      />
      <Box 
        sx={{
          position: "absolute",
          bottom: "15%",
          right: "5%",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background: "rgba(225, 170, 67, 0.08)",
          filter: "blur(10px)",
          zIndex: 0
        }}
      />
      
      <Box 
        sx={{ 
          width: "100%", 
          height: "auto", 
          display: "flex", 
          justifyContent: "center", 
          flexDirection: "column", 
          alignItems: "center",
          position: "relative",
          zIndex: 1
        }}
      >
        <Typography
          variant="overline"
          sx={{
            color: "#e1aa43", 
            letterSpacing: { xs: "0.2rem", md: "0.3rem" },
            fontFamily: "Source Sans Pro", 
            marginTop: { xs: "2rem", lg: "4rem" },
            fontSize: { xs: "0.8rem", md: "1rem" },
            fontWeight: 600,
            display: "block",
            textAlign: "center",
            padding: "0.5rem 1.5rem",
            backgroundColor: "rgba(225, 170, 67, 0.1)",
            borderRadius: "30px",
            mb: 2
          }}
          id="faq-section"
        >
          PREGUNTAS FRECUENTES
        </Typography>
        
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem", lg: "3.5rem" },
            fontWeight: "bold",
            color: "#2c3e50",
            textAlign: "center",
            mb: 2,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: "-10px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "80px",
              height: "3px",
              background: "linear-gradient(90deg, #e1aa43, #ffd700)",
              borderRadius: "2px"
            }
          }}
        >
          ¿Tenés dudas?
        </Typography>
        
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem", lg: "3rem" },
            fontWeight: 500,
            color: "#34495e",
            textAlign: "center",
            mb: { xs: 3, lg: 4 }
          }}
        >
          Acá las respondemos
        </Typography>
      </Box>
      
      {/* Contenedor de acordeones para móviles */}
      <Box 
        sx={{
          width: "90%", 
          maxWidth: "800px",
          height: "auto", 
          display: { xs: "flex", lg: "none" }, 
          flexDirection: "column",
          gap: "1rem", 
          marginTop: "2rem",
          position: "relative",
          zIndex: 1,
          padding: "1.5rem",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: "0 15px 35px rgba(0,0,0,0.12)"
          }
        }}
      >
        <AccordionFAQ2 />
      </Box>
      
      {/* Contenedor de acordeones para desktop */}
      <Box 
        sx={{ 
          width: "90%", 
          maxWidth: "1200px",
          height: "auto", 
          display: { xs: "none", lg: "flex" }, 
          flexDirection: "row", 
          gap: "2rem", 
          margin: "3rem 0",
          position: "relative",
          zIndex: 1
        }}
      >
        <Box 
          sx={{
            flex: 1,
            padding: "2rem",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              boxShadow: "0 15px 35px rgba(0,0,0,0.12)"
            }
          }}
        >
          <AccordionFAQ />
        </Box>
        
        <Box 
          sx={{
            flex: 1,
            padding: "2rem",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              boxShadow: "0 15px 35px rgba(0,0,0,0.12)"
            }
          }}
        >
          <AccordionFAQ3 />
        </Box>
      </Box>
    </Box>
  )
}