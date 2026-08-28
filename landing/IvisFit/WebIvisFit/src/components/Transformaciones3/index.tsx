import { Box } from "@mui/material"
import { Bloque } from "./components/Bloque"

import Fabiana from "../../../public/imgs/transformaciones/Fabiana.jpeg"
import Fabiana2 from "../../../public/imgs/transformaciones/Fabiana2.jpeg"
import Pablo from "../../../public/imgs/transformaciones/Pablo.png"
import Pablo2 from "../../../public/imgs/transformaciones/Pablo2.png"
import Omar from "../../../public/imgs/transformaciones/omar.jpeg"
import Omar2 from "../../../public/imgs/transformaciones/omar2.jpeg"
import Omar3 from "../../../public/imgs/transformaciones/omar3.jpeg"

import Gaby from "../../../public/imgs/transformaciones/Gaby.png"
import { Bloque2 } from "./components/Bloque2"

export const Transformaciones3 = () => {
  return (
    <Box sx={{padding:"40px 0", width:"100%", backgroundColor:"#090708", display:{xs:"flex", smmid:"none"}, justifyContent:"center", flexDirection:"column", alignItems:"center" }}>
        <Box sx={{display:{xs:"none", xssmm:"flex"}, justifyContent:"center", flexDirection:"column", alignItems:"center"}}>
            <h3 style={{textAlign:"center", color: "#e1aa43", letterSpacing:"0.3rem", fontFamily:"Source Sans Pro", fontSize:"1.1rem"}}>EDUCA TU MENTE. CAMBIA TU CUERPO</h3>
            <h2 style={{color: "#ffffff", letterSpacing:"0.1rem", fontWeight:"lighter",textAlign:"center", fontSize:"1.7rem"}}>Transformaciones de Alumnos</h2>
        </Box>
        <Box sx={{display:{xs:"flex", xssmm:"none"}, justifyContent:"center", flexDirection:"column", alignItems:"center"}}>
            <h3 style={{color: "#e1aa43", letterSpacing:"0.3rem", fontFamily:"Source Sans Pro", fontSize:"2.6vw", padding:"0 15px"}}>EDUCA TU MENTE. CAMBIA TU CUERPO</h3>
            <h2 style={{color: "#ffffff", letterSpacing:"0.1rem", fontWeight:"lighter",textAlign:"center", fontSize:"1.6rem"}}>Transformaciones de Alumnos</h2>
        </Box>

        <Box sx={{display:{xs:"none", xssmm:"flex"}, justifyContent:"center", alignItems:"center", flexDirection:"column", gap:"1.5vw", width:"100%", height:"90%"}}>
            <Box sx={{display:"flex", gap:"1.5vw", alignItems:"center", flexDirection:"row",boxSizing:"border-box"}}>
                <Bloque img={Fabiana}/>
                <Bloque img={Pablo}/>
            </Box>
            <Box sx={{display:"flex", gap:"1.5vw", alignItems:"center", flexDirection:"row",boxSizing:"border-box"}}>
                <Bloque img={Gaby}/>
                <Bloque img={Omar2}/>
            </Box>
            <Box sx={{display:"flex", gap:"1.5vw", alignItems:"center", flexDirection:"row",boxSizing:"border-box"}}>
                <Bloque img={Fabiana2}/>
                <Bloque img={Omar}/>
            </Box>

            <Box sx={{display:"flex", gap:"1.5vw", alignItems:"center", flexDirection:"row",boxSizing:"border-box"}}>
                <Bloque img={Pablo2}/>
                <Bloque img={Omar3}/>
            </Box>
        </Box>
        <Box sx={{display:{xs:"flex", xssmm:"none"}, justifyContent:"center", alignItems:"center", flexDirection:"column", gap:"1.5vw", width:"100%", height:"100%", marginBottom:"20px"}}>
            <Box sx={{display:"flex", gap:"1.5vw", alignItems:"center", flexDirection:"row",boxSizing:"border-box"}}>
                <Bloque2 img={Fabiana}/>
            </Box>
            <Box sx={{display:"flex", gap:"1.5vw", alignItems:"center", flexDirection:"row",boxSizing:"border-box"}}>
                
                <Bloque2 img={Pablo}/>
            </Box>
            <Box sx={{display:"flex", gap:"1.5vw", alignItems:"center", flexDirection:"row",boxSizing:"border-box"}}>
                <Bloque2 img={Gaby}/>
            </Box>
            <Box sx={{display:"flex", gap:"1.5vw", alignItems:"center", flexDirection:"row",boxSizing:"border-box"}}>
                <Bloque2  img={Omar2}/>
            </Box>
            <Box sx={{display:"flex", gap:"1.5vw", alignItems:"center", flexDirection:"row",boxSizing:"border-box"}}>
                <Bloque2 img={Fabiana2}/>
            </Box>
            <Box sx={{display:"flex", gap:"1.5vw", alignItems:"center", flexDirection:"row",boxSizing:"border-box"}}>
                <Bloque2 img={Omar}/>
            </Box>

            <Box sx={{display:"flex", gap:"1.5vw", alignItems:"center", flexDirection:"row",boxSizing:"border-box"}}>
                <Bloque2 img={Pablo2}/>
            </Box>
            <Box sx={{display:"flex", gap:"1.5vw", alignItems:"center", flexDirection:"row",boxSizing:"border-box"}}>
                <Bloque2 img={Omar3}/>
            </Box>
        </Box>
    </Box>
  )
}