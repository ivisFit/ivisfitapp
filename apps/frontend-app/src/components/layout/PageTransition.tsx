"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, type ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

const ENTER_KEYFRAMES: Keyframe[] = [{ opacity: 0.55 }, { opacity: 1 }];
const ENTER_OPTIONS: KeyframeAnimationOptions = {
  duration: 180,
  easing: "ease-out",
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname() ?? "";
  const ref = useRef<HTMLDivElement>(null);
  const previousPath = useRef(pathname);

  useLayoutEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;

    const node = ref.current;
    if (!node || typeof node.animate !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    node.getAnimations().forEach((animation) => animation.cancel());
    node.animate(ENTER_KEYFRAMES, ENTER_OPTIONS);
  }, [pathname]);

  return (
    <div ref={ref} className="page-transition">
      {children}
    </div>
  );
}
