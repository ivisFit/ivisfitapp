import { Box, Typography} from "@mui/material"
import { IoIosArrowRoundForward } from "react-icons/io"

export const EstoEsParaTi = () => {

  const items = [
    "Te miras al espejo, y no te gusta lo que ves.",
    "La ropa que te gustaría usar, no te sienta cómoda.",
    "Estas dispuesta a salir de tu zona de confort.",
    "Necesitas una guía, en este nuevo camino.",
    "Reconoces que para cambiar tu cuerpo definitivamente, primero debes cambiar tu mente.",
    "Sos consciente de que tenes el poder de cambiar tu realidad."
  ]

  return (
    <Box sx={{ 
      backgroundColor: "#090708", 
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
    }}>
      {/* Elementos decorativos de fondo */}
      <Box 
        sx={{
          position: "absolute",
          top: "20%",
          right: "5%",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: "rgba(225, 170, 67, 0.05)",
          filter: "blur(10px)",
        }}
      />
      
      {/* Versión para desktop */}
      <Box sx={{
        minHeight: { md: "100vh" },
        width: "100%", 
        display: { xs: "none", md: "flex" }, 
        justifyContent: "center", 
        flexDirection: "column", 
        alignItems: "center",
        position: "relative",
        zIndex: 1,
        margin: "7rem 0 8rem 0"
      }}>
        <Box sx={{
          display: "flex", 
          justifyContent: "center", 
          flexDirection: "column", 
          alignItems: "center", 
          mb: 8,
          
        }}>
          <Typography
            variant="overline"
            sx={{
              color: "#e1aa43", 
              letterSpacing: "0.3rem",
              fontFamily: "Source Sans Pro", 
              mb: 2,
              fontSize: "1rem",
              fontWeight: 600,
              display: "block",
              textAlign: "center",
              padding: "0.5rem 1.5rem",
              backgroundColor: "rgba(225, 170, 67, 0.1)",
              borderRadius: "30px",
            }}
          >
            SIENTE EL CAMBIO
          </Typography>
          
          <Typography
            variant="h2"
            sx={{
              color: "#ffffff", 
              letterSpacing: "0.1rem", 
              fontSize: { md: "3rem", lg: "3.5rem" },
              fontWeight: "bold",
              textAlign: "center",
              mb: 1,
              textShadow: "0 2px 4px rgba(0,0,0,0.5)"
            }}
          >
            Esto es para ti si:
          </Typography>
        </Box>
        
        <Box sx={{
          width: "90%",
          maxWidth: "1200px"
        }}>
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 4,
            alignItems: "flex-start"
          }}>
            {items.slice(0, 3).map((item, index) => (
              <Box key={index} sx={{
                display: "flex", 
                alignItems: "flex-start",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "translateX(5px)"
                }
              }}>
                <Box sx={{
                  display: "flex", 
                  alignItems: "flex-start", 
                  justifyContent: "center", 
                  width: "40px", 
                  height: "40px", 
                  flexShrink: 0,
                  mr: 2,
                  pt: "4px"
                }}>    
                  <IoIosArrowRoundForward color="#e1aa43" size="32px" /> 
                </Box>    
                <Typography sx={{
                  color: "#ffffff", 
                  fontSize: "1.2rem",
                  lineHeight: 1.4,
                  flex: 1,
                  paddingTop: "8px"
                }}>
                  {item}
                </Typography>
              </Box>
            ))}
            
            {items.slice(3).map((item, index) => (
              <Box key={index+3} sx={{
                display: "flex", 
                alignItems: "flex-start",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "translateX(5px)"
                }
              }}>
                <Box sx={{
                  display: "flex", 
                  alignItems: "flex-start", 
                  justifyContent: "center", 
                  width: "40px", 
                  height: "40px", 
                  flexShrink: 0,
                  mr: 2,
                  pt: "4px"
                }}>    
                  <IoIosArrowRoundForward color="#e1aa43" size="32px" /> 
                </Box>    
                <Typography sx={{
                  color: "#ffffff", 
                  fontSize: "1.2rem",
                  lineHeight: 1.4,
                  flex: 1,
                  paddingTop: "8px"
                }}>
                  {item}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      
      {/* Versión para móvil */}
      <Box sx={{
        width: "100%", 
        backgroundColor: "#090708", 
        display: { xs: "flex", md: "none" }, 
        justifyContent: "center", 
        flexDirection: "column", 
        alignItems: "center", 
        py: 6,
        px: 2,
        position: "relative",
        zIndex: 1
      }}>
        <Box sx={{
          display: "flex", 
          justifyContent: "center", 
          flexDirection: "column", 
          alignItems: "center", 
          mb: 4
        }}>
          <Typography
            variant="overline"
            sx={{
              color: "#e1aa43", 
              letterSpacing: "0.2rem",
              fontFamily: "Source Sans Pro", 
              mb: 2,
              fontSize: "0.8rem",
              fontWeight: 600,
              display: "block",
              textAlign: "center",
              padding: "0.4rem 1.2rem",
              backgroundColor: "rgba(225, 170, 67, 0.1)",
              borderRadius: "30px"
            }}
          >
            SIENTE EL CAMBIO
          </Typography>
          
          <Typography
            variant="h3"
            sx={{
              color: "#ffffff", 
              letterSpacing: "0.05rem", 
              fontSize: "1.8rem",
              fontWeight: "bold",
              textAlign: "center",
              textShadow: "0 2px 4px rgba(0,0,0,0.5)"
            }}
          >
            Esto es para Ti si:
          </Typography>
        </Box>
        
        <Box sx={{
          width: "100%",
          maxWidth: "600px"
        }}>
          <Box sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5
          }}>
            {items.map((item, index) => (
              <Box key={index} sx={{
                display: "flex", 
                alignItems: "flex-start",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "translateX(5px)"
                }
              }}>
                <Box sx={{
                  display: "flex", 
                  alignItems: "flex-start", 
                  justifyContent: "center", 
                  width: "35px", 
                  height: "35px", 
                  flexShrink: 0,
                  mr: 2,
                  pt: "3px"
                }}>    
                  <IoIosArrowRoundForward color="#e1aa43" size="28px" /> 
                </Box>    
                <Typography sx={{
                  color: "#ffffff", 
                  fontSize: "0.9rem",
                  lineHeight: 1.4,
                  flex: 1,
                  paddingTop: "6px"
                }}>
                  {item}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}