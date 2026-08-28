"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { buildWhatsAppEvaluationLink } from "@/features/landing/lib/whatsapp";
import {
  getOrCreateSessionId,
  loadChatbotState,
  resetChatbotSession,
  saveChatbotState,
  type ChatbotAnswers,
  type ChatbotMessage,
  type ChatbotStep,
  type ChatbotTurnResponse,
  type ChatbotTurnStatusResponse,
  type RecommendedPlan,
} from "./chatbot-types";

function createMessage(role: ChatbotMessage["role"], content: string): ChatbotMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
  };
}

function applyChipAnswer(
  answers: ChatbotAnswers,
  step: ChatbotStep,
  value: string,
): ChatbotAnswers {
  const next = { ...answers };

  switch (step) {
    case "genero":
      next.genero = value;
      break;
    case "objetivo":
      next.objetivo = value;
      break;
    case "entrenamiento":
      next.nivel = value;
      break;
    case "diasSemana":
      next.diasSemana = value;
      break;
    case "tiempoSesion":
      next.tiempoSesion = value;
      break;
    case "lugar":
      next.lugar = value;
      break;
    case "alimentacion":
      next.alimentacion = value;
      break;
    case "obstaculo":
      next.obstaculo = value;
      break;
    case "confianza":
      next.confianza = Number(value);
      break;
    case "fuente":
      next.fuente = value;
      break;
    default:
      break;
  }

  return next;
}

const POLL_INTERVAL_MS = 2_500;
const POLL_MAX_MS = 4 * 60 * 1000;

