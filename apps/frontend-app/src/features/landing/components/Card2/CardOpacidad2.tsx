// TrainingCard.tsx
import styled from "styled-components";
import { FaArrowRight } from "react-icons/fa";
import { Box } from "@mui/material";

const CardContainer = styled.div`
  width: 90%;
  min-height: 800px;
  background-size: cover;
  background-position: center;
  color: white;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  position: relative;
  margin: 1rem auto;

  &::before {
    content: "";
    position: absolute;
    inset: 0; 
    background: rgba(214, 165, 10, 0.5); /* Amarillo más oscuro con 50% de opacidad */
    z-index: 1; 
  }

  > * {
    z-index: 2; 
  }
`;

const Badge = styled.div`
  font-size: 3vw;
  background-color: var(--brand-gold-soft);
  color: white;
  font-weight: bold;
  padding: 0.25rem 2.5rem;
  border-radius: 0 0 8px 8px;
  width: 50%;
  height: 4%;
  position: absolute;
  top: 0;
  text-align: center;

`;

const Title = styled.h2`
  margin: 0;
  font-size: 2rem;
  font-weight: lighter;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }

  @media (min-width: 1024px) {
    font-size: 3rem;
  }
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.9rem;
  font-weight: lighter;
  opacity: 0.8;
  color: var(--brand-gold-soft);
  text-align: center;

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const Price = styled.div`
  font-weight: bold;
  font-weight: normal;
`;

const Period = styled.span`
  font-size: 0.8rem;
  margin-left: 0.5rem;
  font-weight: normal;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;

  @media (min-width: 768px) {
    padding: 0 2rem;
    font-size: 1rem;
  }

  @media (min-width: 1024px) {
    padding: 0 3rem;
    font-size: 0.85rem;
  }
`;

const ListItem = styled.li`
  padding: 0.5rem 0;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
`;

const Button = styled.button`
  margin-top: auto;
  background-color: #474706;
  opacity: 0.8;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
  justify-content: center;

  &:hover {
    background-color: #63630f;
  }

  @media (min-width: 768px) {
    width: auto;
  }
`;

type CardOpacidad2Props = {
  imagen: string;
};

export const CardOpacidad2 = ({ imagen }: CardOpacidad2Props) => {
  return (
    <CardContainer style={{ backgroundImage: `url(${imagen})` }}>
      <Box sx={{maxWidth:"460px", padding:"2rem"}}>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Badge className="badge">PAGO MENSUAL</Badge>
        </Box>
        <Title>Entrenamiento</Title>
        <Subtitle>PLAN 100% PERSONALIZADO</Subtitle>

        <div
          style={{
            color: "var(--brand-gold-soft)",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: "bold",
            letterSpacing: "0.1rem",
            padding: "15% 0",
            textAlign: "center",
            width: "100%",
          }}
        >
          <Price>
            $48 USD<Period>1 MES</Period>
          </Price>
          <Price>
            $130 USD<Period>3 MESES</Period>
          </Price>
        </div>

        <List>
          <ListItem>
            <FaArrowRight size={14} /> Meet de 30 minutos para conocerte y
            conocer tus objetivos.
          </ListItem>
          <ListItem>
            <FaArrowRight size={14} /> Rutina de entrenamiento para GYM/CASA
            duración 4 semanas para que tu completes cuando lo realices.
          </ListItem>
          <ListItem>
            <FaArrowRight size={14} /> Acompañamiento constante para ayudarte y
            guiarte en cada paso de tu transformación.
          </ListItem>
          <ListItem>
            <FaArrowRight size={14} /> Enlace a videos demostrativos de los
            ejercicios.
          </ListItem>
          <ListItem>
            <FaArrowRight size={14} /> 1 Clase mensual.
          </ListItem>
          <ListItem>
            <FaArrowRight size={14} /> Chequeo para ver tu evolución.
          </ListItem>
        </List>

          <Box sx={{width:"100%", display:"flex", justifyContent:"center", alignItems:"center", marginTop:"2rem"}}>
        <Button>
          Quiero empezar <FaArrowRight />
        </Button>
          </Box>
      </Box>
    </CardContainer>
  );
};
