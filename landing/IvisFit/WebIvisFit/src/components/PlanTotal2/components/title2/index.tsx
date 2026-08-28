import { Box } from "@mui/material"

export const Title2 = () => {
  return (
    
  <Box 
    sx={{
      backgroundColor: "#e1aa43",
      color: "white",
      width: '280px',
      maxWidth: 'calc(100% - 60px)',
      height: '50px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: '10vh',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: 'clamp(1.45rem, 4.6vw, 2.1rem)',
      fontWeight: 'bold',
      fontFamily: "sans-serif",
      whiteSpace: 'nowrap',
      px: '1rem',
      boxSizing: 'border-box',
      // Triángulo derecho (original)
      '&::after': {
        content: '""',
        position: 'absolute',
        right: '-25px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 0,
        height: 0,
        borderTop: '26px solid transparent',
        borderBottom: '26px solid transparent',
        borderLeft: '26px solid #e1aa43',
      },
      // Triángulo izquierdo (nuevo)
      '&::before': {
        content: '""',
        position: 'absolute',
        left: '-25px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 0,
        height: 0,
        borderTop: '26px solid transparent',
        borderBottom: '26px solid transparent',
        borderRight: '26px solid #e1aa43', // Cambiado a borderRight
      }
    }}
  >
    PLAN ONLINE
  </Box>
  )
}