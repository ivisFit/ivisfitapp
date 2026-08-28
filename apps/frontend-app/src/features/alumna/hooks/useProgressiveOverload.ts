export function useProgressiveOverload() {
  return {
    sugerencia: null as { ejercicio: string; peso: number } | null,
    loading: false,
  };
}
