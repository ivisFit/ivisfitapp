import "server-only";

import { headers } from "next/headers";
import type { PanelDashboardDto } from "@/features/profe/types/panel";
import { isPanelDashboardDto } from "@/features/profe/utils/panel-validation";

function getApiOrigin(): string {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000"
  ).replace(/\/$/, "");
}

export async function fetchPanelDashboardServer(): Promise<PanelDashboardDto | null> {
  try {
    const headerStore = await headers();
    const cookie = headerStore.get("cookie");
    if (!cookie) return null;

    const response = await fetch(`${getApiOrigin()}/api/panel`, {
      headers: { cookie },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data: unknown = await response.json();
    return isPanelDashboardDto(data) ? data : null;
  } catch {
    return null;
  }
}
