import { Box } from "@mui/material"

export const Title = () => {
  return (
    
  <Box 
    sx={{
      backgroundColor: "var(--brand-gold)",
      color: "white",
      width: '320px',
      maxWidth: 'calc(100% - 70px)',
      height: '50px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: '10vh',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: 'clamp(1.65rem, 2.2vw, 2.4rem)',
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
        borderLeft: '26px solid var(--brand-gold)',
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
        borderRight: '26px solid var(--brand-gold)', // Cambiado a borderRight
      }
    }}
  >
    PLAN ONLINE
  </Box>
  )
}