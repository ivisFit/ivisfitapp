export type RutinaMediaType = "image" | "video" | "gif";

export type RutinaMediaAsset = {
  type: RutinaMediaType;
  url: string;
  alt?: string;
  posterUrl?: string;
};

export type RutinaStoryPreview = {
  background?: RutinaMediaAsset;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
};

export type RutinaChallengeDayAsset = {
  dayNumber: number;
  title?: string;
  tags?: string[];
  media?: RutinaMediaAsset;
  farewellMedia?: RutinaMediaAsset;
  thumbnail?: RutinaMediaAsset;
};

export type RutinaChallengeWeekAsset = {
  weekNumber: number;
  media?: RutinaMediaAsset;
  farewellMedia?: RutinaMediaAsset;
};

export type RutinaChallenge28 = {
  title?: string;
  subtitle?: string;
  accentLabel?: string;
  days?: RutinaChallengeDayAsset[];
  weeks?: RutinaChallengeWeekAsset[];
};

export type RutinaEjercicio = {
  id: string;
  nombre: string;
  videoUrl: string;
  descripcion?: string;
  series: number;
  repeticiones: number;
  descansoSegundos: number;
  media?: RutinaMediaAsset;
};

export type RutinaDia = {
  nombreDia: string;
  ejercicios: RutinaEjercicio[];
};

export type RutinaSemana = {
  numeroSemana: number;
  dias: RutinaDia[];
};

export type RutinaPlanTemplateSnapshot = {
  slug?: string;
  nombre: string;
  duracionSemanas: number;
  duracionLabel?: string;
  formato?: string;
  inversion?: string;
  precio?: number;
  moneda?: string;
};

export type RutinaSummary = {
  id: string;
  nombrePlan: string;
  duracionSemanas: number;
  startDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type RutinaDetail = RutinaSummary & {
  planTemplateSnapshot?: RutinaPlanTemplateSnapshot;
  storyPreview?: RutinaStoryPreview;
  challenge28?: RutinaChallenge28;
  semanas: RutinaSemana[];
};
