import { Box } from "@mui/material"





interface BloqueProps {
  img: string;
}

export const Bloque = ({ img }: BloqueProps) => {
  return (
    <Box sx={{height:"55vh", width:"45vw", backgroundColor:"#090708" }}>
        <Box sx={{display:"flex", justifyContent:"center", alignItems:"center", width:"100%", height:"100%", position:"relative",boxSizing:"border-box"}}>
            <Box sx={{ width:"100%", height:"100%"}}>
                <img style={{width:"100%", height:"100%", objectFit:"cover"}} src={img} alt="fondoDerechaImagen" />
            </Box>
            
        </Box>
    </Box>
  )
}
