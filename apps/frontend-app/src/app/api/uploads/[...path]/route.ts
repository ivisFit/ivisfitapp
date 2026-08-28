import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { getUploadsDir } from "@/lib/uploads-dir";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path: segments } = await context.params;
    const filename = path.basename(segments.join("/"));
    if (!filename || filename.includes("..")) {
      return NextResponse.json({ error: "Ruta inválida" }, { status: 400 });
    }

    const uploadsDir = getUploadsDir();
    const filePath = path.join(uploadsDir, filename);
    const buffer = await readFile(filePath);
    const ext = path.extname(filename).toLowerCase();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": MIME_BY_EXT[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }
}
