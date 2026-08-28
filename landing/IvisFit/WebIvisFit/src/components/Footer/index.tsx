import { Box } from "@mui/material"
import imagen from "../../../public/imgs/LogoFooter.png";
import instagram from "../../../public/imgs/instagram.png";
import { CONTACT_EMAIL, DISPLAY_PHONE, INSTAGRAM_URL, WEBSITE_URL } from "../../data/plans";


export const Footer = () => {
  return (
    <Box>
        <Box sx={{backgroundColor:"#fdc915", height:"40vh", width:"100%", display:{xs:"none", smmid:"flex"}, alignItems:"center", justifyContent:"center"}}>
            <Box sx={{width:"90%",height:"100%" }}>
                <Box sx={{height:"80%", width:"100%", borderBottom:"#ffffff 2px solid", display:"flex", alignItems:"center", justifyContent:"space-around"}}>
                    <Box sx={{display:"flex", flexDirection:"column", gap:"0.5rem"}}>
                        <a style={{color:"white", textDecoration:"none", fontSize:"2.4vh"}} href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                        <a style={{color:"white", textDecoration:"none", fontSize:"2.4vh"}} href={`tel:${DISPLAY_PHONE.replace(/\s/g, "")}`}>{DISPLAY_PHONE}</a>
                        <a style={{color:"white", textDecoration:"none", fontSize:"2.4vh"}} href={WEBSITE_URL} target="_blank" rel="noopener noreferrer">www.ivisfit.com</a>
                    </Box>
                    <img src={imagen} alt="logoFooter" style={{width:"7rem"}}/>
                    <Box >
                             <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                        <Box sx={{cursor:"pointer", width:"110px", height:"110px", position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <img src={instagram} alt="logoInstagram" style={{width:"50%", position:"absolute"}}/>
                        </Box>
                             </a>
                    </Box>
                </Box>
                <Box sx={{height:"20%", width:"100%", display:"flex", alignItems:"center", justifyContent:"center"}}>
                    {/* <Box sx={{display:"flex", alignItems:"center", justifyContent:"center", height:"90%", width:"50%", gap:"2vw"}}>
                        <a style={{color:"white", textDecoration:"none", fontSize:"2vh"}}  href="">Aviso Legal</a>
                        <a style={{color:"white", textDecoration:"none", fontSize:"2vh"}} href="">Términos y Condiciones</a>
                        <a style={{color:"white", textDecoration:"none", fontSize:"2vh"}} href="">Cookies</a>
                        <a style={{color:"white", textDecoration:"none", fontSize:"2vh"}} href="">Politica de privacidad</a>
                    </Box> */}
                    <Box sx={{display:"flex", alignItems:"center", justifyContent:"center", height:"90%", width:"50%"}}>
                        <p style={{color:"#ffffff", fontSize:"2vh", textAlign:"center"}}>© 2026 ivisfit. # ENTRENA CON PROPÓSITO 2026</p>
                    </Box>
                </Box>
            </Box>
        </Box>
        <Box sx={{backgroundColor:"#fdc915", minHeight:"60vh", width:"100%", display:{xs:"flex", smmid:"none"}, alignItems:"center", justifyContent:"center"}}>
            <Box sx={{width:"100%",height:"100%" }}>
                <Box sx={{height:"60%", width:"100%", borderBottom:"#ffffff 2px solid", display:"flex", alignItems:"center", justifyContent:"space-evenly", flexDirection:"column"}}>
                    <Box sx={{display:"flex", flexDirection:"column", alignItems:"center", gap:"0.5rem", padding:"20px 0"}}>
                        <a style={{color:"white", textDecoration:"none", fontSize:"2vh"}} href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                        <a style={{color:"white", textDecoration:"none", fontSize:"2vh"}} href={`tel:${DISPLAY_PHONE.replace(/\s/g, "")}`}>{DISPLAY_PHONE}</a>
                        <a style={{color:"white", textDecoration:"none", fontSize:"2vh"}} href={WEBSITE_URL} target="_blank" rel="noopener noreferrer">www.ivisfit.com</a>
                    </Box>
                    <img src={imagen} alt="logoFooter" style={{width:"10%"}}/>
                    <Box >
                        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                        <Box sx={{cursor:"pointer", width:"70px", height:"70px",position:"relative", display:"flex", alignItems:"center", justifyContent:"center"}}>
                            <img src={instagram} alt="logoInstagram" style={{width:"50%", position:"absolute"}}/>
                        </Box>
                        </a>
                    </Box>
                </Box>
                <Box sx={{height:"40%", width:"100%", display:"flex", alignItems:"center", justifyContent:"space-around", flexDirection:"column"}}>
                    <Box sx={{display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", height:"100%", width:"50%", gap:"2vw"}}>
                        {/* <a style={{color:"white", textDecoration:"none", fontSize:"1.8"}}  href="">Aviso Legal</a>
                        <a style={{color:"white", textDecoration:"none", fontSize:"1.8"}} href="">Términos y Condiciones</a>
                        <a style={{color:"white", textDecoration:"none", fontSize:"1.8"}} href="">Cookies</a>
                        <a style={{color:"white", textDecoration:"none", fontSize:"1.8"}} href="">Politica de privacidad</a> */}
                    </Box>
                    <Box sx={{display:"flex", alignItems:"center", justifyContent:"center", height:"90%", width:"50%"}}>
                        <p style={{color:"#ffffff", fontSize:"2vh", textAlign:"center"}}>© 2026 ivisfit. # ENTRENA CON PROPÓSITO 2026</p>
                    </Box>
                </Box>
            </Box>
        </Box>
    </Box>
  )
}

