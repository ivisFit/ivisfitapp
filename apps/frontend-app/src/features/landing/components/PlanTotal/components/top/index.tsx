import { Box } from "@mui/material"

export const Top = () => {
  return (
    
  <Box 
    sx={{
      backgroundColor: "var(--brand-gold-soft)",
      color: "white",
      transform: 'rotate(90deg)',
      width: '90px',
      height: '40px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top:"24px",
      fontSize: '1.8rem',
      fontWeight: 'bold',
      '&::after': {
        content: '""',
        position: 'absolute',
        right: '-25px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 0,
        height: 0,
        borderTop: '20px solid transparent',
        borderBottom: '20px solid transparent',
        borderLeft: '25px solid var(--brand-gold-soft)',
      }
    }}
  >
    TOP
  </Box>

  )
}