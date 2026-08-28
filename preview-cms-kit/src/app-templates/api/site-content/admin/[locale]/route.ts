import { NextResponse, type NextRequest } from 'next/server';
import { SaveSiteContentSchema, SiteContentLocaleSchema } from '../../../../types/site-content';
import {
  canManageSiteContent,
  getCmsSession,
  saveSiteContentLocale,
} from '../../../../lib/site-content-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteCtx = { params: Promise<{ locale: string }> };

export async function PUT(req: NextRequest, ctx: RouteCtx) {
  try {
    const session = await getCmsSession();
    if (!session || !canManageSiteContent(session)) {
      return NextResponse.json({ message: 'No autorizado', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { locale: rawLocale } = await ctx.params;
    const localeResult = SiteContentLocaleSchema.safeParse(rawLocale);
    if (!localeResult.success) {
      return NextResponse.json({ message: 'Locale inválido', code: 'BAD_REQUEST' }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: 'JSON inválido', code: 'BAD_REQUEST' }, { status: 400 });
    }

    const parsed = SaveSiteContentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Payload inválido', code: 'BAD_REQUEST', issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const result = await saveSiteContentLocale(localeResult.data, session.user.id, parsed.data);
    if (!result.ok) {
      return NextResponse.json({ message: result.error, code: 'BAD_REQUEST' }, { status: 400 });
    }
    return NextResponse.json({
      data: result.data,
      version: result.version,
      updatedAt: result.updatedAt,
    });
  } catch (error) {
    console.error('[site-content/admin PUT]', error);
    return NextResponse.json(
      { message: 'No se pudo guardar el contenido', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
