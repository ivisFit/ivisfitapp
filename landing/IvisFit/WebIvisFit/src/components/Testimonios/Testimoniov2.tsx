import { Box, Typography } from "@mui/material"

export const Testimoniov2 = () => {
  return (
    <Box sx={{
      position: 'relative',
      pl: 4, // Espacio para la barra amarilla
      my: 4, // Margen vertical
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: '4px',
        backgroundColor: '#FFD700', // Amarillo dorado
        borderRadius: '2px'
      }
    }}>
      <Typography variant="h6" component="p" sx={{ 
        fontWeight: 'bold',
        mb: 1,
        fontStyle: 'italic',
        fontSize:"2vh",
      }}>
        Julieta B.
      </Typography>
      
      <Typography component="p" sx={{ 
        mb: 2,
        lineHeight: 1.6,
        fontSize:"2vh",
      }}>
        <Box component="span" sx={{ fontStyle: 'italic' , color:"#FFD700", }}>99</Box> Fitness Within is a very special place. If you have a goal they will give you the tools, support and accountability to achieve it. The space is meticulously clean and each class is organized and fast paced.
      </Typography>
      
      <Typography component="p" sx={{ 
        mb: 2,
        lineHeight: 1.6,
        fontSize:"2vh",
      }}>
        All the trainers are extremely knowledgeable about nutrition and fitness. They make sure your form is correct and are happy to make any modifications when necessary. I have had Domenica's my coach for the past 3 months and have accomplished goals I have never thought possible.
      </Typography>
      
      <Typography component="p" sx={{ 
        lineHeight: 1.6,
        fontSize:"2vh",
      }}>
        Truly life changing. Best decision I made was to join. It is a family friendly environment where they make everyone feel welcome.
      </Typography>
    </Box>
  )
}