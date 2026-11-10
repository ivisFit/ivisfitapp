/** Width of a progress fill, animated on the compositor via scaleX. */
export function progressTransform(percent: number): { transform: string } {
  const value = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
  return { transform: `scaleX(${value / 100})` };
}
