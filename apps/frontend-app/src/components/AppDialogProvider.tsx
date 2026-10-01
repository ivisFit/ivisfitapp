"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AppDialog,
  type AppDialogRequest,
  type AppDialogTone,
} from "@/components/AppDialog";

export type AppDialogConfirmOptions = {
  title: string;
  message?: string;
  tone?: AppDialogTone;
  confirmLabel?: string;
  cancelLabel?: string;
};

export type AppDialogPromptOptions = {
  title: string;
  message?: string;
  defaultValue?: string;
  placeholder?: string;
  inputLabel?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type AppDialogContextValue = {
  confirm: (options: AppDialogConfirmOptions) => Promise<boolean>;
  prompt: (options: AppDialogPromptOptions) => Promise<string | null>;
};

type Resolver =
  | { kind: "confirm"; resolve: (value: boolean) => void }
  | { kind: "prompt"; resolve: (value: string | null) => void };

const AppDialogContext = createContext<AppDialogContextValue | null>(null);

export function AppDialogProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<AppDialogRequest | null>(null);
  const [session, setSession] = useState(0);
  const resolverRef = useRef<Resolver | null>(null);

  const settlePrevious = useCallback(() => {
    const current = resolverRef.current;
    resolverRef.current = null;
    if (!current) return;
    if (current.kind === "confirm") current.resolve(false);
    else current.resolve(null);
  }, []);

  const finish = useCallback((value?: string) => {
    const current = resolverRef.current;
    resolverRef.current = null;
    setRequest(null);
    if (!current) return;
    if (current.kind === "confirm") {
      current.resolve(true);
      return;
    }
    current.resolve(value?.trim() ? value.trim() : null);
  }, []);

  const cancel = useCallback(() => {
    settlePrevious();
    setRequest(null);
  }, [settlePrevious]);

  const confirm = useCallback(
    (options: AppDialogConfirmOptions) => {
      settlePrevious();
      setSession((current) => current + 1);
      return new Promise<boolean>((resolve) => {
        resolverRef.current = { kind: "confirm", resolve };
        setRequest({
          kind: "confirm",
          title: options.title,
          message: options.message,
          tone: options.tone ?? "warning",
          confirmLabel: options.confirmLabel ?? "Continuar",
          cancelLabel: options.cancelLabel ?? "Cancelar",
        });
      });
    },
    [settlePrevious],
  );

  const prompt = useCallback(
    (options: AppDialogPromptOptions) => {
      settlePrevious();
      setSession((current) => current + 1);
      return new Promise<string | null>((resolve) => {
        resolverRef.current = { kind: "prompt", resolve };
        setRequest({
          kind: "prompt",
          title: options.title,
          message: options.message,
          defaultValue: options.defaultValue ?? "",
          inputLabel: options.inputLabel ?? "Nombre",
          placeholder: options.placeholder,
          confirmLabel: options.confirmLabel ?? "Guardar",
          cancelLabel: options.cancelLabel ?? "Cancelar",
        });
      });
    },
    [settlePrevious],
  );

  const value = useMemo(() => ({ confirm, prompt }), [confirm, prompt]);

  return (
    <AppDialogContext.Provider value={value}>
      {children}
      {request ? (
        <AppDialog
          key={session}
          request={request}
          onCancel={cancel}
          onConfirm={finish}
        />
      ) : null}
    </AppDialogContext.Provider>
  );
}

export function useAppDialog() {
  const context = useContext(AppDialogContext);
  if (!context) {
    throw new Error("useAppDialog debe usarse dentro de AppDialogProvider");
  }
  return context;
}
