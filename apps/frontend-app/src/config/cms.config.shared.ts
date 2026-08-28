import type { CmsConfig } from "@/lib/preview-cms/config/cms.types";

const PLAN_PREVIEW_ROUTES = [
  { href: "/", label: "Inicio" },
  { href: "/gluteos", label: "Glúteos" },
  { href: "/abs-power", label: "Abs Power" },
  { href: "/mami-fit", label: "Mami Fit" },
  { href: "/online", label: "Online" },
  { href: "/semi-presencial", label: "Semi presencial" },
  { href: "/presencial", label: "Presencial" },
] as const;

export const cmsSharedConfig = {
  previewSource: "ivisfit-planes-preview",
  adminPath: "/web-config",
  previewPath: "/cms-preview",
  adminApiPath: "/api/site-content/admin",
  uploadPath: "/api/site-content/upload",
  revalidateTag: "site-content",
  revalidatePaths: ["/", ...PLAN_PREVIEW_ROUTES.map((r) => r.href).filter((h) => h !== "/")],
  locales: ["es"],
  allowedTopLevelKeys: ["planes", "home"],
  previewRoutes: [...PLAN_PREVIEW_ROUTES],
  routeAliases: {},
  internalImagePathPrefixes: ["/uploads/", "/images/", "/imgs/"],
} satisfies Omit<CmsConfig, "auth">;

export function buildPreviewRoutesFromSlugs(
  slugs: Array<{ slug: string; shortTitle: string; route: string; isActive?: boolean }>,
) {
  const routes = [{ href: "/", label: "Inicio" }];
  const seen = new Set<string>();

  for (const plan of slugs) {
    const href = plan.route || `/${plan.slug}`;
    if (seen.has(href)) continue;
    seen.add(href);
    const baseLabel = plan.shortTitle || plan.slug;
    const label =
      plan.isActive === false ? `${baseLabel} (borrador)` : baseLabel;
    routes.push({ href, label });
  }

  return routes;
}
