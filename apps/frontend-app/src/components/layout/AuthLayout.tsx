import type { ReactNode } from "react";
import { AuthVideoBackground } from "@/components/layout/AuthVideoBackground";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-screen">
      <AuthVideoBackground />
      <div className="auth-screen__content">{children}</div>
    </div>
  );
}
