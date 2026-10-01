import type { ReactNode } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { getLoginVideoSrc } from "@/lib/auth-login-video.server";

export default async function AuthGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  const videoSrc = await getLoginVideoSrc();

  return <AuthLayout videoSrc={videoSrc}>{children}</AuthLayout>;
}
