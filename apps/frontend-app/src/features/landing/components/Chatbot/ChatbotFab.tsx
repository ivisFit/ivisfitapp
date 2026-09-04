"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ChatbotAvatar } from "./ChatbotAvatar";
import "./chatbot.css";

const ChatbotPanel = dynamic(
  () => import("./ChatbotPanel").then((mod) => mod.ChatbotPanel),
  { ssr: false },
);

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
      {openKey > 0 ? (
        <ChatbotPanel
          open={open}
          openKey={openKey}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
