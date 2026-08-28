"use client";

import { Box } from "@mui/material"
import { FaArrowRight } from "react-icons/fa"
import styled from "styled-components"
import { Title2 } from "./components/title2"
import Link from "next/link"
import type { Plan } from "../../data/plans"
import { HomeImg } from "@/features/landing/cms/HomeCmsFields";

const defaultBackgroundImage = "/imgs/imagenPlanTotal.jpg";

const List = styled.ul`
  list-style: disc;
  padding: 0.8rem 2.3rem;
  display: flex;
  flex-direction: column;
  color: white;
`;

const Button = styled.button`
  background-color: var(--brand-gold);
  color: white;
  border: none;
  padding: 2.5vh 5vw;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.4vw;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  z-index: 3;
  &:hover {
    background-color: var(--brand-gold-strong);
  }
`;

const listItems = [
  "Acceso completo a la plataforma.",
  "Rutinas personalizadas para gym o casa según tu nivel, objetivos y equipo disponible.",
  "Guía nutricional flexible y acorde a tus objetivos.",
  "Videos explicativos de técnica.",
  "1 clase mensual online en vivo.",
] as const;

type PlanTotal2Props = {
  onlinePlan: Plan;
};

export const PlanTotal2 = ({ onlinePlan }: PlanTotal2Props) => {
  const plan = onlinePlan;

  return (
    <Box sx={{minHeight:"auto", py: 3, width:"100%", background:"linear-gradient(160deg, var(--brand-dark) 0%, var(--brand-dark-soft) 60%, var(--brand-dark) 100%)" , display:{xs:"flex", lg:"none"}, alignItems:"center", justifyContent:"center"}}>
      <Box sx={{display:"flex", justifyContent:"center", alignItems:"center", width:"100%"}}>
        <Box sx={{display:"flex", justifyContent:"center", alignItems:"center", flexDirection:"column", width:"100%", position:"relative",boxSizing:"border-box"}}>
          <Box sx={{border:"1px solid var(--brand-gold)", width:"90%", height:"36vh", maxHeight:"320px", marginTop:"15px", overflow:"hidden", position:"relative", "& img": { objectFit: "cover" } }}>
            <HomeImg
              field="planTotal2.backgroundImage"
              fallback={defaultBackgroundImage}
              alt="fondoDerechaImagen"
              fill
              sizes="90vw"
            />
          </Box>
          
          <Box sx={{position:"relative" ,border:"1px solid var(--brand-gold)", width:"90%", minHeight:"auto", py:"2.5rem", display:"flex", justifyContent:"space-around", alignItems:"center", flexDirection:"column"}}>
                  <Title2 />
                  <Box sx={{width:"100%", marginTop: 0}}>
                    <List style={{fontSize:"0.9rem", width:"100%", paddingTop:"2.5rem", display:"flex", justifyContent:"space-between"}}>
                      {listItems.map((item) => (
                        <Box key={item} sx={{display:"flex", alignItems:"center", gap:"1rem"}}>
                          <FaArrowRight style={{color:"var(--brand-gold)", minWidth:"20px"}}/>
                          <li style={{padding:"0.65rem 0", listStyle:"none"}}>{item}</li>
                        </Box>
                      ))}
                      <Box sx={{display:"flex", alignItems:"center", gap:"1rem"}}>
                        <FaArrowRight style={{color:"var(--brand-gold)", minWidth:"20px"}}/>
                        <li style={{padding:"0.65rem 0", listStyle:"none"}}>Check-ins regulares. Inversión: {plan.investment}.</li>
                      </Box>
                    </List>
                  </Box>
                    <Link href={plan.route} style={{textDecoration:"none", cursor:"pointer", color:"white", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem"}}>
                   <Button style={{marginBottom:"15px", fontSize:"0.9rem"}}>
                      Quiero empezar <FaArrowRight />
                  </Button>
                    </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
