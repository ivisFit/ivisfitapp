"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components";
import { AuthCard } from "@/components/layout/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { buildWhatsAppIvisHref } from "@/lib/whatsapp";
import { resolvePostAuthRoute } from "@/routes/auth-redirect";
import { publicRoutes } from "@/routes/paths";

const ADMISSION_POLL_MS = 20_000;

function getStatusCopy(status: string | undefined) {
  if (status === "rechazada") {
    return {
      title: "Solicitud no admitida",
      subtitle: "La profesora rechazó esta solicitud de registro.",
      body: "Si creés que fue un error o necesitás reenviar el comprobante, comunicate por WhatsApp con la profesora.",
    };
  }

  return {
    title: "Esperando aprobación",
    subtitle: "Tu cuenta todavía no fue admitida por la profesora.",
    body: "Cuando la profesora revise tus datos y el comprobante de pago, vas a poder ingresar con esta misma cuenta.",
  };
}

export function SolicitudPendientePage() {
  const { user, loading, logout, refreshProfile } = useAuth();
  const router = useRouter();
  const copy = getStatusCopy(user?.admissionStatus);
  const [checking, setChecking] = useState(false);
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (!user || user.admissionStatus !== "admitida" || redirectedRef.current) {
      return;
    }
    redirectedRef.current = true;
    router.replace(resolvePostAuthRoute(user));
    router.refresh();
  }, [router, user]);

  useEffect(() => {
    if (user?.admissionStatus !== "pendiente") return;

    const id = window.setInterval(() => {
      void refreshProfile({ silent: true });
    }, ADMISSION_POLL_MS);

    return () => window.clearInterval(id);
  }, [refreshProfile, user?.admissionStatus]);

  async function handleLogout() {
    if (!user) return;

    await logout();
    router.replace(publicRoutes.login);
    router.refresh();
  }

  async function handleCheckStatus() {
    setChecking(true);
    try {
      await refreshProfile({ silent: true });
    } finally {
      setChecking(false);
    }
  }

  function handleEnter() {
    if (!user) return;
    router.replace(resolvePostAuthRoute(user));
    router.refresh();
  }

  const whatsappTema =
    user?.admissionStatus === "rechazada"
      ? "consulto por mi solicitud de registro rechazada"
      : "consulto por el estado de mi solicitud";

  if (loading) {
    return (
      <AuthCard title="IVIS Fit" subtitle="Revisando tu solicitud...">
        <div aria-busy="true" aria-label="Revisando tu solicitud">
          <span
            className="sk sk--avatar sk--gold"
            style={{
              width: "4rem",
              height: "4rem",
              borderRadius: "999px",
              margin: "0 auto 1.25rem",
              display: "block",
            }}
          />
          <div className="sk--col" style={{ gap: "0.625rem", alignItems: "center" }}>
            <span className="sk sk--sm" style={{ width: "70%" }} />
            <span className="sk sk--xs" style={{ width: "45%" }} />
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={copy.title}
      subtitle={copy.subtitle}
      footer={
        user ? (
          <button
            type="button"
            className="auth-link auth-link-button"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        ) : (
          <Link href={publicRoutes.login}>Volver al inicio de sesión</Link>
        )
      }
    >
      <p className="auth-hint">{copy.body}</p>
      {user ? (
        <div className="auth-form">
          {user.admissionStatus === "admitida" ? (
            <Button type="button" onClick={handleEnter}>
              Entrar a la app
            </Button>
          ) : (
            <>
              <Button
                type="button"
                onClick={() => void handleCheckStatus()}
                disabled={checking}
              >
                {checking ? "Revisando..." : "Actualizar estado"}
              </Button>
              <a
                className="btn btn--ghost"
                href={buildWhatsAppIvisHref(user.name, whatsappTema)}
                target="_blank"
                rel="noreferrer"
              >
                Escribir por WhatsApp
              </a>
            </>
          )}
        </div>
      ) : null}
    </AuthCard>
  );
}
