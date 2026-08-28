"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { publicRoutes } from "@/routes/paths";
import { ChatbotChips } from "./ChatbotChips";
import { ChatbotMessage } from "./ChatbotMessage";
import { ChatbotAvatar } from "./ChatbotAvatar";
import { useChatbot } from "./useChatbot";

type ChatbotPanelProps = {
  open: boolean;
  openKey: number;
  onClose: () => void;
};

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

export function ChatbotPanel({ open, openKey, onClose }: ChatbotPanelProps) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    messages,
    currentStep,
    inputType,
    options,
    placeholder,
    recommendedPlan,
    showCtAs,
    loading,
    error,
    started,
    multiSelection,
    whatsappHref,
    start,
    submitText,
    selectChip,
    confirmMultiSelection,
    restart,
  } = useChatbot();

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    if (!open) {
      setIsVisible(false);
      return;
    }

    setIsVisible(false);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsVisible(true));
    });

    return () => cancelAnimationFrame(frame);
  }, [open, openKey]);

  useEffect(() => {
    if (open && !started) {
      void start();
    }
  }, [open, start, started]);

  useEffect(() => {
    if (!open) return;
    scrollToBottom();
  }, [messages, loading, showCtAs, open, scrollToBottom]);

  useEffect(() => {
    if (!open || !isVisible) return;

    scrollToBottom("auto");

    const raf = requestAnimationFrame(() => scrollToBottom("auto"));
    const afterAnimation = window.setTimeout(() => scrollToBottom("auto"), 900);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(afterAnimation);
    };
  }, [open, isVisible, openKey, scrollToBottom]);

  useEffect(() => {
    if (open && isVisible && inputType === "text" && !loading) {
      inputRef.current?.focus();
    }
  }, [open, isVisible, inputType, loading]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    void submitText(text).then(() => setText(""));
  };

  if (!open) return null;

  const showTextInput = !showCtAs && inputType === "text";
  const showChips =
    !showCtAs && (inputType === "chips" || inputType === "multi-chips") && Boolean(options?.length);

  return (
    <div
      className={`chatbot-panel${isVisible ? " chatbot-panel--visible" : ""}`}
      role="dialog"
      aria-label="Asesora IVIIS FIT"
    >
      <div className="chatbot-panel__backdrop" onClick={onClose} aria-hidden />
      <section className="chatbot-panel__sheet" key={openKey}>
        <div className="chatbot-panel__wallpaper" aria-hidden />
        <div className="chatbot-panel__glass-shine" aria-hidden />

        <header className="chatbot-panel__header">
          <div className="chatbot-panel__header-left">
            <div className="chatbot-panel__avatar" aria-hidden>
              <ChatbotAvatar />
            </div>
            <div className="chatbot-panel__header-info">
              <p className="chatbot-panel__brand">IVIIS FIT</p>
              <h2 className="chatbot-panel__title">Asesora</h2>
              <div className="chatbot-panel__status">
                <span className="chatbot-panel__status-dot" />
                <span className="chatbot-panel__status-text">En línea</span>
              </div>
            </div>
          </div>
          <button type="button" className="chatbot-panel__close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>

        <div className="chatbot-panel__messages" ref={scrollRef}>
          {messages.map((message) => (
            <ChatbotMessage key={message.id} message={message} />
          ))}
          {loading ? (
            <div className="chatbot-message chatbot-message--assistant">
              <div className="chatbot-message__avatar" aria-hidden>
                <ChatbotAvatar />
              </div>
              <div className="chatbot-message__bubble chatbot-message__bubble--typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          ) : null}
        </div>

        {error ? <p className="chatbot-panel__error">{error}</p> : null}

        {showCtAs && recommendedPlan ? (
          <div className="chatbot-panel__ctas">
            <button
              type="button"
              className="chatbot-panel__cta chatbot-panel__cta--buy"
              onClick={() => router.push(recommendedPlan.route)}
            >
              Comprar {recommendedPlan.displayName}
            </button>
            <button
              type="button"
              className="chatbot-panel__cta chatbot-panel__cta--register"
              onClick={() =>
                router.push(
                  `${publicRoutes.registro}?plan=${encodeURIComponent(recommendedPlan.slug)}&planTitle=${encodeURIComponent(recommendedPlan.displayName)}`,
                )
              }
            >
              Registrarme
            </button>
            {whatsappHref ? (
              <a
                className="chatbot-panel__cta chatbot-panel__cta--whatsapp"
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                Hablar con Ivis por WhatsApp
              </a>
            ) : null}
            <button type="button" className="chatbot-panel__restart" onClick={restart}>
              Empezar de nuevo
            </button>
          </div>
        ) : null}

        {showTextInput ? (
          <form className="chatbot-panel__composer" onSubmit={handleSubmit}>
            <div className="chatbot-panel__composer-input-wrap">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={placeholder ?? "Escribí tu respuesta..."}
                disabled={loading || currentStep === "done"}
                autoComplete={currentStep === "email" ? "email" : "off"}
              />
              <button
                type="submit"
                className="chatbot-panel__composer-submit"
                disabled={loading || !text.trim()}
                aria-label="Enviar"
              >
                <SendIcon />
              </button>
            </div>
          </form>
        ) : null}

        {showChips && options ? (
          <div className="chatbot-panel__chips-wrap">
            <ChatbotChips
              options={options}
              selected={inputType === "multi-chips" ? multiSelection : undefined}
              multi={inputType === "multi-chips"}
              disabled={loading}
              onSelect={selectChip}
            />
            {inputType === "multi-chips" ? (
              <button
                type="button"
                className="chatbot-panel__confirm"
                disabled={loading || multiSelection.length === 0}
                onClick={() => void confirmMultiSelection()}
              >
                Continuar
              </button>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
