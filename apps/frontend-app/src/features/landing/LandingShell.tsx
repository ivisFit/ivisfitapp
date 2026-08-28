"use client";

import type { ReactNode } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { createTheme, ThemeProvider } from "@mui/material";
import ScrollToTop from "@/features/landing/components/ScrollToTop";
import { LandingReadyGate } from "@/features/landing/components/LandingReadyGate";
import { WhatsAppButton } from "@/features/landing/components/Buttons/WhatsAppButton";
import { ChatbotFab } from "@/features/landing/components/Chatbot/ChatbotFab";
import { WHATSAPP_PHONE } from "@/features/landing/data/plans";
import "@/features/landing/components/Chatbot/chatbot.css";
import "@/features/landing/styles/landing.css";

declare module "@mui/material/styles" {
  interface BreakpointOverrides {
    xs: true;
    xssm: true;
    xssmm: true;
    sm: true;
    smmid: true;
    smmd: true;
    md: true;
    lg: true;
    xl: true;
  }
}

const landingTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      xssm: 520,
      xssmm: 543,
      sm: 600,
      smmid: 720,
      smmd: 768,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

type LandingShellProps = {
  children: ReactNode;
  variant?: "default" | "preview";
};

function LandingShellContent({
  children,
  isPreview,
}: {
  children: ReactNode;
  isPreview: boolean;
}) {
  return (
    <>
      <ScrollToTop />
      {children}
      {!isPreview ? (
        <>
          <ChatbotFab />
          <WhatsAppButton phoneNumber={WHATSAPP_PHONE} />
        </>
      ) : null}
    </>
  );
}

export function LandingShell({ children, variant = "default" }: LandingShellProps) {
  const isPreview = variant === "preview";

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={landingTheme}>
        {isPreview ? (
          <LandingShellContent isPreview>{children}</LandingShellContent>
        ) : (
          <LandingReadyGate>
            <LandingShellContent isPreview={false}>{children}</LandingShellContent>
          </LandingReadyGate>
        )}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
