import { z } from 'zod';

export type ApiErrorMessages = Record<string, string | undefined>;

export type ErrorDictionary = {
  generic: string;
  network: string;
  validation: string;
  api: ApiErrorMessages;
};

function firstString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    for (const item of value) {
      const s = firstString(item);
      if (s) return s;
    }
  }
  return null;
}

function isNetworkError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'isNetworkError' in error) {
    return (error as { isNetworkError?: boolean }).isNetworkError === true;
  }
  if (error instanceof TypeError) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('network request failed')
    );
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg === 'network_error') return true;
    if (msg === 'failed to fetch' || msg.includes('networkerror')) return true;
  }
  return false;
}

const LOCALE_LABEL: Record<string, string> = { es: 'español', en: 'inglés' };

export function humanizeSiteContentError(error: string, locale: string): string {
  if (error.startsWith('Texto demasiado largo')) {
    return 'Uno de los textos es demasiado largo. Acortalo e intentá guardar de nuevo.';
  }
  if (error.startsWith('Sección no permitida')) {
    return 'Hay un dato que no se puede guardar desde el editor. Revisá la configuración de secciones.';
  }
  if (error.startsWith('Demasiados elementos')) {
    return 'Hay demasiados ítems en una lista. Eliminá algunos e intentá de nuevo.';
  }
  const label = LOCALE_LABEL[locale] ?? locale;
  return `Hay un problema con el contenido en ${label}. Revisá los campos editados e intentá de nuevo.`;
}

export function getApiErrorMessage(
  error: unknown,
  errors: ErrorDictionary,
  fallback?: string,
): string {
  const generic = fallback ?? errors.generic;

  if (error instanceof z.ZodError) {
    return error.errors[0]?.message ?? errors.validation;
  }

  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    if (!response) return errors.network;
    const data = response.data;
    if (typeof data === 'object' && data !== null) {
      const record = data as Record<string, unknown>;
      const code = typeof record.code === 'string' ? record.code : null;
      if (code && errors.api[code]) return errors.api[code]!;
      const message = firstString(record.message);
      if (message) return message;
    }
    if (typeof data === 'string' && data.trim()) return data.trim();
    return generic;
  }

  if (isNetworkError(error)) return errors.network;

  if (error instanceof Error && error.message.trim()) {
    const msg = error.message.trim();
    if (msg === 'CMS request failed') return generic;
    return msg;
  }

  return generic;
}
