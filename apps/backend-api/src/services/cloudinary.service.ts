import { createHash } from "node:crypto";
import { AppError } from "../utils/errors.js";

const CLOUDINARY_UPLOAD_FOLDER_COMPROBANTES = "ivisfit/comprobantes";
const CLOUDINARY_UPLOAD_FOLDER_AVATARS = "ivisfit/avatars";
const CLOUDINARY_UPLOAD_FOLDER_LANDING_PLANS = "ivisfit/landing-plans";

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  format?: string;
  bytes?: number;
  resource_type?: string;
};

function getConfigFromCloudinaryUrl() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (!cloudinaryUrl) return null;

  try {
    const url = new URL(cloudinaryUrl);
    if (url.protocol !== "cloudinary:") return null;

    return {
      cloudName: url.hostname,
      apiKey: decodeURIComponent(url.username),
      apiSecret: decodeURIComponent(url.password),
    };
  } catch {
    return null;
  }
}

function getCloudinaryConfig() {
  const urlConfig = getConfigFromCloudinaryUrl();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? urlConfig?.cloudName;
  const apiKey = process.env.CLOUDINARY_API_KEY ?? urlConfig?.apiKey;
  const apiSecret = process.env.CLOUDINARY_API_SECRET ?? urlConfig?.apiSecret;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new AppError(
      500,
      "Cloudinary no está configurado para recibir archivos",
    );
  }

  return { cloudName, apiKey, apiSecret };
}

function signParams(params: Record<string, string>, apiSecret: string) {
  const serialized = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}

async function uploadToCloudinary({
  file,
  contentType,
  folder,
  signedParams,
}: {
  file: Buffer;
  contentType: string;
  folder: string;
  signedParams: Record<string, string>;
}) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

  const formData = new FormData();
  formData.set("file", `data:${contentType};base64,${file.toString("base64")}`);
  formData.set("api_key", apiKey);
  formData.set("folder", folder);
  for (const [key, value] of Object.entries(signedParams)) {
    formData.set(key, value);
  }
  formData.set(
    "signature",
    signParams({ ...signedParams, folder }, apiSecret),
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const body = (await response.json().catch(() => ({}))) as
    | CloudinaryUploadResponse
    | { error?: { message?: string } };

  if (!response.ok) {
    const message =
      "error" in body && body.error?.message
        ? body.error.message
        : "No se pudo subir el archivo";
    throw new AppError(502, message);
  }

  if (!("secure_url" in body) || !body.secure_url || !body.public_id) {
    throw new AppError(502, "Cloudinary no devolvió una URL válida");
  }

  return body;
}

export async function destroyCloudinaryAsset(publicId: string) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signedParams = {
    public_id: publicId,
    timestamp,
  };

  const formData = new FormData();
  formData.set("public_id", publicId);
  formData.set("api_key", apiKey);
  formData.set("timestamp", timestamp);
  formData.set("signature", signParams(signedParams, apiSecret));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    const message =
      body.error?.message ?? "No se pudo eliminar el archivo anterior";
    throw new AppError(502, message);
  }
}

export async function uploadComprobantePago({
  file,
  contentType,
  filename,
}: {
  file: Buffer;
  contentType: string;
  filename: string;
}) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signedParams = {
    folder: CLOUDINARY_UPLOAD_FOLDER_COMPROBANTES,
    timestamp,
  };

  const body = await uploadToCloudinary({
    file,
    contentType,
    folder: CLOUDINARY_UPLOAD_FOLDER_COMPROBANTES,
    signedParams,
  });

  return {
    url: body.secure_url!,
    publicId: body.public_id!,
    nombreArchivo: filename,
    formato: body.format,
    bytes: body.bytes,
    resourceType: body.resource_type,
    uploadedAt: new Date().toISOString(),
  };
}

export async function uploadFotoPerfil({
  file,
  contentType,
  filename,
}: {
  file: Buffer;
  contentType: string;
  filename: string;
}) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const transformation = "c_fill,w_400,h_400";
  const signedParams = {
    folder: CLOUDINARY_UPLOAD_FOLDER_AVATARS,
    timestamp,
    transformation,
  };

  const body = await uploadToCloudinary({
    file,
    contentType,
    folder: CLOUDINARY_UPLOAD_FOLDER_AVATARS,
    signedParams,
  });

  return {
    url: body.secure_url!,
    publicId: body.public_id!,
    nombreArchivo: filename,
    uploadedAt: new Date().toISOString(),
  };
}

export async function uploadLandingPlanCardImage({
  file,
  contentType,
  filename,
}: {
  file: Buffer;
  contentType: string;
  filename: string;
}) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const transformation = "c_fill,w_1200,h_800";
  const signedParams = {
    folder: CLOUDINARY_UPLOAD_FOLDER_LANDING_PLANS,
    timestamp,
    transformation,
  };

  const body = await uploadToCloudinary({
    file,
    contentType,
    folder: CLOUDINARY_UPLOAD_FOLDER_LANDING_PLANS,
    signedParams,
  });

  return {
    url: body.secure_url!,
    publicId: body.public_id!,
    nombreArchivo: filename,
    uploadedAt: new Date().toISOString(),
  };
}
