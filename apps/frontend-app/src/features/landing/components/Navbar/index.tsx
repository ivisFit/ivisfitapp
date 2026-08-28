"use client";

import { Box } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { LandingAuthButtons } from "@/features/landing/components/LandingAuthButtons";
import { LinkComponent } from "./LinkComponent";
import { RightSideMenu } from "./RightSideMenu";

const logo = "/imgs/logo-navbar.png";

export const Navbar = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      setHidden(y > 140 && y > lastY);
      lastY = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
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
      component="header"
      role="banner"
      sx={{
        height: scrolled ? 68 : 120,
        transform: hidden ? "translateY(-100%)" : "translateY(0)",
        transition:
          "height 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.45s ease, background-color 0.45s ease, border-color 0.45s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
        backgroundColor: scrolled ? "rgba(255,255,255,0.88)" : "#ffffff",
        backdropFilter: scrolled ? "blur(14px) saturate(1.4)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px) saturate(1.4)" : "none",
        position: "fixed",
        top: 0,
        left: "0",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 10,
        padding: { xs: "0 1.25rem", sm: "0 6%", xl: "0 12%" },
        boxSizing: "border-box",
        boxShadow: scrolled ? "0 10px 32px rgba(9,7,8,0.08)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(225,170,67,0.22)"
          : "1px solid transparent",
      }}
    >
      <Link href="/" onClick={handleLogoClick}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            src={logo}
            alt="IVIIS FIT — inicio"
            width={3000}
            height={3000}
            priority
            style={{
              width: scrolled ? "7rem" : "10rem",
              height: "auto",
              transition: "width 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </Box>
      </Link>
      <Box
        component="nav"
        aria-label="Secciones principales"
        sx={{
          display: { xs: "none", lg: "flex" },
          alignItems: "center",
          gap: "1.25rem",
        }}
      >
        <Box
          component="ul"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            width: "18rem",
            gap: "0.75rem",
            margin: 0,
            padding: 0,
            listStyle: "none",
          }}
        >
          <LinkComponent text="Planes" link="planes-section" />
          <LinkComponent text="Conóceme" link="conoceme-section" />
          <LinkComponent text="Faq" link="faq-section" />
          <LinkComponent text="Contacto" link="contacto-section" />
        </Box>
        <LandingAuthButtons />
      </Box>
      <Box
        sx={{
          display: { xs: "flex", lg: "none" },
          justifyContent: "flex-end",
          width: "100%",
        }}
      >
        <RightSideMenu />
      </Box>
    </Box>
  );
};
