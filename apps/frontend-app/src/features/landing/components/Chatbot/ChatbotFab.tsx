"use client";

import { useState } from "react";
import { ChatbotPanel } from "./ChatbotPanel";
import { ChatbotAvatar } from "./ChatbotAvatar";

export function ChatbotFab() {
  const [open, setOpen] = useState(false);
  const [openKey, setOpenKey] = useState(0);

  const handleOpen = () => {
    setOpenKey((key) => key + 1);
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        className="chatbot-fab"
        onClick={handleOpen}
        aria-label="Abrir asesora IVIIS FIT"
      >
        <span className="chatbot-fab__media">
          <ChatbotAvatar className="chatbot-fab__avatar" />
        </span>
        <span className="chatbot-fab__status" aria-hidden />
      </button>
      <ChatbotPanel
        open={open}
        openKey={openKey}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
