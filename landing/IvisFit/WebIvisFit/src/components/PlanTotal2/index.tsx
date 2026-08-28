import { Box } from "@mui/material"
import imagenFondo from "../../../public/imgs/imagenPlanTotal.jpg"
import { FaArrowRight } from "react-icons/fa"
import styled from "styled-components"
import { Title2 } from "./components/title2"
import { Link } from "react-router-dom"
import { getPlanById } from "../../data/plans"

export const PlanTotal2 = () => {
  const plan = getPlanById("online");

  const List = styled.ul`
    list-style: disc;
    padding: 0.8rem 2.3rem;
    display: flex;
    flex-direction: column;
    color: white;
  `;
  const Button = styled.button`
  background-color: #e1aa43;
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
    background-color: #a0831c;
  }
`;

  return (
    <Box sx={{minHeight:"150vh", width:"100%", background:"linear-gradient(160deg, #090708 0%, #14110f 60%, #090708 100%)" , display:{xs:"flex", lg:"none"}, alignItems:"center", justifyContent:"center"}}>
      <Box sx={{display:"flex", justifyContent:"center", alignItems:"center", width:"100%", minHeight:"150vh"}}>
        <Box sx={{display:"flex", justifyContent:"center", alignItems:"center", flexDirection:"column", width:"100%", minHeight:"145vh", position:"relative",boxSizing:"border-box"}}>
          <Box sx={{border:"1px solid #e1aa43", width:"90%", minHeight:"48vh", marginTop:"15px"}}>
            <img style={{width:"100%", height:"100%", objectFit:"cover"}} src={imagenFondo} alt="fondoDerechaImagen" />
          </Box>
          
          <Box sx={{position:"relative" ,border:"1px solid #e1aa43", width:"90%", minHeight:"92vh", display:"flex", justifyContent:"space-around", alignItems:"center", flexDirection:"column"}}>
                  <Title2 />
                  <Box sx={{width:{xs:"100%", xssm:"100%", marginTop:"7vh"}}}>
                    <List style={{fontSize:"0.9rem", width:"100%" , paddingTop:"20vh", display:"flex",justifyContent:"space-between"}}>
                      <Box sx={{display:"flex", alignItems:"center", gap:"1rem"}}>
                        <FaArrowRight style={{color:"#E1AA43",  minWidth:"20px"}}/>
                        <li style={{padding:" 0",listStyle:"none"}}>  Acceso completo a la plataforma.</li>
                      </Box>
                      <Box sx={{display:"flex", alignItems:"center", gap:"1rem"}}>
                        <FaArrowRight style={{color:"#E1AA43",  minWidth:"20px"}}/>
                        <li style={{padding:"6% 0",listStyle:"none"}}>  Rutinas personalizadas para gym o casa según tu nivel, objetivos y equipo disponible.</li>
                      </Box>
                      <Box sx={{display:"flex", alignItems:"center", gap:"1rem"}}>
                        <FaArrowRight style={{color:"#E1AA43",  minWidth:"20px"}}/>
                        <li style={{padding:"6% 0",listStyle:"none"}}>  Guía nutricional flexible y acorde a tus objetivos.</li>
                      </Box>
                      <Box sx={{display:"flex", alignItems:"center", gap:"1rem"}}>
                        <FaArrowRight style={{color:"#E1AA43" , minWidth:"20px"}}/>
                        <li style={{padding:"6% 0",listStyle:"none"}}>  Videos explicativos de técnica.</li>
                      </Box>
                      <Box sx={{display:"flex", alignItems:"center", gap:"1rem"}}>
                        <FaArrowRight style={{color:"#E1AA43" , minWidth:"20px"}}/>
                        <li style={{padding:"6% 0",listStyle:"none"}}>  1 clase mensual online en vivo.</li>
                      </Box>
                      <Box sx={{display:"flex", alignItems:"center", gap:"1rem"}}>
                        <FaArrowRight style={{color:"#E1AA43" , minWidth:"20px"}}/>
                        <li style={{padding:"6% 0",listStyle:"none"}}>  Check-ins regulares. Inversión: {plan.investment}.</li>
                      </Box>
                    </List>
                  </Box>
                    <Link to={plan.route} style={{textDecoration:"none", cursor:"pointer", color:"white", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem"}}>
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
