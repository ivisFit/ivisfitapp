const STORAGE_KEY = "ivis-login-remember";

export type RememberedLogin = {
  email: string;
  password: string;
};

/** Solo en el dispositivo; cualquier script del origen puede leer la contraseña. */
export function loadRememberedLogin(): RememberedLogin | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<RememberedLogin>;
    if (
      typeof parsed.email === "string" &&
      typeof parsed.password === "string"
    ) {
      return { email: parsed.email, password: parsed.password };
    }
  } catch {
    // JSON inválido o localStorage bloqueado
  }

  return null;
}

export function saveRememberedLogin(email: string, password: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ email, password }),
    );
  } catch {
    // modo privado u otros límites
  }
}

export function clearRememberedLogin(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no crítico
  }
}
