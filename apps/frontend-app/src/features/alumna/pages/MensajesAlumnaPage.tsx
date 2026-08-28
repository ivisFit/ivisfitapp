"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChatbotAvatar } from "@/features/landing/components/Chatbot/ChatbotAvatar";
import { useMensajesUnread } from "@/features/alumna/hooks/useMensajesUnread";
import { MensajesThread } from "@/features/shared/MensajesThread";
import { alumnaRoutes, MENSAJES_BORRADOR_PARAM } from "@/routes/paths";

export function MensajesAlumnaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const borrador = searchParams.get(MENSAJES_BORRADOR_PARAM) ?? undefined;
  const { refetch } = useMensajesUnread();

  useEffect(() => {
    if (!borrador) return;
    router.replace(alumnaRoutes.mensajes, { scroll: false });
  }, [borrador, router]);

  const handleThreadLoaded = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <div className="mensajes-chat-page">
      <header className="mensajes-chat-page__header">
        <div className="mensajes-chat-page__header-left">
          <div className="mensajes-chat-page__avatar" aria-hidden>
            <ChatbotAvatar />
          </div>
          <div>
            <h1 className="mensajes-chat-page__title">Ivis</h1>
            <p className="mensajes-chat-page__subtitle">Tu coach</p>
          </div>
        </div>
      </header>

      <MensajesThread
        viewerRole="alumna"
        layout="chat"
        initialDraft={borrador}
        onThreadLoaded={handleThreadLoaded}
      />
    </div>
  );
}

