import { NextResponse } from 'next/server';
import {
  canManageSiteContent,
  getCmsSession,
  getSiteContentForAdmin,
} from '../../../lib/site-content-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCmsSession();
    if (!session || !canManageSiteContent(session)) {
      return NextResponse.json({ message: 'No autorizado', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const data = await getSiteContentForAdmin();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[site-content/admin GET]', error);
    return NextResponse.json(
      { message: 'No se pudo cargar el contenido', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
