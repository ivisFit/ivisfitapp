import { Box, Typography, styled } from '@mui/material';

const InfiniteScrollBar = ({ text = "Texto deslizante", repeat = 10, speed = 300, spacing = 5 }) => {
  // Crear el texto repetido con espaciado
  const spacer = '\u00A0'.repeat(spacing); // Espacio no rompible
  
  // Separador con espaciado usando un Typography para el punto grande
  const BulletSeparator = () => (
    <Typography 
      component="span" 
      sx={{ 
        fontSize: '15vh', // Tamaño más grande para el punto
        verticalAlign: 'middle', // Alineación vertical
        mx: "2rem", // Margen horizontal
        lineHeight: 1 // Ajuste de línea
      }}
    >
      •
    </Typography>
  );

  const repeatedText = Array(repeat).fill(text).map((item, index) => (
    <span key={index}>
      {spacer}
      <BulletSeparator />
      {spacer}
      {item}
    </span>
  ));

  // Componente estilizado para la animación
  const ScrollBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    width: '100%',
    backgroundColor: "#ffffff",
    color: "#7F6147",
    padding: theme.spacing(3, 0),
    position: 'relative',
  }));

  const ScrollingText = styled(Typography)(({ theme }) => ({
    display: 'inline-block',
    whiteSpace: 'nowrap',
    animation: `scroll ${speed}s linear infinite`,
    '@keyframes scroll': {
      '0%': {
        transform: 'translateX(0)',
      },
      '100%': {
        transform: 'translateX(-100%)',
      },
    },
    paddingRight: theme.spacing(2), // Espacio adicional al final
  }));

  // Texto duplicado para efecto continuo
  const infiniteText = (
    <>
      {repeatedText}
      {repeatedText}
    </>
  );

  return (
    <ScrollBox>
      <ScrollingText variant="h6" style={{ fontSize: "6vh" }}>
        {infiniteText}
      </ScrollingText>
    </ScrollBox>
  );
};

export default InfiniteScrollBar;