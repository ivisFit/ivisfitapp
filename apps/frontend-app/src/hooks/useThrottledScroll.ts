"use client";

import { useEffect, useRef, type RefObject } from "react";

type ScrollTarget = Window | HTMLElement;

function getScrollTop(target: ScrollTarget): number {
  if (target instanceof Window) {
    return target.scrollY;
  }
  return target.scrollTop;
}

/**
 * Invokes callback at most once per animation frame while the user scrolls.
 */
export function useThrottledScroll(
  callback: (scrollTop: number) => void,
  targetRef?: RefObject<HTMLElement | null>,
  enabled = true,
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const target: ScrollTarget = targetRef?.current ?? window;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        callbackRef.current(getScrollTop(target));
      });
    };

    target.addEventListener("scroll", onScroll, { passive: true });
    callbackRef.current(getScrollTop(target));

    return () => {
      target.removeEventListener("scroll", onScroll);
    };
  }, [enabled, targetRef]);
}
