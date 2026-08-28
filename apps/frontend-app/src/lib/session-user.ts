import type { AuthUser } from "@/types/auth";
import { mapAuthUser } from "@/lib/map-auth-user";

type SessionLikeUser = {
  id: string;
  email: string;
  name: string;
  rol?: string | null;
} | null | undefined;

export function userFromSessionPayload(
  user: SessionLikeUser,
): AuthUser | null {
  return mapAuthUser(user);
}
