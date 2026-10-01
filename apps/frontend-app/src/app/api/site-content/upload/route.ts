import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getUploadsDir } from "@/lib/uploads-dir";
import {
  canManageSiteContent,
  getCmsSession,
} from "@/lib/preview-cms/lib/site-content-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

function maxImageBytes(): number {
  const mb = Number(process.env.CMS_UPLOAD_MAX_MB ?? "5");
  return mb * 1024 * 1024;
}

function maxVideoBytes(): number {
  const mb = Number(process.env.CMS_VIDEO_UPLOAD_MAX_MB ?? "80");
  return mb * 1024 * 1024;
}

export async function POST(req: Request) {
  try {
    const session = await getCmsSession();
    if (!session || !canManageSiteContent(session)) {
      return NextResponse.json(
        { message: "No autorizado", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Archivo requerido", code: "BAD_REQUEST" },
        { status: 400 },
      );
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type) && !ALLOWED_VIDEO_TYPES.has(file.type)) {
      return NextResponse.json(
        { message: "Tipo de archivo inválido", code: "BAD_REQUEST" },
        { status: 400 },
      );
    }

    const maxSize = ALLOWED_VIDEO_TYPES.has(file.type) ? maxVideoBytes() : maxImageBytes();
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: "Archivo demasiado grande", code: "BAD_REQUEST" },
        { status: 400 },
      );
    }

    const uploadsDir = getUploadsDir();
    await mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || ".bin";
    const filename = `${randomUUID()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("[site-content/upload POST]", error);
    return NextResponse.json(
      { message: "No se pudo subir el archivo", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
