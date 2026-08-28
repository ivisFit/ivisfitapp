import type { CmsConfig } from './cms.types';

/** Config por defecto del demo incluido en el kit. Reemplazá en tu proyecto host. */
export const cmsConfig: CmsConfig = {
  previewSource: 'preview-cms-kit-demo',
  adminPath: '/admin/cms',
  previewPath: '/cms-preview',
  adminApiPath: '/api/site-content/admin',
  uploadPath: '/api/site-content/upload',
  revalidateTag: 'site-content',
  revalidatePaths: ['/', '/about'],
  locales: ['es', 'en'],
  allowedTopLevelKeys: ['hero', 'about', 'nav'],
  previewRoutes: [
    { href: '/', label: 'Inicio' },
    { href: '/about', label: 'About' },
  ],
  routeAliases: {},
  internalImagePathPrefixes: ['/uploads/', '/images/'],
  auth: {
    async getSession() {
      // Demo: sin auth. En producción implementá tu adaptador.
      return { user: { id: 'demo-user' } };
    },
    canEdit() {
      return true;
    },
  },
};
