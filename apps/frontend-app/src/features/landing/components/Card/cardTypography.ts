export const cardTypography = {
  badge: "clamp(0.72rem, 1.4vw, 0.82rem)",
  title: "clamp(1.55rem, 2.4vw, 1.95rem)",
  subtitle: "clamp(0.9rem, 1.7vw, 1rem)",
  price: "clamp(1.9rem, 3.2vw, 2.5rem)",
  period: "0.42em",
  list: "clamp(0.92rem, 1.5vw, 1.02rem)",
  listLineHeight: "1.5",
  button: "clamp(0.92rem, 1.4vw, 1rem)",
  iconSize: "0.85em",
} as const;

export const cardColors = {
  ctaBackground: "var(--brand-gold-soft)",
  ctaText: "#1f1402",
} as const;

export const cardLayout = {
  sectionGap: "1rem",
  innerPadding: "1.75rem",
  titleTopOffset: "2.75rem",
  headerGap: "0.5rem",
  priceBlockPadding: "1.1rem 0",
  priceBlockGap: "0.35rem",
  listGap: "0.65rem",
  listItemPadding: "0.15rem 0",
  footerPaddingTop: "1.25rem",
  desktopMaxWidth: "100%",
  desktopMinWidth: "300px",
  mobileWidth: "94%",
  mobileMaxWidth: "580px",
  listWidth: "90%",
  buttonWidth: "88%",
  buttonRadius: "8px",
} as const;
