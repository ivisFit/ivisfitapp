"use client";

import Link from "next/link";
import { Box } from "@mui/material";
import { PwaInstallButton } from "@/components/pwa/PwaInstallButton";
import { publicRoutes } from "@/routes/paths";

type LandingAuthButtonsProps = {
  variant?: "desktop" | "drawer";
  onNavigate?: () => void;
};

export function LandingAuthButtons({
  variant = "desktop",
  onNavigate,
}: LandingAuthButtonsProps) {
  const isDrawer = variant === "drawer";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: isDrawer ? 1 : 0.75,
        flexDirection: isDrawer ? "column" : "row",
        width: isDrawer ? "100%" : "auto",
        mt: isDrawer ? 2 : 0,
        px: isDrawer ? 2 : 0,
      }}
    >
      <PwaInstallButton
        variant="landing"
        className={isDrawer ? "landing-auth-btn--block" : undefined}
        onNativePrompt={onNavigate}
      />
      <Box
        component={Link}
        href={publicRoutes.login}
        onClick={onNavigate}
        className="landing-auth-btn landing-auth-btn--login"
        sx={{
          width: isDrawer ? "100%" : "auto",
          textAlign: "center",
          fontSize: "0.95rem",
        }}
      >
        Ingresar
      </Box>
      <Box
        component={Link}
        href={publicRoutes.registro}
        onClick={onNavigate}
        className="landing-auth-btn landing-auth-btn--register"
        sx={{
          width: isDrawer ? "100%" : "auto",
          textAlign: "center",
          fontSize: "0.95rem",
        }}
      >
        Registrarse
      </Box>
    </Box>
  );
}
