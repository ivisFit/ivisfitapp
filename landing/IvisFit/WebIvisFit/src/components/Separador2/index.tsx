import { Box } from '@mui/material'
import { ButtonWhite2 } from '../Buttons/ButtonWhite2'

type Separador2Props = {
  text?: string;
};

const Separador2 = ({text = "Comencemos este camino juntas"}: Separador2Props) => {
  return (
    <Box sx={{width:"100%"}}>
    <Box sx={{minHeight:"17vh", padding:"2.5rem 1.2rem", width:"100%", background:"linear-gradient(120deg, #fdc915 0%, #e1aa43 100%)", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", gap:"1.5rem", fontSize:{xs:"1.4rem",lg:"2rem"}, boxSizing:"border-box"}}>
        <h3 style={{color:"#ffffff", textAlign:"center", textShadow:"0 2px 12px rgba(0,0,0,0.18)", margin:0}}>{text}</h3>
        <ButtonWhite2 text="Quiero empezar" />
    </Box>
    </Box>
  )
}

export default Separador2