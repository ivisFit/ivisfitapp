import { Box } from "@mui/material"





interface BloqueProps {
  img: string;
}

export const Bloque2 = ({ img }: BloqueProps) => {
  return (
    <Box sx={{height:"29vh", width:"80vw", backgroundColor:"#090708" }}>

        <Box sx={{display:"flex", justifyContent:"center", alignItems:"center", width:"100%", height:"100%", position:"relative",boxSizing:"border-box"}}>
            <Box sx={{ width:"100%", height:"100%"}}>
                <img style={{width:"100%", height:"100%", objectFit:"cover"}} src={img} alt="fondoDerechaImagen" />
            </Box>
            
        </Box>
    </Box>
  )
}
