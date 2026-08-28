"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthCard } from "@/components/layout/AuthCard";
import { Button, Input } from "@/components";
import { authClient } from "@/lib/auth-client";
import { publicRoutes } from "@/routes/paths";

function getResetRedirectUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${publicRoutes.restablecer}`;
  }

  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
  if (frontendUrl) {
    return `${frontendUrl}${publicRoutes.restablecer}`;
  }

  return publicRoutes.restablecer;
}

export function RecuperarPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: getResetRedirectUrl(),
      });

      if (result.error) {
        throw new Error(
          result.error.message ?? "No se pudo enviar el enlace de recuperación",
        );
      }

      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo enviar el enlace de recuperación",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      variant="login"
      eyebrow="Acceso"
      title={
        <>
          Recuperar <em>contraseña</em>
        </>
      }
      subtitle={
        sent
          ? "Revisá tu bandeja de entrada."
          : "Te enviaremos un enlace para restablecer tu contraseña."
      }
      footer={
        <Link href={publicRoutes.login}>Volver al inicio de sesión</Link>
      }
    >
      {sent ? (
        <p className="auth-hint">
          Si existe una cuenta con ese email, recibirás un enlace para
          restablecer tu contraseña. El enlace expira en una hora.
        </p>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {error ? <p className="auth-error">{error}</p> : null}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Enviando..." : "Enviar enlace"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
