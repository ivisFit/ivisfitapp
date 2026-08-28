import { Box} from "@mui/material";
import logo from "../../../public/imgs/logo-navbar.png";
import { LinkComponent } from "./LinkComponent";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { RightSideMenu } from "./RightSideMenu";
import { Link } from "react-router-dom";



export const Navbar = () => {

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
      const handleScroll = () => setScrolled(window.scrollY > 10);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    const handleLogoClick = (e: MouseEvent<HTMLAnchorElement>) => {
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
        transition: 'height 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.45s ease',
        backgroundColor: "#ffffff",
        position: "fixed",
        top: 0,
        left: "0",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 10,
        padding: "0 12%",
        boxSizing: "border-box",
        boxShadow: scrolled ? "0 8px 30px rgba(0,0,0,0.10)" : "none",
        borderBottom: scrolled ? "1px solid rgba(225,170,67,0.18)" : "1px solid transparent",
      }}
    >
      <Link to="/" onClick={handleLogoClick}>
      
      <Box
        sx={{
          display:"flex",
          alignItems: "center",
          justifyContent: "center",
          
        }}
      >
        <img style={{ width: scrolled ?"7rem": "10rem",transition: 'width 0.45s cubic-bezier(0.22, 1, 0.36, 1)' }} src={logo} alt="Icono-Navbar" />
      </Box>
      </Link>
      <Box sx={{display:{xs:"none", lg:"flex"}}}>
        <ul
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            width: "20rem",
            cursor: "pointer",
            gap: "1rem",
          }}
        >
          <LinkComponent text="Planes" link="planes-section"/>
          <LinkComponent text="Conóceme" link="conoceme-section"/>
          <LinkComponent text="Faq"    link="faq-section"/>
          <LinkComponent text="Contacto" link="contacto-section" />
        </ul>
      </Box>
      <Box sx={{display:{xs:"flex", lg:"none"}, justifyContent:"flex-end", width:"100%"}}>
        <RightSideMenu />
      </Box>
    </Box>
  );
};
