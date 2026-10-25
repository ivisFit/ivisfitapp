import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { poppins } from "@/lib/fonts/local-fonts";
import { AppProviders } from "./AppProviders";
import "@/styles/app-features.css";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div className={poppins.variable}>
      <AppProviders>
        <AppShell>{children}</AppShell>
      </AppProviders>
    </div>
  );
}
