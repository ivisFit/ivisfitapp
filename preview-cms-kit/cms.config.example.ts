import type { CmsConfig } from './src/config/cms.types';

/**
 * Copiá este archivo a `src/config/cms.config.ts` en tu proyecto host
 * y ajustá rutas, locales, secciones y autenticación.
 */
export const cmsConfig: CmsConfig = {
  previewSource: 'my-app-preview-cms',
  adminPath: '/admin/cms',
  previewPath: '/cms-preview',
  adminApiPath: '/api/site-content/admin',
  uploadPath: '/api/site-content/upload',
  revalidateTag: 'site-content',
  revalidatePaths: ['/', '/about', '/contact'],
  locales: ['es', 'en'],
  allowedTopLevelKeys: ['hero', 'about', 'contact', 'nav', 'footer'],
  previewRoutes: [
    { href: '/', label: 'Inicio' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contacto' },
  ],
  routeAliases: {
    '/en/about': '/about',
  },
  internalImagePathPrefixes: ['/uploads/', '/images/'],
  auth: {
    async getSession() {
      // Conectá tu sesión (better-auth, NextAuth, Clerk, etc.)
      return null;
    },
    canEdit(session) {
      return session !== null;
    },
  },
};
