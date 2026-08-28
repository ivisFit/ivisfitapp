export type CmsLocale = string;

export type CmsSession = {
  user: { id: string };
};

export type PreviewRoute = {
  href: string;
  label: string;
};

export type CmsAuthAdapter = {
  getSession: () => Promise<CmsSession | null>;
  canEdit: (session: CmsSession) => boolean;
};

export type CmsConfig = {
  previewSource: string;
  adminPath: string;
  previewPath: string;
  adminApiPath: string;
  uploadPath: string;
  revalidateTag: string;
  revalidatePaths: string[];
  locales: CmsLocale[];
  allowedTopLevelKeys: string[];
  previewRoutes: PreviewRoute[];
  /** Mapeo de href → ruta canónica de preview (ej. `/en/about` → `/about`). */
  routeAliases?: Record<string, string>;
  internalImagePathPrefixes: string[];
  auth: CmsAuthAdapter;
};
