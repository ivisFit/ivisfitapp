import "server-only";

import { resolveAppRoleForEmail } from "@ivisfit/auth";
import type { CmsConfig } from "@/lib/preview-cms/config/cms.types";
import { cmsSharedConfig } from "@/config/cms.config.shared";

export const cmsConfig: CmsConfig = {
  ...cmsSharedConfig,
  auth: {
    async getSession() {
      const { auth } = await import("@ivisfit/auth");
      const { headers } = await import("next/headers");
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) return null;

      const sessionRol = (session.user as { rol?: string }).rol;
      const rol = await resolveAppRoleForEmail(session.user.email, sessionRol);

      return {
        user: {
          id: session.user.id,
          rol,
        },
      };
    },
    canEdit(session) {
      return session.user.rol === "profe";
    },
  },
};

export { buildPreviewRoutesFromSlugs } from "@/config/cms.config.shared";
