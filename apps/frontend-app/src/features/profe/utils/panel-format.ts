export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return "Hace un momento";
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? "Hace 1 min" : `Hace ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? "Hace 1h" : `Hace ${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return diffDays === 1 ? "Hace 1 día" : `Hace ${diffDays} días`;
  }

  return new Intl.DateTimeFormat("es-UY", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function formatAppointmentTime(isoDate: string): string {
  return new Intl.DateTimeFormat("es-UY", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-UY").format(value);
}

export function formatDelta(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(0)}%`;
}

export function formatShortDate(isoDate: string): string {
  return new Intl.DateTimeFormat("es-UY", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${isoDate}T12:00:00`));
}
