"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { WHATSAPP_PHONE } from "@/features/landing/data/plans";

const ChatbotFab = dynamic(
  () =>
    import("@/features/landing/components/Chatbot/ChatbotFab").then(
      (mod) => mod.ChatbotFab,
    ),
  { ssr: false },
);

const WhatsAppButton = dynamic(
  () =>
    import("@/features/landing/components/Buttons/WhatsAppButton").then(
      (mod) => mod.WhatsAppButton,
    ),
  { ssr: false },
);

export function DeferredLandingWidgets() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const enable = () => setReady(true);

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(enable, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }

    const timeoutId = window.setTimeout(enable, 200);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!ready) return null;

  return (
    <>
      <ChatbotFab />
      <WhatsAppButton phoneNumber={WHATSAPP_PHONE} />
    </>
  );
}
