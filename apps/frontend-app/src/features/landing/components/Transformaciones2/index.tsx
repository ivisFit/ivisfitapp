"use client";

import { Box } from "@mui/material"
import { Bloque } from "./components/Bloque"
import { DEFAULT_HOME_DICTIONARY } from "@/features/landing/cms/home-dictionary";
import { LandingTransformacionesShell } from "../shared/LandingTransformacionesShell";

const images = DEFAULT_HOME_DICTIONARY.home.transformaciones.images;

export const Transformaciones2 = () => {
  return (
    <LandingTransformacionesShell display={{ xs: "none", smmid: "flex", lg: "none" }}>
        <Box sx={{display:"flex", justifyContent:"center", alignItems:"center", flexDirection:"column", gap:"1.5vw", width:"100%"}}>
            <Box sx={{display:"flex", gap:"1.5vw", alignItems:"center", flexDirection:"row",boxSizing:"border-box"}}>
                <Bloque imageIndex={0} fallback={images[0]} />
                <Bloque imageIndex={1} fallback={images[1]} />
            </Box>
            <Box sx={{display:"flex", gap:"1.5vw", alignItems:"center", flexDirection:"row",boxSizing:"border-box"}}>
                <Bloque imageIndex={3} fallback={images[3]} />
                <Bloque imageIndex={5} fallback={images[5]} />
            </Box>
            <Box sx={{display:"flex", gap:"1.5vw", alignItems:"center", flexDirection:"row",boxSizing:"border-box"}}>
                <Bloque imageIndex={4} fallback={images[4]} />
                <Bloque imageIndex={2} fallback={images[2]} />
            </Box>
            <Box sx={{display:"flex", gap:"1.5vw", alignItems:"center", flexDirection:"row",boxSizing:"border-box"}}>
                <Bloque imageIndex={6} fallback={images[6]} />
                <Bloque imageIndex={7} fallback={images[7]} />
            </Box>
        </Box>
    </LandingTransformacionesShell>
  )
}
