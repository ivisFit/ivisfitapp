"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthCard } from "@/components/layout/AuthCard";
import { Button, PasswordInput } from "@/components";
import { authClient } from "@/lib/auth-client";
import { publicRoutes } from "@/routes/paths";

const MIN_PASSWORD_LENGTH = 8;

export function RestablecerPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const tokenError = searchParams.get("error");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invalidToken = tokenError === "INVALID_TOKEN" || !token;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("El enlace de restablecimiento no es válido.");
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await authClient.resetPassword({
        newPassword,
        token,
      });

      if (result.error) {
        throw new Error(
          result.error.message ?? "No se pudo restablecer la contraseña",
        );
      }

      router.replace(`${publicRoutes.login}?reset=ok`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo restablecer la contraseña",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (invalidToken || (!token && !tokenError)) {
    return (
      <AuthCard
        variant="login"
        eyebrow="Acceso"
        title={
          <>
            Enlace <em>inválido</em>
          </>
        }
        subtitle="El enlace de restablecimiento expiró o no es válido."
        footer={
          <Link href={publicRoutes.recuperar}>Solicitar un nuevo enlace</Link>
        }
      >
        <p className="auth-error">
          Pedí un nuevo enlace de recuperación para continuar.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      variant="login"
      eyebrow="Acceso"
      title={
        <>
          Nueva <em>contraseña</em>
        </>
      }
      subtitle="Elegí una contraseña nueva para tu cuenta."
      footer={
        <Link href={publicRoutes.login}>Volver al inicio de sesión</Link>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <PasswordInput
          label="Nueva contraseña"
          name="newPassword"
          autoComplete="new-password"
          required
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
        <PasswordInput
          label="Confirmar contraseña"
          name="confirmPassword"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        {error ? <p className="auth-error">{error}</p> : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Guardando..." : "Restablecer contraseña"}
        </Button>
      </form>
    </AuthCard>
  );
}
