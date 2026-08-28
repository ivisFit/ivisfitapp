"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";

interface PageTransitionProps {
  children: ReactNode;
}

function supportsViewTransitions(): boolean {
  return (
    typeof document !== "undefined" && "startViewTransition" in document
  );
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname() ?? "";
  const [rendered, setRendered] = useState(children);
  const renderedPath = useRef(pathname);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      renderedPath.current = pathname;
      setRendered(children);
      return;
    }

    if (renderedPath.current === pathname) {
      setRendered(children);
      return;
    }

    const commit = () => {
      renderedPath.current = pathname;
      flushSync(() => setRendered(children));
    };

    if (supportsViewTransitions()) {
      document.startViewTransition(commit);
    } else {
      commit();
    }
  }, [pathname, children]);

  return <div className="page-transition">{rendered}</div>;
}
