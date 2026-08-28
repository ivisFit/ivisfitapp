import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { canManageSiteContent, getCmsSession } from '../../../../lib/site-content-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

function maxBytes(): number {
  const mb = Number(process.env.CMS_UPLOAD_MAX_MB ?? '5');
  return mb * 1024 * 1024;
}

export async function POST(req: Request) {
  try {
    const session = await getCmsSession();
    if (!session || !canManageSiteContent(session)) {
      return NextResponse.json({ message: 'No autorizado', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Archivo requerido', code: 'BAD_REQUEST' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ message: 'Tipo de archivo inválido', code: 'BAD_REQUEST' }, { status: 400 });
    }

    if (file.size > maxBytes()) {
      return NextResponse.json({ message: 'Archivo demasiado grande', code: 'BAD_REQUEST' }, { status: 400 });
    }

    const uploadsDir = process.env.UPLOADS_DIR ?? './uploads';
    await mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || '.bin';
    const filename = `${randomUUID()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error('[site-content/upload POST]', error);
    return NextResponse.json(
      { message: 'No se pudo subir la imagen', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
