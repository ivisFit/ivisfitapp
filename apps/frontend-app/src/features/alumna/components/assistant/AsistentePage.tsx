"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ChatbotAvatar } from "@/features/landing/components/Chatbot/ChatbotAvatar";
import { AppAssistantChips } from "./AppAssistantChips";
import {
  useAppAssistant,
  type AsistenteCategoria,
  type ChipSet,
} from "@/features/alumna/hooks/useAppAssistant";

const MAIN_CHIPS = [
  { value: "entrenamiento", label: "🏋️ Mi entrenamiento" },
  { value: "alimentacion", label: "🍎 Alimentación" },
  { value: "motivacion", label: "💬 Motivación" },
  { value: "progreso", label: "📈 Mi progreso" },
  { value: "comunidad", label: "👭 Comunidad" },
  { value: "hablar_ivis", label: "🙋 Hablar con Ivis" },
];

const ENTRENAMIENTO_CHIPS = [
  { value: "¿Cómo hago el Hip Thrust?", label: "¿Cómo hago el Hip Thrust?" },
  { value: "¿Qué peso debería usar?", label: "¿Qué peso debería usar?" },
  { value: "¿Puedo reemplazar este ejercicio?", label: "¿Puedo reemplazar un ejercicio?" },
  { value: "¿Qué hago si hoy tengo agujetas?", label: "Tengo agujetas" },
  { value: "¿Puedo entrenar dos días seguidos?", label: "¿Dos días seguidos?" },
  { value: "¿Cuánto descanso entre series?", label: "¿Cuánto descanso?" },
];

const ALIMENTACION_CHIPS = [
  { value: "checkin_alimentacion_hoy", label: "Alimentación de hoy" },
  { value: "¿Cuántas proteínas necesito?", label: "¿Cuántas proteínas necesito?" },
  { value: "¿Cómo reemplazo el pollo?", label: "¿Cómo reemplazo el pollo?" },
  { value: "No llego a mis calorías.", label: "No llego a mis calorías" },
  { value: "¿Qué puedo desayunar?", label: "¿Qué puedo desayunar?" },
  { value: "¿Puedo comer pizza?", label: "¿Puedo comer pizza?" },
  { value: "¿Cómo leo una etiqueta nutricional?", label: "Leer una etiqueta" },
];

const CHECKIN_ALIMENTACION_CHIPS = [
  { value: "cumpli", label: "Cumplí" },
  { value: "parcial", label: "Parcial" },
  { value: "no_pude", label: "No pude" },
];

const MOTIVACION_CHIPS = [
  { value: "No tengo ganas de entrenar.", label: "No tengo ganas de entrenar" },
  { value: "No veo resultados.", label: "No veo resultados" },
  { value: "Me cuesta ser constante.", label: "Me cuesta ser constante" },
];

const PROGRESO_CHIPS = [
  { value: "resumen", label: "Resumen de mi progreso" },
  {
    value: "Contame cómo vengo con la alimentación y el entrenamiento.",
    label: "¿Cómo vengo en general?",
  },
];

const CHECKIN_CHIPS = [
  { value: "excelente", label: "😊 Excelente" },
  { value: "bien", label: "🙂 Bien" },
  { value: "mas_o_menos", label: "😐 Más o menos" },
  { value: "no_entrene", label: "😞 No entrené" },
];

const MOTIVO_CHIPS = [
  { value: "sin_tiempo", label: "No tuve tiempo" },
  { value: "sin_ganas", label: "No tenía ganas" },
  { value: "dolor", label: "Dolor" },
  { value: "mucho_trabajo", label: "Mucho trabajo" },
  { value: "olvido", label: "Olvido" },
];

