"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authClient } from "@/lib/auth-client";
import {
  mapSignInErrorMessage,
  mapTwoFactorErrorMessage,
  normalizeAuthEmail,
} from "@/lib/auth-errors";
import { apiFetch } from "@/lib/api";
import { fetchCached, invalidateCache } from "@/lib/apiCache";
import { mapAuthUser } from "@/lib/map-auth-user";
import { userFromSessionPayload } from "@/lib/session-user";
import { setTwoFactorRedirectHandler } from "@/lib/two-factor-redirect";
import type { AuthUser } from "@/types/auth";
import type { UsuarioApiDoc } from "@/types/usuario";

export type LoginResult =
  | { status: "complete"; user: AuthUser }
  | { status: "needs2fa" };

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  pending2fa: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  send2faOtp: () => Promise<void>;
  verify2fa: (code: string, trustDevice?: boolean) => Promise<AuthUser>;
  cancel2fa: () => void;
  logout: () => Promise<void>;
  refreshProfile: (options?: { silent?: boolean }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

type SessionUserPayload = Parameters<typeof mapAuthUser>[0];

async function loadUserWithAdmission(
  sessionUser: SessionUserPayload,
): Promise<AuthUser | null> {
  const baseUser = mapAuthUser(sessionUser);
  if (!baseUser) return null;

  try {
    const profile = await fetchCached<UsuarioApiDoc>(
      "/api/me",
      (sig) => apiFetch<UsuarioApiDoc>("/api/me", { signal: sig }),
      60_000,
    );
    return mapAuthUser(sessionUser, profile);
  } catch {
    return baseUser;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    data: session,
    isPending,
    refetch,
    error: sessionError,
  } = authClient.useSession();
  const [mounted, setMounted] = useState(false);
  const [pending2fa, setPending2fa] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [retryingSession, setRetryingSession] = useState(false);
  const [sessionRetried, setSessionRetried] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!sessionError) {
      setSessionRetried(false);
      return;
    }

    if (retryingSession || sessionRetried) return;

    setSessionRetried(true);
    setRetryingSession(true);

    setTimeout(() => {
      void refetch().finally(() => setRetryingSession(false));
    }, 700);
  }, [sessionError, refetch, retryingSession, sessionRetried]);

  useEffect(() => {
    setTwoFactorRedirectHandler(() => {
      setPending2fa(true);
    });

    return () => {
      setTwoFactorRedirectHandler(null);
    };
  }, []);

  const sessionUser = session?.user ?? null;

  useEffect(() => {
    if (!mounted) return;

    if (pending2fa || !sessionUser) {
      if (!isPending) setCurrentUser(null);
      return;
    }

    let cancelled = false;

    void loadUserWithAdmission(sessionUser).then((userWithAdmission) => {
      if (!cancelled) {
        setCurrentUser(userWithAdmission);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    mounted,
    isPending,
    pending2fa,
    sessionUser?.id,
    sessionUser?.email,
    sessionUser?.name,
    sessionUser?.rol,
  ]);

  const login = useCallback(async (email: string, password: string) => {
    let needs2fa = false;
    const normalizedEmail = normalizeAuthEmail(email);

    const result = await authClient.signIn.email(
      { email: normalizedEmail, password },
      {
        onSuccess(context) {
          if (
            "twoFactorRedirect" in context.data &&
            context.data.twoFactorRedirect
          ) {
            needs2fa = true;
            setPending2fa(true);
          }
        },
      },
    );

    if (result.error) {
      throw new Error(mapSignInErrorMessage(result.error.message));
    }

    if (needs2fa) {
      setPending2fa(true);
      return { status: "needs2fa" as const };
    }

    const fromSignInPayload =
      (result.data as { user?: Parameters<typeof userFromSessionPayload>[0] } | undefined)
        ?.user;
    const fromSignIn = await loadUserWithAdmission(fromSignInPayload);
    if (fromSignIn) {
      return { status: "complete" as const, user: fromSignIn };
    }

    const sessionResult = await authClient.getSession();
    const loggedInUser = await loadUserWithAdmission(
      sessionResult.data?.user ?? null,
    );

    if (!loggedInUser) {
      throw new Error("No se pudo obtener la sesión");
    }

    return { status: "complete" as const, user: loggedInUser };
  }, []);

  const send2faOtp = useCallback(async () => {
    const result = await authClient.twoFactor.sendOtp();

    if (result.error) {
      const message = result.error.message ?? "";
      if (
        result.error.status === 429 ||
        /too many|demasiadas|rate.?limit/i.test(message)
      ) {
        throw new Error(
          "Demasiados intentos. Esperá unos minutos e intentá reenviar el código.",
        );
      }
      throw new Error(mapTwoFactorErrorMessage(message));
    }
  }, []);

  const verify2fa = useCallback(async (code: string, trustDevice = false) => {
    const result = await authClient.twoFactor.verifyOtp({ code, trustDevice });

    if (result.error) {
      const message = result.error.message ?? "";
      if (
        result.error.status === 429 ||
        /too many|demasiadas|rate.?limit/i.test(message)
      ) {
        throw new Error(
          "Demasiados intentos de verificación. Esperá unos minutos e intentá de nuevo.",
        );
      }
      throw new Error(mapTwoFactorErrorMessage(message));
    }

    setPending2fa(false);

    const fromVerifyPayload =
      (result.data as { user?: Parameters<typeof userFromSessionPayload>[0] } | undefined)
        ?.user;
    const fromVerify = await loadUserWithAdmission(fromVerifyPayload);
    if (fromVerify) {
      return fromVerify;
    }

    const sessionResult = await authClient.getSession();
    const loggedInUser = await loadUserWithAdmission(
      sessionResult.data?.user ?? null,
    );

    if (!loggedInUser) {
      throw new Error("No se pudo obtener la sesión");
    }

    return loggedInUser;
  }, []);

  const cancel2fa = useCallback(() => {
    setPending2fa(false);
    void authClient.signOut();
  }, []);

  const logout = useCallback(async () => {
    setPending2fa(false);
    await authClient.signOut();
  }, []);

  const refreshProfile = useCallback(async (_options?: { silent?: boolean }) => {
    if (!sessionUser) return;

    invalidateCache("/api/me");
    const userWithAdmission = await loadUserWithAdmission(sessionUser);
    if (userWithAdmission) {
      setCurrentUser(userWithAdmission);
    }
  }, [sessionUser]);

  const needsProfileResolution =
    Boolean(sessionUser) && !currentUser && !pending2fa;
  const sessionErrorUnresolved =
    Boolean(sessionError) && !sessionUser && !sessionRetried;

  const value = useMemo(
    () => ({
      user: currentUser,
      loading:
        !mounted ||
        (isPending && !currentUser) ||
        retryingSession ||
        sessionErrorUnresolved ||
        needsProfileResolution,
      pending2fa: mounted && pending2fa,
      login,
      send2faOtp,
      verify2fa,
      cancel2fa,
      logout,
      refreshProfile,
    }),
    [
      currentUser,
      isPending,
      mounted,
      retryingSession,
      sessionErrorUnresolved,
      pending2fa,
      needsProfileResolution,
      login,
      send2faOtp,
      verify2fa,
      cancel2fa,
      logout,
      refreshProfile,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
