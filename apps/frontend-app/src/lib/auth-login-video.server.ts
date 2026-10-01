import "server-only";

import {
  APP_APPEARANCE_SINGLETON_KEY,
  AppAppearance,
  connectDB,
} from "@ivisfit/database";
import { DEFAULT_AUTH_VIDEO_SRC } from "@/lib/auth-login-video.constants";

export async function getLoginVideoSrc(): Promise<string> {
  try {
    await connectDB();
    const doc = await AppAppearance.findOne({
      singletonKey: APP_APPEARANCE_SINGLETON_KEY,
    });
    const url = doc?.loginVideoUrl?.trim();
    return url || DEFAULT_AUTH_VIDEO_SRC;
  } catch {
    return DEFAULT_AUTH_VIDEO_SRC;
  }
}
