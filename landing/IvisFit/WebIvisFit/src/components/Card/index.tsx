// TrainingCard.tsx
import styled from 'styled-components';
import { FaArrowRight } from 'react-icons/fa';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CardContainer = styled.div`
  width: 100%;
  max-width: 400px;
  min-width: 280px;
  background-size: cover;
  background-position: center;
  color: white;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 18px;
  border: 1px solid rgba(225, 170, 67, 0.18);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.18);
  position: relative;
  overflow: hidden;
  margin: 1rem auto;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.35s ease;

  min-height: 720px;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(9, 7, 8, 0.55) 0%,
      rgba(9, 7, 8, 0.7) 55%,
      rgba(9, 7, 8, 0.88) 100%
    );
    z-index: 1;
    border-radius: 18px;
    transition: background 0.35s ease;
  }

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 28px 60px rgba(0, 0, 0, 0.32);
    border-color: rgba(225, 170, 67, 0.55);
  }

  &:hover::before {
    background: linear-gradient(
      180deg,
      rgba(9, 7, 8, 0.45) 0%,
      rgba(9, 7, 8, 0.62) 55%,
      rgba(9, 7, 8, 0.9) 100%
    );
  }

  > * {
    z-index: 2;
  }

  @media (max-width: 768px) {
    width: 85vw;
    height: auto;
    min-height: 500px;
    padding: 1.2rem;
  }
`;

const Badge = styled.div`
  background-color: rgba(225, 170, 67, 0.95);
  color: #1f1402;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12rem;
  text-transform: uppercase;
  padding: 0.4rem 1.4rem;
  border-radius: 999px;
  width: fit-content;
  position: absolute;
  top: 1.2rem;
  box-shadow: 0 8px 20px rgba(225, 170, 67, 0.35);

  @media (max-width: 480px) {
    font-size: 0.65rem;
    padding: 0.35rem 1.1rem;
  }
`;

const Title = styled.h2`
  margin: 1.8rem 0 0.5rem 0;
  font-size: 1.8rem;
  font-weight: lighter;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 2rem;
  }

  @media (min-width: 1024px) {
    font-size: 2.2rem;
  }
`;

const Subtitle = styled.p`
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  font-weight: lighter;
  opacity: 0.8;
  color: #fdc915;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const Price = styled.div`
  font-weight: bold;
`;

const Period = styled.span`
  font-size: 0.8rem;
  margin-left: 0.5rem;
  font-weight: normal;
`;

const PriceContainer = styled.div`
  color: #fdc915;
  font-size: 1.8rem;
  font-weight: bold;
  letter-spacing: 0.1rem;
  padding: 1rem 0;
  text-align: center;
  width: 100%;
  margin: 0.5rem 0;

  @media (min-width: 768px) {
    font-size: 2.2rem;
    padding: 1.2rem 0;
  }
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 1.2rem 0;
  font-size: 1.1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.4rem;
  width: 85%;

  @media (min-width: 768px) {
    font-size:  1.1rem;
    gap: 0.5rem;
  }
`;

const ListItem = styled.li`
  padding: 0.3rem 0;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  line-height: 1.3;
`;

const Button = styled.button`
  background-color: #fdc915;
  color: #1f1402;
  border: none;
  padding: 0.9rem 1rem;
  border-radius: 999px;
  font-weight: 800;
  letter-spacing: 0.03rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease,
    box-shadow 0.3s ease;
  justify-content: center;
  width: 80%;
  margin-top: auto;
  margin-bottom: 0.5rem;
  box-shadow: 0 12px 26px rgba(253, 201, 21, 0.28);

  &:hover {
    background-color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.25);
  }

  @media (max-width: 768px) {
    width: 90%;
    padding: 0.9rem 1rem;
  }
`;

type CardProps = {
  imagen: string;
  titulo: string;
  subtitulo: string;
  precio1: string;
  precio2?: string;
  tiempo1?: string;
  tiempo2?: string;
  arreglo: string[];
  link: string;
  badge?: string;
};

export const Card = ({imagen, titulo, subtitulo, precio1, precio2, tiempo1, tiempo2, arreglo, link, badge = "PAGO MENSUAL"}: CardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`${link}`);
  }

  return (
    <CardContainer style={{backgroundImage:`url(${imagen})`}}>	
      <Box sx={{width:"100%", display:"flex", justifyContent:"center", alignItems:"center"}}>
        <Badge>{badge}</Badge>
      </Box>
      <Title>{titulo}</Title>
      <Subtitle>{subtitulo}</Subtitle>

      <PriceContainer>
        <Price style={{color:"white"}}>{precio1}<Period>{tiempo1}</Period></Price>
        <Price style={{color:"white"}}>{precio2}<Period>{tiempo2}</Period></Price>
      </PriceContainer>

      <List>
        {arreglo.map((item, index) => (
          <ListItem key={index}>
            <FaArrowRight size={12} style={{ marginTop:"3px", minWidth: 12, flexShrink: 0 }} /> 
            <span>{item}</span>
          </ListItem>
        ))}
      </List>

      <Button onClick={handleClick}>
        Quiero empezar <FaArrowRight />
      </Button>
    </CardContainer>
  );
};