import type { CmsConfig } from "./cms.types";
import { cmsSharedConfig, buildPreviewRoutesFromSlugs } from "@/config/cms.config.shared";

export * from "./cms.types";
export { buildPreviewRoutesFromSlugs };

const denyAuth: CmsConfig["auth"] = {
  async getSession() {
    return null;
  },
  canEdit() {
    return false;
  },
};

export const cmsConfig: CmsConfig = {
  ...cmsSharedConfig,
  auth: denyAuth,
};
