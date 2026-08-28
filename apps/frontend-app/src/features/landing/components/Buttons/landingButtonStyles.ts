import { css } from "styled-components";

/** Shared focus ring for landing CTA buttons */
export const landingButtonFocusStyles = css`
  &:focus-visible {
    outline: 2px solid var(--brand-gold);
    outline-offset: 2px;
  }
`;
