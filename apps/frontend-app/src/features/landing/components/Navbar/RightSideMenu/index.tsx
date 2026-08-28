"use client";

import { useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import {
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  CssBaseline,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  HelpOutlineOutlined,
  Contacts,
  LocalAtm,
} from "@mui/icons-material";
import { LandingAuthButtons } from "@/features/landing/components/LandingAuthButtons";

export const RightSideMenu = () => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (isOpen: boolean) => (event: KeyboardEvent | MouseEvent) => {
    if ("key" in event && (event.key === "Tab" || event.key === "Shift")) {
      return;
    }
    setOpen(isOpen);
  };

  const menuItems = [
    { text: "Inicio", icon: <HomeIcon />, ancla: "#inicio" },
    { text: "Conóceme", icon: <InfoIcon />, ancla: "#conoceme-section" },
    { text: "Planes", icon: <LocalAtm />, ancla: "#planes" },
    { text: "Preguntas Frecuentes", icon: <HelpOutlineOutlined />, ancla: "#preguntas-frecuentes" },
    { text: "Contacto", icon: <Contacts />, ancla: "#contacto" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Toolbar>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="Abrir menú de navegación"
          aria-expanded={open}
          onClick={toggleDrawer(true)}
          sx={{
            ml: 2,
            minWidth: 44,
            minHeight: 44,
            "&:focus-visible": {
              outline: "2px solid var(--brand-gold-soft)",
              outlineOffset: 2,
            },
          }}
        >
          <MenuIcon sx={{ width: "50px", height: "50px", color: "var(--brand-gold-soft)" }} />
        </IconButton>
      </Toolbar>

      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: 280,
            backgroundColor: "var(--brand-paper)",
            boxShadow: "0 0 24px rgb(0 0 0 / 12%)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            p: 1,
          }}
        >
          <IconButton
            onClick={toggleDrawer(false)}
            aria-label="Cerrar menú"
            sx={{
              minWidth: 44,
              minHeight: 44,
              "&:focus-visible": {
                outline: "2px solid var(--brand-gold-soft)",
                outlineOffset: 2,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <List component="nav" aria-label="Navegación principal">
          {menuItems.map((item) => (
            <a
              key={item.text}
              href={item.ancla}
              className="landing-drawer-link"
              onClick={() => setOpen(false)}
            >
              <ListItem className="landing-drawer-item" sx={{ minHeight: 48 }}>
                <ListItemIcon sx={{ color: "var(--brand-gold-soft)", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            </a>
          ))}
        </List>
        <LandingAuthButtons variant="drawer" onNavigate={() => setOpen(false)} />
      </Drawer>
    </Box>
  );
};
