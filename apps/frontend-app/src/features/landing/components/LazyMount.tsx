"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type LazyMountProps = {
  children: ReactNode;
  eager?: boolean;
  rootMargin?: string;
  minHeight?: CSSProperties["minHeight"];
};

export function LazyMount({
  children,
  eager = false,
  rootMargin = "300px",
  minHeight,
}: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(eager);

  useEffect(() => {
    if (show) return;
    const el = ref.current;
    if (!el) return;

    let observer: IntersectionObserver | undefined;

    const startObserving = () => {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setShow(true);
            observer?.disconnect();
          }
        },
        { rootMargin },
      );
      observer.observe(el);
    };

    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(startObserving, { timeout: 1500 });
      return () => {
        window.cancelIdleCallback(idleId);
        observer?.disconnect();
      };
    }

    const timeoutId = window.setTimeout(startObserving, 1);
    return () => {
      window.clearTimeout(timeoutId);
      observer?.disconnect();
    };
  }, [rootMargin, show]);

  return (
    <div ref={ref} style={!show && minHeight ? { minHeight } : undefined}>
      {show ? children : null}
    </div>
  );
}
