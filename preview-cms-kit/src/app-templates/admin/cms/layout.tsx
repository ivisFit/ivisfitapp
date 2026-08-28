import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { cmsConfig } from '../../../config/cms.config';

/**
 * Guard de autenticación para el editor CMS.
 * Reemplazá la lógica de redirect con tu sistema de auth.
 */
export default async function AdminCmsLayout({ children }: { children: ReactNode }) {
  const session = await cmsConfig.auth.getSession();
  if (!session || !cmsConfig.auth.canEdit(session)) {
    redirect('/login');
  }
  return children;
}
