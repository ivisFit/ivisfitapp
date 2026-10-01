import { useCallback, useLayoutEffect, type RefObject } from "react";

export function resizeTextareaToContent(element: HTMLTextAreaElement) {
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

export function useAutosizeTextarea(
  ref: RefObject<HTMLTextAreaElement | null>,
  value: string,
) {
  const syncHeight = useCallback(() => {
    const element = ref.current;
    if (element) resizeTextareaToContent(element);
  }, [ref]);

  useLayoutEffect(() => {
    syncHeight();
  }, [value, syncHeight]);

  return syncHeight;
}
