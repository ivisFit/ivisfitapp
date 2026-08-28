import { Box } from "@mui/material"
import { Bloque } from "./components/Bloque"

import Fabiana from "../../../public/imgs/transformaciones/Fabiana.jpeg"
import Fabiana2 from "../../../public/imgs/transformaciones/Fabiana2.jpeg"
import Fabiana3 from "../../../public/imgs/transformaciones/Fabiana3.jpeg"
import Pablo from "../../../public/imgs/transformaciones/Pablo.png"
import Pablo2 from "../../../public/imgs/transformaciones/Pablo2.png"
import Omar from "../../../public/imgs/transformaciones/omar.jpeg"
import Omar2 from "../../../public/imgs/transformaciones/omar2.jpeg"
import Omar3 from "../../../public/imgs/transformaciones/omar3.jpeg"

import Gaby from "../../../public/imgs/transformaciones/Gaby.png"

export const Transformaciones = () => {
  return (
    <Box sx={{padding: "40px 0", width:"100%", backgroundColor:"#090708", display:{xs:"none",lg:"flex"}, justifyContent:"center", flexDirection:"column", alignItems:"center" }}>
        <Box sx={{display:"flex", justifyContent:"center", flexDirection:"column", alignItems:"center", marginTop:"5vh"}}>
            <h3 style={{color: "#e1aa43", letterSpacing:"0.3rem", fontFamily:"Source Sans Pro"}}>EDUCA TU MENTE. CAMBIA TU CUERPO</h3>
            <h2 style={{color: "#ffffff", letterSpacing:"0.1rem", fontSize:"3.5rem"}}>Transformaciones de Alumnos</h2>
        </Box>

        <Box sx={{display:"flex", justifyContent:"center", alignItems:"center", flexDirection:"column", gap:"1.5vw", width:"100%", height:"100%"}}>
            <Box sx={{display:"flex", gap:"1.5vw", alignItems:"center", flexDirection:"row",boxSizing:"border-box"}}>
                <Bloque img={Fabiana}/>
                <Bloque img={Pablo}/>
                <Bloque img={Omar}/>
            </Box>
            <Box sx={{display:"flex", gap:"1.5vw", alignItems:"center", flexDirection:"row",boxSizing:"border-box"}}>
                <Bloque img={Gaby}/>
                <Bloque img={Fabiana2}/>
                <Bloque img={Omar2}/>
            </Box>
            <Box sx={{display:"flex", gap:"1.5vw", alignItems:"center", flexDirection:"row",boxSizing:"border-box"}}>
                <Bloque img={Pablo2}/>
                <Bloque img={Omar3}/>
                <Bloque img={Fabiana3}/>
            </Box>
        </Box>

    </Box>
  )
}