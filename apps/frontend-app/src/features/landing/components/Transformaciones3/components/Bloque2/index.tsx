"use client";

import { Box } from "@mui/material"
import { HomeGalleryImg } from "@/features/landing/cms/HomeCmsFields";

interface BloqueProps {
  imageIndex: number;
  fallback: string;
}

export const Bloque2 = ({ imageIndex, fallback }: BloqueProps) => {
  return (
    <Box className="ivis-transform-tile" sx={{height:"29vh", width:"80vw", backgroundColor:"#090708" }}>
        <Box sx={{display:"flex", justifyContent:"center", alignItems:"center", width:"100%", height:"100%", position:"relative",boxSizing:"border-box"}}>
            <Box sx={{ width:"100%", height:"100%", position: "relative", overflow: "hidden", "& img": { objectFit: "cover" } }}>
                <HomeGalleryImg
                  index={imageIndex}
                  fallback={fallback}
                  alt="Transformación"
                  fill
                  sizes="80vw"
                />
            </Box>
        </Box>
    </Box>
  )
}
