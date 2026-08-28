"use client";

import type { ChatbotMessage as ChatbotMessageType } from "./chatbot-types";
import { ChatbotAvatar } from "./ChatbotAvatar";

type ChatbotMessageProps = {
  message: ChatbotMessageType;
};

export function ChatbotMessage({ message }: ChatbotMessageProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={`chatbot-message chatbot-message--${message.role}`}>
      {isAssistant ? (
        <div className="chatbot-message__avatar" aria-hidden>
          <ChatbotAvatar />
        </div>
      ) : null}
      <div className="chatbot-message__bubble">
        {message.content.split("\n").map((line, index) => (
          <p key={`${message.id}-${index}`}>{line || "\u00A0"}</p>
        ))}
      </div>
    </div>
  );
}
