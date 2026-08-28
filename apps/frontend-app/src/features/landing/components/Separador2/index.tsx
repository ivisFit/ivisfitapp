import { Box } from "@mui/material";
import { ButtonWhite2 } from "../Buttons/ButtonWhite2";

type Separador2Props = {
  text?: string;
};

const Separador2 = ({ text = "Comencemos este camino juntas" }: Separador2Props) => {
  return (
    <Box sx={{ width: "100%" }}>
      <Box
        className="landing-separator-band"
        sx={{
          flexDirection: "column",
          gap: "1.5rem",
          minHeight: "17vh",
          px: "1.2rem",
          py: "2.5rem",
        }}
      >
        <Box component="h2" className="landing-separator-band__text">
          {text}
        </Box>
        <ButtonWhite2 text="Quiero empezar" />
      </Box>
    </Box>
  );
};

export default Separador2;
