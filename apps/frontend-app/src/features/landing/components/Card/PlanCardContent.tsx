"use client";

import { FaArrowRight } from "react-icons/fa";
import {
  CardBadge,
  CardCtaButton,
  CardFeatureIcon,
  CardFeatureItem,
  CardFeatureList,
  CardFeatures,
  CardFooter,
  CardHeader,
  CardInner,
  CardPeriod,
  CardPrice,
  CardPriceBlock,
  CardSubtitle,
  CardSurface,
  CardTitle,
} from "./cardStyles";

export type PlanCardContentProps = {
  variant: "desktop" | "mobile";
  imagen: string;
  titulo: string;
  subtitulo: string;
  precio1: string;
  precio2?: string;
  tiempo1?: string;
  tiempo2?: string;
  arreglo: string[];
  badge?: string;
  onCtaClick: () => void;
};

export function PlanCardContent({
  variant,
  imagen,
  titulo,
  subtitulo,
  precio1,
  precio2,
  tiempo1,
  tiempo2,
  arreglo,
  badge = "PAGO MENSUAL",
  onCtaClick,
}: PlanCardContentProps) {
  return (
    <CardSurface $variant={variant} style={{ backgroundImage: `url(${imagen})` }}>
      <CardBadge>{badge}</CardBadge>
      <CardInner>
        <CardHeader>
          <CardTitle>{titulo}</CardTitle>
          <CardSubtitle>{subtitulo}</CardSubtitle>
        </CardHeader>

        <CardPriceBlock>
          <CardPrice>
            {precio1}
            {tiempo1 ? <CardPeriod>{tiempo1}</CardPeriod> : null}
          </CardPrice>
          {precio2 ? (
            <CardPrice>
              {precio2}
              {tiempo2 ? <CardPeriod>{tiempo2}</CardPeriod> : null}
            </CardPrice>
          ) : null}
        </CardPriceBlock>

        <CardFeatures>
          <CardFeatureList>
            {arreglo.map((item, index) => (
              <CardFeatureItem key={index}>
                <CardFeatureIcon aria-hidden>
                  <FaArrowRight />
                </CardFeatureIcon>
                <span>{item}</span>
              </CardFeatureItem>
            ))}
          </CardFeatureList>
        </CardFeatures>

        <CardFooter>
          <CardCtaButton type="button" onClick={onCtaClick}>
            Quiero empezar <FaArrowRight />
          </CardCtaButton>
        </CardFooter>
      </CardInner>
    </CardSurface>
  );
}
