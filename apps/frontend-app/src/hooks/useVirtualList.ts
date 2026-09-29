"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import type { RefObject } from "react";

type UseVirtualListOptions = {
  count: number;
  scrollRef: RefObject<HTMLElement | null>;
  estimateSize: number;
  overscan?: number;
};

export function useVirtualList({
  count,
  scrollRef,
  estimateSize,
  overscan = 6,
}: UseVirtualListOptions) {
  return useVirtualizer({
    count,
    overscan,
    estimateSize: () => estimateSize,
    getScrollElement: () => scrollRef.current,
  });
}
