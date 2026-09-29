"use client";

import { useEffect, type ReactNode, type RefObject } from "react";
import { useVirtualList } from "@/hooks/useVirtualList";

type VirtualizedMessageListProps<T> = {
  items: T[];
  scrollRef: RefObject<HTMLDivElement | null>;
  estimateSize?: number;
  getItemKey: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
  footer?: ReactNode;
  className?: string;
  scrollToEndDeps?: unknown[];
};

export function VirtualizedMessageList<T>({
  items,
  scrollRef,
  estimateSize = 80,
  getItemKey,
  renderItem,
  footer,
  className,
  scrollToEndDeps = [],
}: VirtualizedMessageListProps<T>) {
  const virtualizer = useVirtualList({
    count: items.length,
    scrollRef,
    estimateSize,
  });

  useEffect(() => {
    if (items.length === 0) return;
    virtualizer.scrollToIndex(items.length - 1, { align: "end" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- scrollToEndDeps are intentional triggers
  }, [items.length, virtualizer, ...scrollToEndDeps]);

  return (
    <div className={className} ref={scrollRef} style={{ overflow: "auto" }}>
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];
          return (
            <div
              key={getItemKey(item, virtualRow.index)}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
      {footer}
    </div>
  );
}
