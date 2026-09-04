import styled, { css } from "styled-components";
import { cardColors, cardLayout, cardTypography } from "./cardTypography";
import { landingButtonFocusStyles } from "../Buttons/landingButtonStyles";

const surfaceBase = css`
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  border-radius: 18px;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.35s ease;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    border-radius: 18px;
    transition: background 0.35s ease;
  }

  > * {
    z-index: 2;
  }

  > .plan-card-preview-chrome {
    z-index: 9999;
  }
`;

export const CardSurface = styled.div<{ $variant: "desktop" | "mobile" }>`
  ${surfaceBase}
  padding: ${cardLayout.innerPadding};
  border: 1px solid rgba(225, 170, 67, 0.2);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.2);

  &::before {
    background: linear-gradient(
      180deg,
      rgba(9, 7, 8, 0.52) 0%,
      rgba(9, 7, 8, 0.72) 48%,
      rgba(9, 7, 8, 0.9) 100%
    );
  }

  ${({ $variant }) =>
    $variant === "desktop"
      ? css`
          width: 100%;
          max-width: ${cardLayout.desktopMaxWidth};
          min-width: 0;
          min-height: 680px;
          height: 100%;
          margin: 0;

          @media (hover: hover) {
            &:hover {
              box-shadow: 0 24px 52px rgba(0, 0, 0, 0.28);
              border-color: rgba(225, 170, 67, 0.45);
            }

            &:hover::before {
              background: linear-gradient(
                180deg,
                rgba(9, 7, 8, 0.46) 0%,
                rgba(9, 7, 8, 0.66) 48%,
                rgba(9, 7, 8, 0.92) 100%
              );
            }
          }
        `
      : css`
          width: ${cardLayout.mobileWidth};
          max-width: ${cardLayout.mobileMaxWidth};
          min-height: auto;
          margin: 0 auto;
          transition: transform 0.2s ease;

          &:active {
            transform: scale(0.98);
          }
        `}
`;

export const CardInner = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 0;
`;

export const CardBadge = styled.div`
  position: absolute;
  top: 1.15rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(225, 170, 67, 0.95);
  color: #1f1402;
  font-size: ${cardTypography.badge};
  font-weight: 800;
  letter-spacing: 0.08rem;
  text-transform: uppercase;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  width: fit-content;
  max-width: calc(100% - 2.5rem);
  line-height: 1.25;
  text-align: center;
  box-shadow: 0 8px 20px rgba(225, 170, 67, 0.35);
`;

export const CardHeader = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${cardLayout.headerGap};
  padding: ${cardLayout.titleTopOffset} 0.5rem 0;
  text-align: center;
  flex-shrink: 0;
`;

export const CardTitle = styled.h2`
  margin: 0;
  width: 100%;
  font-family: var(--font-display);
  font-size: ${cardTypography.title};
  font-weight: 500;
  line-height: 1.12;
  letter-spacing: 0.03rem;
  overflow-wrap: break-word;
`;

export const CardSubtitle = styled.p`
  margin: 0;
  width: 100%;
  max-width: 22rem;
  font-family: var(--font-body);
  font-size: ${cardTypography.subtitle};
  font-weight: 400;
  line-height: 1.5;
  color: var(--brand-gold-soft);
  opacity: 0.95;
  overflow-wrap: break-word;
`;

export const CardPriceBlock = styled.div`
  flex-shrink: 0;
  width: 100%;
  margin-top: ${cardLayout.sectionGap};
  padding: ${cardLayout.priceBlockPadding} 0;
  text-align: center;
`;

export const CardPrice = styled.div`
  color: #ffffff;
  font-size: ${cardTypography.price};
  font-weight: 700;
  letter-spacing: 0.06rem;
  line-height: 1.2;

  & + & {
    margin-top: ${cardLayout.priceBlockGap};
    font-size: clamp(1.35rem, 2.2vw, 1.75rem);
    font-weight: 600;
    opacity: 0.92;
  }
`;

export const CardPeriod = styled.span`
  font-size: ${cardTypography.period};
  margin-left: 0.35rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.88);
`;

export const CardFeatures = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  min-height: 0;
  margin-top: ${cardLayout.sectionGap};
  padding: 0 0.25rem;
`;

export const CardFeatureList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${cardLayout.listGap};
  font-size: ${cardTypography.list};
`;

export const CardFeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  line-height: ${cardTypography.listLineHeight};
  color: rgba(255, 255, 255, 0.92);
  padding: ${cardLayout.listItemPadding};
`;

export const CardFeatureIcon = styled.span`
  flex-shrink: 0;
  margin-top: 0.2em;
  color: var(--brand-gold-soft);
  font-size: ${cardTypography.iconSize};
  display: inline-flex;
`;

export const CardFooter = styled.footer`
  flex-shrink: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: auto;
  padding-top: ${cardLayout.footerPaddingTop};
`;

export const CardCtaButton = styled.button`
  background-color: ${cardColors.ctaBackground};
  color: ${cardColors.ctaText};
  border: none;
  padding: 0.95rem 1.25rem;
  border-radius: ${cardLayout.buttonRadius};
  font-size: ${cardTypography.button};
  font-weight: 800;
  letter-spacing: 0.03rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  cursor: pointer;
  width: ${cardLayout.buttonWidth};
  max-width: 100%;
  box-shadow: 0 12px 26px rgba(253, 201, 21, 0.28);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  svg {
    transition: transform 0.2s ease;
  }

  ${landingButtonFocusStyles}

  &:hover {
    background-color: #ffffff;
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.25);

    svg {
      transform: translateX(4px);
    }
  }
`;
