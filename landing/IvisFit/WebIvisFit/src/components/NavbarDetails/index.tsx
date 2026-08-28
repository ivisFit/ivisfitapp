import { Box } from "@mui/material";
import logo from "../../../public/imgs/logo-navbar.png";
import { LinkComponent } from "./LinkComponent";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const NavbarDetails = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Box
      sx={{
        height: scrolled ? 80 : 140,
        transition: 'all 1s ease',
        backgroundColor: "#ffffff",
        position: "fixed",
        top: 0, // Asegurar que empiece desde el top
        left: "0",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 10,
        padding: "0 12%",
        boxSizing: "border-box",
        // Prevenir márgenes no deseados
        margin: 0,
        border: "none",
        outline: "none"
      }}
    >
      <Link 
        to="/" 
        onClick={handleLogoClick}
        style={{ 
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img 
            style={{ 
              width: scrolled ? "7rem" : "10rem", 
              transition: 'all 1s ease',
              display: 'block' // Evitar espacio extra debajo de la imagen
            }} 
            src={logo} 
            alt="Icono-Navbar" 
          />
        </Box>
      </Link>
      
      <Box 
        sx={{
          display: { xs: "none", lg: "flex" },
          alignItems: "center",
          height: "100%"
        }}
      >
        <LinkComponent text="Regresar a pagina principal" link="/"/>
      </Box>
    </Box>
  );
};