"use client";

import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppAssistantFab } from "./AppAssistantFab";
import { alumnaRoutes } from "@/routes/paths";

type AppAssistantContextValue = {
  openAssistant: () => void;
};

const AppAssistantContext = createContext<AppAssistantContextValue | null>(null);

export function useAppAssistantContext() {
  return useContext(AppAssistantContext);
}

type AppAssistantProviderProps = {
  children: ReactNode;
  enabled: boolean;
};

export function AppAssistantProvider({ children, enabled }: AppAssistantProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const openAssistant = useCallback(() => {
    router.push(alumnaRoutes.asistente);
  }, [router]);

  const onAsistentePage =
    pathname === alumnaRoutes.asistente || pathname.startsWith(`${alumnaRoutes.asistente}/`);

  return (
    <AppAssistantContext.Provider value={{ openAssistant }}>
      {children}
      {enabled && !onAsistentePage ? <AppAssistantFab onOpen={openAssistant} /> : null}
    </AppAssistantContext.Provider>
  );
}
