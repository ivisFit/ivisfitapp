export function getAppMainScrollContainer(): HTMLElement | null {
  return document.querySelector<HTMLElement>(".app-main");
}

export function scrollIntoAppMainView(
  element: HTMLElement | null | undefined,
  options: Pick<ScrollIntoViewOptions, "behavior" | "block"> = {},
): void {
  if (!element) return;

  const { behavior = "smooth", block = "start" } = options;
  const container = getAppMainScrollContainer();

  if (!container || !container.contains(element)) {
    element.scrollIntoView({ behavior, block });
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  let offset = elementRect.top - containerRect.top + container.scrollTop;

  if (block === "center") {
    offset -= (containerRect.height - elementRect.height) / 2;
  } else if (block === "end") {
    offset -= containerRect.height - elementRect.height;
  }

  container.scrollTo({
    top: Math.max(0, offset),
    behavior,
  });
}
