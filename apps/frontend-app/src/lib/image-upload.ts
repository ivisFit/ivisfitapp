const MAX_EDGE_PX = 1600;
const JPEG_QUALITY = 0.82;
const MAX_PROGRESS_PHOTO_BYTES = 5 * 1024 * 1024;

export const PROGRESS_PHOTO_HEIC_ERROR =
  "No se pudo leer esta foto. Usá Tomar foto, o en el iPhone: Ajustes → Cámara → Formatos → Más compatible.";

function isHeicLike(file: File): boolean {
  const type = file.type.trim().toLowerCase();
  if (type.includes("heic") || type.includes("heif")) return true;
  const name = file.name.toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif");
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("No se pudo preparar la foto. Intentá de nuevo."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
const FULL_DECODE_MAX_BYTES = 8 * 1024 * 1024;
const MAX_BITMAP_PIXELS = 18_000_000;
const DECODE_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function decodeProgressPhoto(file: File): Promise<ImageBitmap> {
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error(
      "La foto original es demasiado pesada. Elegí otra o sacala de nuevo.",
    );
  }

  const attempts: ImageBitmapOptions[] = [
    {
      imageOrientation: "from-image",
      resizeWidth: MAX_EDGE_PX,
      resizeQuality: "high",
    },
    { resizeWidth: MAX_EDGE_PX },
  ];
  if (file.size <= FULL_DECODE_MAX_BYTES) {
    attempts.push({ imageOrientation: "from-image" }, {});
  }

  let bitmap: ImageBitmap | null = null;
  for (const options of attempts) {
    try {
      bitmap = await withTimeout(
        createImageBitmap(file, options),
        DECODE_TIMEOUT_MS,
        "La foto tardó demasiado en prepararse. Probá con otra imagen.",
      );
      break;
    } catch {
      bitmap = null;
    }
  }

  if (!bitmap) {
    throw new Error(
      isHeicLike(file)
        ? PROGRESS_PHOTO_HEIC_ERROR
        : "No se pudo leer la foto. Probá con otra imagen.",
    );
  }

  if (bitmap.width * bitmap.height > MAX_BITMAP_PIXELS) {
    bitmap.close();
    throw new Error(
      "La foto es demasiado grande para procesarla acá. Probá con otra imagen.",
    );
  }

  return bitmap;
}

/** Baja la foto a JPEG chico. En el iPhone, Safari decodifica HEIC con createImageBitmap. */
export async function prepareProgressPhoto(file: File): Promise<File> {
  const bitmap = await decodeProgressPhoto(file);

  try {
    const longest = Math.max(bitmap.width, bitmap.height);
    const scale = longest > MAX_EDGE_PX ? MAX_EDGE_PX / longest : 1;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("No se pudo preparar la foto. Intentá de nuevo.");
    }
    context.drawImage(bitmap, 0, 0, width, height);

    let quality = JPEG_QUALITY;
    let blob = await canvasToJpeg(canvas, quality);
    while (blob.size > MAX_PROGRESS_PHOTO_BYTES && quality > 0.5) {
      quality = Math.round((quality - 0.12) * 100) / 100;
      blob = await canvasToJpeg(canvas, quality);
    }
    if (blob.size > MAX_PROGRESS_PHOTO_BYTES) {
      throw new Error("La foto no puede superar 5 MB.");
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "medicion-foto";
    return new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}
