import type { ChatbotAnswers } from "@ivisfit/database";

const MAMA_KEYWORDS = ["mamá", "mama", "postparto", "embarazo", "fui mamá", "fui mama"];

function containsMamaSignal(answers: ChatbotAnswers) {
  const text = [answers.motivoAbandono, answers.nombre, answers.objetivo]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return MAMA_KEYWORDS.some((kw) => text.includes(kw));
}

function isGluteosObjective(answers: ChatbotAnswers) {
  const objetivo = answers.objetivo?.toLowerCase() ?? "";
  return (
    objetivo.includes("gluteo") ||
    objetivo.includes("glúteo") ||
    objetivo === "tonificar"
  );
}

function isCoreObjective(answers: ChatbotAnswers) {
  const objetivo = answers.objetivo?.toLowerCase() ?? "";
  return objetivo.includes("core") || objetivo.includes("abdomen") || objetivo === "tonificar";
}

function trainsRegularly(answers: ChatbotAnswers) {
  return answers.nivel === "seguido" || answers.nivel === "a_veces";
}

function trainsAtGym(answers: ChatbotAnswers) {
  return answers.lugar === "gym" || answers.lugar === "ambos";
}

function wantsNutritionSupport(answers: ChatbotAnswers) {
  return answers.alimentacion === "si" || answers.alimentacion === "no_se";
}

function isBeginner(answers: ChatbotAnswers) {
  return answers.nivel === "nunca" || answers.nivel === "volviendo";
}

function needsFullSupport(answers: ChatbotAnswers) {
  return (
    answers.obstaculo === "no_comer" ||
    answers.obstaculo === "sola" ||
    answers.obstaculo === "acompanamiento" ||
    answers.obstaculo === "no_entrenar" ||
    answers.obstaculo === "abandono"
  );
}

function hasLittleTime(answers: ChatbotAnswers) {
  return (
    answers.tiempoSesion === "20" ||
    answers.tiempoSesion === "30" ||
    answers.obstaculo === "tiempo"
  );
}

export function recommendPlanSlug(answers: ChatbotAnswers): string {
  if (containsMamaSignal(answers)) {
    return "mami-fit";
  }

  if (isCoreObjective(answers) && trainsRegularly(answers)) {
    return "abs-power";
  }

  if (isGluteosObjective(answers) && trainsAtGym(answers)) {
    return "gluteos";
  }

  if (wantsNutritionSupport(answers) || isBeginner(answers) || needsFullSupport(answers)) {
    return "online";
  }

  if (hasLittleTime(answers) && answers.lugar === "casa") {
    return "online";
  }

  return "online";
}
