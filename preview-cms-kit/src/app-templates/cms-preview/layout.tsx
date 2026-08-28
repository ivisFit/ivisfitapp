import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { cmsConfig } from '../../config/cms.config';

/** Mismo guard que el editor: el iframe comparte cookies de sesión. */
export default async function CmsPreviewLayout({ children }: { children: ReactNode }) {
  const session = await cmsConfig.auth.getSession();
  if (!session || !cmsConfig.auth.canEdit(session)) {
    redirect('/login');
  }
  return children;
}
