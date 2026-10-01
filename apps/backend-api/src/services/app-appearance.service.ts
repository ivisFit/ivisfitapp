import {
  APP_APPEARANCE_SINGLETON_KEY,
  AppAppearance,
} from "@ivisfit/database";
import {
  destroyCloudinaryAsset,
  uploadAuthLoginVideo,
} from "./cloudinary.service.js";

export type AppAppearanceDto = {
  loginVideoUrl: string | null;
  loginVideoPublicId: string | null;
};

async function getOrCreateDoc() {
  const existing = await AppAppearance.findOne({
    singletonKey: APP_APPEARANCE_SINGLETON_KEY,
  });
  if (existing) return existing;

  return AppAppearance.create({
    singletonKey: APP_APPEARANCE_SINGLETON_KEY,
  });
}

export async function getAppAppearance(): Promise<AppAppearanceDto> {
  const doc = await AppAppearance.findOne({
    singletonKey: APP_APPEARANCE_SINGLETON_KEY,
  });

  if (!doc?.loginVideoUrl?.trim()) {
    return { loginVideoUrl: null, loginVideoPublicId: null };
  }

  return {
    loginVideoUrl: doc.loginVideoUrl,
    loginVideoPublicId: doc.loginVideoPublicId ?? null,
  };
}

async function destroyStoredLoginVideo(publicId: string | null | undefined) {
  if (!publicId?.trim()) return;
  try {
    await destroyCloudinaryAsset(publicId, "video");
  } catch {
    // Best-effort cleanup when replacing or restoring.
  }
}

export async function setLoginVideo({
  file,
  contentType,
  filename,
}: {
  file: Buffer;
  contentType: string;
  filename: string;
}) {
  const doc = await getOrCreateDoc();
  const previousPublicId = doc.loginVideoPublicId;

  const uploaded = await uploadAuthLoginVideo({
    file,
    contentType,
    filename,
  });

  doc.loginVideoUrl = uploaded.url;
  doc.loginVideoPublicId = uploaded.publicId;
  await doc.save();

  if (previousPublicId && previousPublicId !== uploaded.publicId) {
    await destroyStoredLoginVideo(previousPublicId);
  }

  return {
    loginVideoUrl: uploaded.url,
    loginVideoPublicId: uploaded.publicId,
  };
}

export async function clearLoginVideo() {
  const doc = await AppAppearance.findOne({
    singletonKey: APP_APPEARANCE_SINGLETON_KEY,
  });

  if (!doc) {
    return { loginVideoUrl: null, loginVideoPublicId: null };
  }

  const previousPublicId = doc.loginVideoPublicId;

  await AppAppearance.updateOne(
    { singletonKey: APP_APPEARANCE_SINGLETON_KEY },
    { $unset: { loginVideoUrl: "", loginVideoPublicId: "" } },
  );

  await destroyStoredLoginVideo(previousPublicId);

  return { loginVideoUrl: null, loginVideoPublicId: null };
}
