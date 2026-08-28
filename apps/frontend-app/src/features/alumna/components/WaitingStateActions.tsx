"use client";

import Link from "next/link";
import { buildCoachGreeting, buildWhatsAppIvisHref } from "@/lib/whatsapp";
import { alumnaMensajesRoute } from "@/routes/paths";

type WaitingStateActionsProps = {
  nombre?: string;
  whatsappTema: string;
};

export function WaitingStateActions({
  nombre,
  whatsappTema,
}: WaitingStateActionsProps) {
  return (
    <div className="waiting-state__actions">
      <Link
        href={alumnaMensajesRoute(buildCoachGreeting(nombre, whatsappTema))}
        className="btn btn--primary"
      >
        Escribirle a tu coach
      </Link>
      <a
        className="btn btn--ghost"
        href={buildWhatsAppIvisHref(nombre, whatsappTema)}
        target="_blank"
        rel="noreferrer"
      >
        Escribir por WhatsApp
      </a>
    </div>
  );
}
