"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AuthCard } from "@/components/layout/AuthCard";
import { Button, Input, PasswordInput } from "@/components";
import { TwoFactorForm } from "@/features/auth/components/TwoFactorForm";
import { useAuth } from "@/context/AuthContext";
import {
  AUTH_RETURN_TO_PARAM,
  resolvePostAuthRoute,
} from "@/routes/auth-redirect";
import { PwaInstallButton } from "@/components/pwa/PwaInstallButton";
import { publicRoutes } from "@/routes/paths";
import type { AuthUser } from "@/types/auth";

function getPostLoginRoute(user: AuthUser, returnTo: string | null): string {
  return resolvePostAuthRoute(user, returnTo);
}

export function LoginPage() {
  const { user, pending2fa, login, cancel2fa } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get(AUTH_RETURN_TO_PARAM);
  const resetSuccess = searchParams.get("reset") === "ok";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || submitting) return;
    router.replace(getPostLoginRoute(user, returnTo));
  }, [returnTo, router, submitting, user]);

  function handleLoginSuccess(loggedInUser: AuthUser) {
    if (
      loggedInUser.role === "alumna" &&
      loggedInUser.admissionStatus !== "admitida"
    ) {
      router.replace(publicRoutes.solicitudPendiente);
      router.refresh();
      return;
    }

    router.replace(getPostLoginRoute(loggedInUser, returnTo));
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await login(email, password);

      if (result.status === "needs2fa") {
        setSubmitting(false);
        return;
      }

      handleLoginSuccess(result.user);
    } catch (err) {
      setSubmitting(false);
      setError(
        err instanceof Error ? err.message : "No se pudo iniciar sesión",
      );
    }
  }

  if (pending2fa) {
    return (
      <AuthCard
        variant="login"
        eyebrow="Verificación"
        title={
          <>
            Dos <em>pasos</em>
          </>
        }
        subtitle="Revisá tu bandeja de entrada. Te enviamos un código de 6 dígitos."
      >
        <TwoFactorForm
          onSuccess={handleLoginSuccess}
          onCancel={() => {
            cancel2fa();
            setError(null);
          }}
        />
      </AuthCard>
    );
  }

  const isLoggingIn = submitting;

  return (
    <AuthCard
      variant="login"
      eyebrow="Bienvenido de vuelta"
      title={
        <>
          Inicia <em>sesión</em>
        </>
      }
      subtitle="Acceso común para profe y alumna."
      footer={
        <Link href={publicRoutes.registro}>
          Registrarme como alumna
        </Link>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isLoggingIn}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <PasswordInput
          label="Contraseña"
          name="password"
          autoComplete="current-password"
          required
          disabled={isLoggingIn}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <p className="auth-link-row">
          <Link className="auth-link" href={publicRoutes.recuperar}>
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
        <p className="auth-link-row">
          <PwaInstallButton variant="text" />
        </p>
        {resetSuccess ? (
          <p className="auth-hint">
            Tu contraseña fue restablecida. Podés iniciar sesión con la nueva.
          </p>
        ) : null}
        {error ? <p className="auth-error">{error}</p> : null}
        <Button type="submit" disabled={isLoggingIn}>
          {isLoggingIn ? (
            "Iniciando..."
          ) : (
            <>
              Ingresar
              <span className="auth-form__cta-arrow" aria-hidden="true">
                →
              </span>
            </>
          )}
        </Button>
      </form>
    </AuthCard>
  );
}
