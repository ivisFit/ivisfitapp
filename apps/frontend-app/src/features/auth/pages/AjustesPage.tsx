"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, PasswordInput } from "@/components";
import { FormSkeleton, SkeletonLine } from "@/components/skeletons/AppSkeleton";
import { useAuth } from "@/context/AuthContext";
import { PwaInstallSettingsCard } from "@/components/pwa/PwaInstallButton";
import { ProfilePhotoSettings } from "@/features/auth/components/ProfilePhotoSettings";
import { authClient } from "@/lib/auth-client";
import { alumnaRoutes, publicRoutes } from "@/routes/paths";

const MIN_PASSWORD_LENGTH = 8;

export function AjustesPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { data: session, isPending, refetch } = authClient.useSession();

  const [twoFactorPassword, setTwoFactorPassword] = useState("");
  const [twoFactorSubmitting, setTwoFactorSubmitting] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [twoFactorSuccess, setTwoFactorSuccess] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const twoFactorEnabled = Boolean(
    session?.user &&
      "twoFactorEnabled" in session.user &&
      session.user.twoFactorEnabled,
  );

  async function handleTwoFactorSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTwoFactorSubmitting(true);
    setTwoFactorError(null);
    setTwoFactorSuccess(null);

    try {
      if (twoFactorEnabled) {
        const result = await authClient.twoFactor.disable({
          password: twoFactorPassword,
        });

        if (result.error) {
          throw new Error(
            result.error.message ?? "No se pudo desactivar la verificación",
          );
        }

        setTwoFactorSuccess(
          "Verificación en dos pasos desactivada. En el próximo inicio de sesión solo necesitarás tu contraseña.",
        );
      } else {
        const result = await authClient.twoFactor.enable({
          password: twoFactorPassword,
        });

        if (result.error) {
          throw new Error(
            result.error.message ?? "No se pudo activar la verificación",
          );
        }

        setTwoFactorSuccess(
          "Verificación en dos pasos activada. En el próximo inicio de sesión te enviaremos un código por email.",
        );
      }

      setTwoFactorPassword("");
      await refetch();
    } catch (err) {
      setTwoFactorError(
        err instanceof Error ? err.message : "No se pudo actualizar los ajustes",
      );
    } finally {
      setTwoFactorSubmitting(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    setPasswordSubmitting(true);

    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (result.error) {
        throw new Error(
          result.error.message ?? "No se pudo cambiar la contraseña",
        );
      }

      setPasswordSuccess("Tu contraseña fue actualizada correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "No se pudo cambiar la contraseña",
      );
    } finally {
      setPasswordSubmitting(false);
    }
  }

  if (isPending) {
    return (
      <div className="page" aria-busy="true" aria-label="Cargando ajustes">
        <SkeletonLine size="2xl" width="w-32" gold />
        <div className="sk sk--card-elevated">
          <FormSkeleton fields={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Ajustes</h1>

      <PwaInstallSettingsCard />

      <ProfilePhotoSettings />

      {user?.role === "alumna" ? (
        <div className="feature-card">
          <h2>Tutoriales</h2>
          <p>Volvé a ver los videos de bienvenida cuando quieras.</p>
          <Link href={alumnaRoutes.tutoriales} className="btn btn--primary">
            Ver tutoriales
          </Link>
        </div>
      ) : null}

      <div className="feature-card">
        <h2>Contraseña</h2>
        <p>Actualizá la contraseña de tu cuenta.</p>

        <form className="auth-form" onSubmit={handlePasswordSubmit}>
          <PasswordInput
            label="Contraseña actual"
            name="currentPassword"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
          <PasswordInput
            label="Nueva contraseña"
            name="newPassword"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <PasswordInput
            label="Confirmar nueva contraseña"
            name="confirmPassword"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />

          {passwordError ? <p className="auth-error">{passwordError}</p> : null}
          {passwordSuccess ? <p className="auth-hint">{passwordSuccess}</p> : null}

          <Button type="submit" disabled={passwordSubmitting}>
            {passwordSubmitting ? "Guardando..." : "Cambiar contraseña"}
          </Button>
        </form>
      </div>

      <div className="feature-card">
        <h2>Verificación en dos pasos</h2>
        <p>
          Protegé tu cuenta con un código de verificación que enviamos a tu email
          cada vez que iniciás sesión.
        </p>
        <p>
          Estado:{" "}
          <strong>
            {twoFactorEnabled ? "Verificación activada" : "Verificación desactivada"}
          </strong>
        </p>

        <form className="auth-form" onSubmit={handleTwoFactorSubmit}>
          <PasswordInput
            label="Contraseña actual"
            name="twoFactorPassword"
            autoComplete="current-password"
            required
            value={twoFactorPassword}
            onChange={(event) => setTwoFactorPassword(event.target.value)}
          />

          {twoFactorError ? <p className="auth-error">{twoFactorError}</p> : null}
          {twoFactorSuccess ? <p className="auth-hint">{twoFactorSuccess}</p> : null}

          <Button type="submit" disabled={twoFactorSubmitting}>
            {twoFactorSubmitting
              ? "Guardando..."
              : twoFactorEnabled
                ? "Desactivar verificación en dos pasos"
                : "Activar verificación en dos pasos"}
          </Button>
        </form>
      </div>

      <div className="feature-card ajustes-logout">
        <Button
          type="button"
          variant="ghost"
          onClick={async () => {
            if (!user) return;
            await logout();
            router.replace(publicRoutes.login);
            router.refresh();
          }}
        >
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
