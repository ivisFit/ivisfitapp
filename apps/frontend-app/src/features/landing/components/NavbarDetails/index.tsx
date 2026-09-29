"use client";

import { Box } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { MouseEvent } from "react";
import { useThrottledScroll } from "@/hooks/useThrottledScroll";
import { LandingAuthButtons } from "@/features/landing/components/LandingAuthButtons";
import { LinkComponent } from "./LinkComponent";

const logo = "/imgs/logo-navbar.png";

export const NavbarDetails = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useThrottledScroll((scrollTop) => {
    setScrolled(scrollTop > 10);
  });

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
        height: 80,
        transition: "background-color 0.3s ease, box-shadow 0.3s ease",
        backgroundColor: "#ffffff",
        position: "fixed",
        top: 0,
        left: "0",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 10,
        padding: scrolled ? "0 12%" : "1.75rem 12% 0",
        boxSizing: "border-box",
        margin: 0,
        border: "none",
        outline: "none",
        boxShadow: scrolled ? "0 1px 0 rgba(0,0,0,0.06)" : "none",
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
            width={160}
            height={48}
            loading="eager"
            decoding="async"
            style={{
              width: "auto",
              height: scrolled ? "2.25rem" : "3.25rem",
              transform: scrolled ? "scale(0.88)" : "scale(1)",
              transformOrigin: "left center",
              transition: "transform 0.35s ease, height 0.35s ease",
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
