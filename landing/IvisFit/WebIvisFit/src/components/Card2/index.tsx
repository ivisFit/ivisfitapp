// TrainingCard.tsx
import styled from "styled-components";
import { FaArrowRight } from "react-icons/fa";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const CardContainer = styled.div`
  width: 90%;
  max-width: 520px;
  min-height: 760px;
  background-size: cover;
  background-position: center;
  color: white;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 18px;
  border: 1px solid rgba(225, 170, 67, 0.2);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22);
  position: relative;
  overflow: hidden;
  margin: 1rem auto;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(9, 7, 8, 0.5) 0%,
      rgba(9, 7, 8, 0.68) 55%,
      rgba(9, 7, 8, 0.88) 100%
    );
    z-index: 1;
  }

  > * {
    z-index: 2;
  }
`;

const Badge = styled.div`
  font-size: clamp(0.7rem, 2.2vw, 0.95rem);
  background-color: rgba(225, 170, 67, 0.95);
  color: #1f1402;
  font-weight: 800;
  letter-spacing: 0.1rem;
  text-transform: uppercase;
  padding: 0.4rem 1.4rem;
  border-radius: 999px;
  width: fit-content;
  height: auto;
  min-height: 2rem;
  position: absolute;
  top: 1.1rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-sizing: border-box;
  box-shadow: 0 8px 20px rgba(225, 170, 67, 0.35);
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
  color: #fdc915;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const Price = styled.div`
  font-weight: bold;
  font-weight: normal;
  color: white;
`;

const Period = styled.span`
  font-size: 0.8rem;
  margin-left: 0.5rem;
  font-weight: normal;
  color: white;
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
  background-color: #fdc915;
  color: #1f1402;
  border: none;
  padding: 0.9rem 1.6rem;
  border-radius: 999px;
  font-weight: 800;
  letter-spacing: 0.03rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease,
    box-shadow 0.3s ease;
  width: 100%;
  justify-content: center;
  box-shadow: 0 12px 26px rgba(253, 201, 21, 0.28);

  &:hover {
    background-color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.25);
  }

  @media (min-width: 768px) {
    width: auto;
  }
`;

type Card2Props = {
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

export const Card2 = ({imagen, titulo, subtitulo, precio1, precio2, tiempo1, tiempo2, arreglo, link, badge = "PAGO MENSUAL"}: Card2Props) => {

const navigate = useNavigate();

  const handleClick = () => {
    navigate(`${link}`);
  }

  return (
    <CardContainer style={{ backgroundImage: `url(${imagen})` }}>
      <Box sx={{maxWidth:"460px", padding:"2rem", display:"flex", flexDirection:"column",  justifyContent:"space-between"}}>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Badge className="badge">{badge}</Badge>
        </Box>
        <Title>{titulo}</Title>
        <Subtitle>{subtitulo}</Subtitle>

        <div
          style={{
            color: "#fdc915",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: "bold",
            letterSpacing: "0.1rem",
            padding: "15% 0",
            textAlign: "center",
            width: "100%",
          }}
        >
          <Price>
            {precio1}<Period>{tiempo1}</Period>
          </Price>
          <Price>
            {precio2}<Period>{tiempo2}</Period>
          </Price>
        </div>

        <List>
                {
                  arreglo.map((item, index) => (
                    <ListItem key={index}>
                      <FaArrowRight size={14} style={{ marginTop:"3px", minWidth: 14, minHeight: 14 }} /> {item}
                    </ListItem>
                  ))
                }
              </List>

          <Box sx={{width:"100%", display:"flex", justifyContent:"center", alignItems:"center", marginTop:"2rem"}}>
            <Button onClick={handleClick}>
              Quiero empezar <FaArrowRight />
            </Button >
          </Box>
      </Box>
    </CardContainer>
  );
};
