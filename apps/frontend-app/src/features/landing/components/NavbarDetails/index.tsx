"use client";

import { Box } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { LandingAuthButtons } from "@/features/landing/components/LandingAuthButtons";
import { LinkComponent } from "./LinkComponent";

const logo = "/imgs/logo-navbar.png";

export const NavbarDetails = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <Box
      sx={{
        height: scrolled ? 80 : 140,
        transition: "all 1s ease",
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
        margin: 0,
        border: "none",
        outline: "none",
      }}
    >
      <Link
        href="/"
        onClick={handleLogoClick}
        style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
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
              transition: "all 1s ease",
              display: "block",
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
          gap: "1.25rem",
          height: "100%",
        }}
      >
        <LinkComponent text="Regresar a pagina principal" link="/" />
        <LandingAuthButtons />
      </Box>
    </Box>
  );
};