function chipsFor(set: ChipSet) {
  switch (set) {
    case "main":
      return MAIN_CHIPS;
    case "entrenamiento":
      return ENTRENAMIENTO_CHIPS;
    case "alimentacion":
      return ALIMENTACION_CHIPS;
    case "motivacion":
      return MOTIVACION_CHIPS;
    case "progreso":
      return PROGRESO_CHIPS;
    case "checkin":
      return CHECKIN_CHIPS;
    case "checkin_alimentacion":
      return CHECKIN_ALIMENTACION_CHIPS;
    case "motivo":
      return MOTIVO_CHIPS;
    default:
      return [];
  }
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

export function AsistentePage() {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    messages,
    loading,
    error,
    whatsappHref,
    whatsappCtaLabel,
    chipSet,
    bootstrapped,
    loadBootstrap,
    showMainMenu,
    selectCategoria,
    speakWithIvis,
    sendMessage,
    sendCheckin,
    sendCheckinAlimentacion,
    openCheckinAlimentacion,
    askProgress,
  } = useAppAssistant();

  useEffect(() => {
    void loadBootstrap();
  }, [loadBootstrap]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, chipSet]);

  useEffect(() => {
    if (bootstrapped && !loading) {
      inputRef.current?.focus();
    }
  }, [bootstrapped, loading]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    void sendMessage(text).then(() => setText(""));
  };

  const handleChip = (value: string) => {
    if (chipSet === "main") {
      if (value === "hablar_ivis") {
        speakWithIvis();
        return;
      }
      if (value === "progreso") {
        void askProgress();
        return;
      }
      selectCategoria(value as AsistenteCategoria);
      return;
    }

    if (chipSet === "checkin") {
      void sendCheckin(value as "excelente" | "bien" | "mas_o_menos" | "no_entrene");
      return;
    }

    if (chipSet === "motivo") {
      void sendCheckin(
        "no_entrene",
        value as "sin_tiempo" | "sin_ganas" | "dolor" | "mucho_trabajo" | "olvido",
      );
      return;
    }

    if (chipSet === "checkin_alimentacion") {
      void sendCheckinAlimentacion(value as "cumpli" | "parcial" | "no_pude");
      return;
    }

    if (chipSet === "alimentacion" && value === "checkin_alimentacion_hoy") {
      openCheckinAlimentacion();
      return;
    }

    if (chipSet === "progreso" && value === "resumen") {
      void askProgress();
      return;
    }

    const cat =
      chipSet === "entrenamiento" ||
      chipSet === "alimentacion" ||
      chipSet === "motivacion" ||
      chipSet === "progreso"
        ? (chipSet as AsistenteCategoria)
        : undefined;
    void sendMessage(value, cat);
  };

  const showWhatsappCta = Boolean(whatsappHref) && !loading;

  const options = chipsFor(chipSet);

  return (
    <div className="app-assistant-page">
      <header className="app-assistant-page__header">
        <div className="app-assistant-page__header-left">
          <div className="app-assistant-page__avatar" aria-hidden>
            <ChatbotAvatar />
          </div>
          <div>
            <h1 className="app-assistant-page__title">Asistente de IvisFit</h1>
          </div>
        </div>
        <button
          type="button"
          className="app-assistant-page__menu-btn"
          onClick={showMainMenu}
          disabled={loading}
        >
          Menú
        </button>
      </header>

      <div className="app-assistant-page__messages" ref={scrollRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`app-assistant-message app-assistant-message--${message.role}`}
          >
            {message.role === "assistant" ? (
              <div className="app-assistant-message__avatar" aria-hidden>
                <ChatbotAvatar />
              </div>
            ) : null}
            <div className="app-assistant-message__bubble">{message.content}</div>
          </div>
        ))}
        {loading ? (
          <div className="app-assistant-message app-assistant-message--assistant">
            <div className="app-assistant-message__avatar" aria-hidden>
              <ChatbotAvatar />
            </div>
            <div className="app-assistant-message__bubble app-assistant-message__bubble--typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : null}

        {options.length > 0 && !loading ? (
          <AppAssistantChips options={options} disabled={loading} onSelect={handleChip} />
        ) : null}
      </div>

      {error ? <p className="app-assistant-page__error">{error}</p> : null}

      {showWhatsappCta && whatsappHref ? (
        <div className="app-assistant-page__escalation">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
            {whatsappCtaLabel}
          </a>
        </div>
      ) : null}

      <form className="app-assistant-page__composer" onSubmit={handleSubmit}>
        <div className="app-assistant-page__composer-input-wrap">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Escribí tu consulta..."
            disabled={loading}
            aria-label="Mensaje para el asistente"
          />
          <button
            type="submit"
            className="app-assistant-page__composer-submit"
            disabled={loading || !text.trim()}
            aria-label="Enviar"
          >
            <SendIcon />
          </button>
        </div>
      </form>
    </div>
  );
}
