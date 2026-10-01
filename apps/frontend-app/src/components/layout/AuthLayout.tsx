import type { ReactNode } from "react";
import { AuthVideoBackground } from "@/components/layout/AuthVideoBackground";
import { DEFAULT_AUTH_VIDEO_SRC } from "@/lib/auth-login-video.constants";

type AuthLayoutProps = {
  children: ReactNode;
  videoSrc?: string;
};

export function AuthLayout({
  children,
  videoSrc = DEFAULT_AUTH_VIDEO_SRC,
}: AuthLayoutProps) {
  return (
    <div className="auth-screen">
      <AuthVideoBackground src={videoSrc} />
      <div className="auth-screen__content">{children}</div>
    </div>
  );
}
