"use client";

import { Box } from "@mui/material"
import { HomeGalleryImg } from "@/features/landing/cms/HomeCmsFields";

interface BloqueProps {
  imageIndex: number;
  fallback: string;
}

export const Bloque = ({ imageIndex, fallback }: BloqueProps) => {
  return (
    <Box className="ivis-transform-tile" sx={{height:"55vh", width:"25vw", backgroundColor:"#090708" }}>
        <Box sx={{display:"flex", justifyContent:"center", alignItems:"center", width:"100%", height:"100%", position:"relative",boxSizing:"border-box"}}>
            <Box sx={{ width:"100%", height:"100%", position: "relative", overflow: "hidden" }}>
                <HomeGalleryImg
                  index={imageIndex}
                  fallback={fallback}
                  alt="Transformación"
                  fill
                  sizes="25vw"
                  className="ivis-transform-image object-cover"
                />
            </Box>
            
        </Box>
    </Box>
  )
}
