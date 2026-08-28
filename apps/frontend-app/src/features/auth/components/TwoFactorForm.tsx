"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Button, Input } from "@/components";
import { useAuth } from "@/context/AuthContext";
import type { AuthUser } from "@/types/auth";

const RESEND_COOLDOWN_SECONDS = 60;

interface TwoFactorFormProps {
  onSuccess: (user: AuthUser) => void;
  onCancel: () => void;
}

export function TwoFactorForm({ onSuccess, onCancel }: TwoFactorFormProps) {
  const { send2faOtp, verify2fa } = useAuth();
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const autoSentRef = useRef(false);

  const sendCode = useCallback(async () => {
    setSending(true);
    setError(null);

    try {
      await send2faOtp();
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo enviar el código",
      );
    } finally {
      setSending(false);
    }
  }, [send2faOtp]);

  useEffect(() => {
    if (autoSentRef.current) return;
    autoSentRef.current = true;
    void sendCode();
  }, [sendCode]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setInterval(() => {
      setCooldown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const loggedInUser = await verify2fa(code.trim(), trustDevice);
      onSuccess(loggedInUser);
    } catch (err) {
      setSubmitting(false);
      setError(
        err instanceof Error ? err.message : "No se pudo verificar el código",
      );
    }
  }

  async function handleResend() {
    if (cooldown > 0 || sending) return;
    await sendCode();
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <Input
        label="Código de verificación"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        required
        value={code}
        onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
      />

      <label className="auth-checkbox">
        <input
          type="checkbox"
          checked={trustDevice}
          onChange={(event) => setTrustDevice(event.target.checked)}
        />
        <span>Confiar en este dispositivo</span>
      </label>

      {error ? <p className="auth-error">{error}</p> : null}

      <Button type="submit" disabled={submitting || code.length < 6}>
        {submitting ? "Verificando..." : "Verificar"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        disabled={cooldown > 0 || sending}
        onClick={() => void handleResend()}
      >
        {cooldown > 0
          ? `Reenviar código (${cooldown}s)`
          : sending
            ? "Enviando..."
            : "Reenviar código"}
      </Button>

      <Button type="button" variant="ghost" onClick={onCancel}>
        Volver al inicio de sesión
      </Button>
    </form>
  );
}
