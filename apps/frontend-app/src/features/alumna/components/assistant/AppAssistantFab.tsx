"use client";

import { ChatbotAvatar } from "@/features/landing/components/Chatbot/ChatbotAvatar";

export function AppAssistantFab({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      className="app-assistant-fab"
      onClick={onOpen}
      aria-label="Abrir asistente IvisFit"
    >
      <span className="app-assistant-fab__media">
        <ChatbotAvatar className="app-assistant-fab__avatar" />
      </span>
      <span className="app-assistant-fab__status" aria-hidden />
    </button>
  );
}
