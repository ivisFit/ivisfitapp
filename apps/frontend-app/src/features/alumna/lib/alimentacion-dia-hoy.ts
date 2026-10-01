export function getDiaHoyIndex(totalDias: number, publicadoAt?: string): number {
  if (totalDias <= 1 || !publicadoAt) return 0;
  const start = new Date(publicadoAt);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.round((today.getTime() - start.getTime()) / 86400000));
  return days % totalDias;
}