async function pollTurnResult(jobId: string): Promise<ChatbotTurnResponse> {
  const startedAt = Date.now();

  for (;;) {
    if (Date.now() - startedAt > POLL_MAX_MS) {
      throw new Error("El resumen tardó demasiado. Intentá de nuevo.");
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    const status = await apiFetch<ChatbotTurnStatusResponse>(
      `/api/chatbot/turn/estado/${jobId}`,
    );

    if (status.status === "done" && status.result) return status.result;
    if (status.status === "error") {
      throw new Error(status.error ?? "No se pudo generar el resumen");
    }
  }
}

export function useChatbot() {
  const sessionIdRef = useRef(getOrCreateSessionId());
  const restored = loadChatbotState(sessionIdRef.current);

  const [messages, setMessages] = useState<ChatbotMessage[]>(restored?.messages ?? []);
  const [currentStep, setCurrentStep] = useState<ChatbotStep>(restored?.currentStep ?? "greeting");
  const [answers, setAnswers] = useState<ChatbotAnswers>(restored?.answers ?? {});
  const [inputType, setInputType] = useState<ChatbotTurnResponse["inputType"]>(
    restored?.inputType ?? "none",
  );
  const [options, setOptions] = useState<ChatbotTurnResponse["options"]>(restored?.options);
  const [placeholder, setPlaceholder] = useState<string | undefined>(restored?.placeholder);
  const [recommendedPlan, setRecommendedPlan] = useState<RecommendedPlan | undefined>(
    restored?.recommendedPlan,
  );
  const [resumenTexto, setResumenTexto] = useState<string | undefined>(restored?.resumenTexto);
  const [showCtAs, setShowCtAs] = useState(restored?.showCtAs ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(restored?.started ?? false);
  const [multiSelection, setMultiSelection] = useState<string[]>([]);

  useEffect(() => {
    if (!started) return;
    saveChatbotState({
      sessionId: sessionIdRef.current,
      messages,
      currentStep,
      answers,
      inputType,
      options,
      placeholder,
      recommendedPlan,
      resumenTexto,
      showCtAs,
      started,
    });
  }, [
    started,
    messages,
    currentStep,
    answers,
    inputType,
    options,
    placeholder,
    recommendedPlan,
    resumenTexto,
    showCtAs,
  ]);

  const applyTurnResponse = useCallback((response: ChatbotTurnResponse) => {
    setMessages((prev) => [...prev, createMessage("assistant", response.assistantMessage)]);
    setCurrentStep(response.nextStep);
    setInputType(response.inputType);
    setOptions(response.options);
    setPlaceholder(response.placeholder);
    setRecommendedPlan(response.recommendedPlan);
    setResumenTexto(response.resumenTexto);
    setShowCtAs(Boolean(response.showCtAs));
    setMultiSelection([]);
  }, []);

  const sendTurn = useCallback(
    async (
      step: ChatbotStep,
      userInput?: string | string[],
      nextAnswers?: ChatbotAnswers,
      displayText?: string,
    ): Promise<ChatbotTurnResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const payloadAnswers = nextAnswers ?? answers;
        const response = await apiFetch<ChatbotTurnResponse>("/api/chatbot/turn", {
          method: "POST",
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            step,
            answers: payloadAnswers,
            userInput,
          }),
        });

        if (userInput !== undefined) {
          const display =
            displayText ??
            (typeof userInput === "string" ? userInput : userInput.join(", "));
          setMessages((prev) => [...prev, createMessage("user", display)]);
        }

        if (response.processing && response.jobId) {
          const finalResponse = await pollTurnResult(response.jobId);
          applyTurnResponse(finalResponse);
          return finalResponse;
        }

        applyTurnResponse(response);
        return response;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No pudimos continuar. Intentá de nuevo.";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [answers, applyTurnResponse],
  );

  const start = useCallback(async () => {
    if (started) return;
    setStarted(true);
    await sendTurn("greeting");
  }, [sendTurn, started]);

  const submitText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading || currentStep === "done") return;
      if (inputType !== "text") return;

      const nextAnswers = { ...answers };
      if (currentStep === "nombre") nextAnswers.nombre = trimmed;
      if (currentStep === "motivoAbandono") nextAnswers.motivoAbandono = trimmed;
      if (currentStep === "email") nextAnswers.email = trimmed;
      if (currentStep === "whatsapp") nextAnswers.whatsapp = trimmed;

      setAnswers(nextAnswers);
      await sendTurn(currentStep, trimmed, nextAnswers);
    },
    [answers, currentStep, inputType, loading, sendTurn],
  );

  const selectChip = useCallback(
    async (value: string, label: string) => {
      if (loading || currentStep === "done") return;

      if (inputType === "multi-chips") {
        setMultiSelection((prev) => {
          if (value === "ninguno") return ["ninguno"];
          const withoutNone = prev.filter((item) => item !== "ninguno");
          return withoutNone.includes(value)
            ? withoutNone.filter((item) => item !== value)
            : [...withoutNone, value];
        });
        return;
      }

      if (inputType !== "chips") return;

      const nextAnswers = applyChipAnswer(answers, currentStep, value);
      setAnswers(nextAnswers);
      await sendTurn(currentStep, value, nextAnswers, label);
    },
    [answers, currentStep, inputType, loading, sendTurn],
  );

  const confirmMultiSelection = useCallback(async () => {
    if (multiSelection.length === 0 || currentStep !== "materiales") return;
    if (inputType !== "multi-chips") return;

    const labels = multiSelection
      .map((value) => options?.find((option) => option.value === value)?.label ?? value)
      .join(", ");
    const nextAnswers = { ...answers, materiales: multiSelection };
    setAnswers(nextAnswers);
    await sendTurn(currentStep, multiSelection, nextAnswers, labels);
  }, [answers, currentStep, inputType, multiSelection, options, sendTurn]);

  const restart = useCallback(() => {
    resetChatbotSession();
    sessionIdRef.current = getOrCreateSessionId();
    setMessages([]);
    setCurrentStep("greeting");
    setAnswers({});
    setInputType("none");
    setOptions(undefined);
    setPlaceholder(undefined);
    setRecommendedPlan(undefined);
    setResumenTexto(undefined);
    setShowCtAs(false);
    setStarted(false);
    setError(null);
    setMultiSelection([]);
  }, []);

  const whatsappHref =
    recommendedPlan && resumenTexto
      ? buildWhatsAppEvaluationLink({
          resumenTexto,
          planName: recommendedPlan.displayName,
          nombre: answers.nombre,
        })
      : undefined;

  return {
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
  };
}
