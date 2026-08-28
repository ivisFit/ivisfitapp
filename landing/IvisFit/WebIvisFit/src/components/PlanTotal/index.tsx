import { Box } from "@mui/material"
import imagenFondo from "../../../public/imgs/imagenPlanTotal.jpg"
import { Top } from "./components/top"
import { Title } from "./components/title"
import { FaArrowRight } from "react-icons/fa"
import styled from "styled-components"
import { Link } from "react-router-dom"
import { getPlanById } from "../../data/plans"

export const PlanTotal = () => {
  const plan = getPlanById("online");

  

  const List = styled.ul`
    list-style: disc;
    padding: 0.8rem 5rem;
    display: flex;
    flex-direction: column;
    color: white;
    font-size:1.2rem;
  `;
  const Button = styled.button`
  background-color: #e1aa43;
  color: white;
  border: none;
  padding: 2.5vh 5vw;
  border-radius: 8px;
  font-weight: bold;
  font-size:1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  z-index: 3;
  &:hover {
    background-color: #a0831c;
  }
`;

  return (
    <Box sx={{minHeight:"118vh", width:"100%", background:"linear-gradient(160deg, #090708 0%, #14110f 60%, #090708 100%)", display:{xs:"none", lg:"flex"} }}>
      <Box sx={{display:"flex", justifyContent:"center", alignItems:"center", width:"100%", minHeight:"118vh"}}>
        <Box sx={{ marginTop:"45px", display:"flex", justifyContent:"center", alignItems:"stretch", width:"100%", minHeight:"calc(118vh - 45px)", position:"relative",boxSizing:"border-box"}}>
          <Box sx={{border:"1px solid #e1aa43", width:"43%", minHeight:"calc(118vh - 45px)"}}>
            <img style={{width:"100%", height:"100%", objectFit:"cover"}} src={imagenFondo} alt="fondoDerechaImagen" />
          </Box>
          <Box sx={{display:"flex", justifyContent:"center", width:"100%", minHeight:"calc(118vh - 45px)", position:"absolute", top:"0", boxSizing:"border-box"}}>
            <Top />
          </Box>
          <Box sx={{border:"1px solid #e1aa43", width:"43%", minHeight:"calc(118vh - 45px)", display:"flex", justifyContent:"space-around", alignItems:"center", flexDirection:"column", position:"relative"}}>
                  <Title />
                  <List style={{fontSize:"1.4vw", paddingTop:"20vh"}}>
                    <Box sx={{display:"flex", alignItems:"center", gap:"1rem"}}>
                      <FaArrowRight style={{color:"#E1AA43" , minWidth:"20px"}}/>
                      <li style={{padding:"6% 0",listStyle:"none", fontSize:"1.2rem"}}>  Acceso completo a la plataforma de entrenamiento</li>
                    </Box>
                    <Box sx={{display:"flex", alignItems:"center", gap:"1rem"}}>
                      <FaArrowRight style={{color:"#E1AA43"}}/>
                      <li style={{padding:"6% 0",listStyle:"none", fontSize:"1.2rem"}}>  Rutinas personalizadas para gym o casa según tu nivel y objetivos</li>
                    </Box>
                    <Box sx={{display:"flex", alignItems:"center", gap:"1rem"}}>
                      <FaArrowRight style={{color:"#E1AA43", minWidth:"20px"}}/>
                      <li style={{padding:"6% 0",listStyle:"none", fontSize:"1.2rem"}}>  Guía nutricional flexible y acorde a tus metas</li>
                    </Box>
                    <Box sx={{display:"flex", alignItems:"center", gap:"1rem"}}>
                      <FaArrowRight style={{color:"#E1AA43" , minWidth:"20px"}}/>
                      <li style={{padding:"6% 0",listStyle:"none", fontSize:"1.2rem"}}>  Evaluación inicial, registro de progresos y check-ins regulares</li>
                    </Box>
                    <Box sx={{display:"flex", alignItems:"center", gap:"1rem"}}>
                      <FaArrowRight style={{color:"#E1AA43" , minWidth:"20px"}}/>
                      <li style={{padding:"6% 0",listStyle:"none", fontSize:"1.2rem"}}>  Videos explicativos de técnica y 1 clase mensual online en vivo</li>
                    </Box>
                    <Box sx={{display:"flex", alignItems:"center", gap:"1rem"}}>
                      <FaArrowRight style={{color:"#E1AA43" , minWidth:"20px"}}/>
                      <li style={{padding:"6% 0",listStyle:"none", fontSize:"1.2rem"}}>  Inversión mensual recurrente: {plan.investment}</li>
                    </Box>
                    
                  </List>
                  <Link to={plan.route} style={{textDecoration:"none", cursor:"pointer", color:"white", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem"}}>
                  <Button style={{marginBottom:"15px"}}>
                    
                    Quiero empezar <FaArrowRight />
                  </Button>
                  </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
