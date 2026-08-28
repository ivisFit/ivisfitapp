import type { ReactNode } from "react";
import { Poppins } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { AppProviders } from "./AppProviders";
import "@/styles/app-features.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-rutina",
});

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div className={poppins.variable}>
      <AppProviders>
        <AppShell>{children}</AppShell>
      </AppProviders>
    </div>
  );
}
