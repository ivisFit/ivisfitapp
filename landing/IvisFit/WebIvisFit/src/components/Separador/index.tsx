import { Box } from '@mui/material'
import { ButtonWhite} from '../Buttons/ButtonWhite'

type SeparadorProps = {
  text: string;
};

const Separador = ({text}: SeparadorProps) => {
  return (
    <Box sx={{width:"100%"}}>
    <Box sx={{minHeight:"17vh", padding:"3.5rem 2rem", width:"100%", background:"linear-gradient(120deg, #fdc915 0%, #e1aa43 100%)", display:{xs:"none", smmid:"flex"}, justifyContent:"space-evenly", alignItems:"center", gap:"5vw", fontSize:{xs:"1.5rem",lg:"2rem"}, boxSizing:"border-box"}}>
        <h3 style={{color:"#ffffff", textShadow:"0 2px 12px rgba(0,0,0,0.18)", margin:0}}>{text}</h3>
        <ButtonWhite text="Quiero empezar"/>
    </Box>
    <Box sx={{minHeight:"17vh", padding:"2.5rem 1rem", width:"100%", background:"linear-gradient(120deg, #fdc915 0%, #e1aa43 100%)", display:{xs:"flex", smmid:"none"}, justifyContent:"space-evenly", alignItems:"center", gap:"5vw", fontSize:{xs:"1.5rem",lg:"2rem"}, boxSizing:"border-box"}}>
        <Box sx={{display:{xs:"none", xssm:"flex"}}}>
          <h3 style={{color:"#ffffff",fontSize:"2.7vw", width:"100%"}}>{text}</h3>
        </Box>
        
        <Box sx={{display:{xs:"flex", smmid:"none"}, padding:"15px", alignItems:"center", justifyContent:"center"}}>
          <ButtonWhite text="Quiero empezar"/>
        </Box>
    </Box>

    </Box>
  )
}

export default Separador