"use client";

import { useRouter } from "next/navigation";
import { PlanCardContent } from "./PlanCardContent";

type CardProps = {
  imagen: string;
  titulo: string;
  subtitulo: string;
  precio1: string;
  precio2?: string;
  tiempo1?: string;
  tiempo2?: string;
  arreglo: string[];
  link: string;
  badge?: string;
};

export const Card = ({
  imagen,
  titulo,
  subtitulo,
  precio1,
  precio2,
  tiempo1,
  tiempo2,
  arreglo,
  link,
  badge,
}: CardProps) => {
  const router = useRouter();

  return (
    <PlanCardContent
      variant="desktop"
      imagen={imagen}
      titulo={titulo}
      subtitulo={subtitulo}
      precio1={precio1}
      precio2={precio2}
      tiempo1={tiempo1}
      tiempo2={tiempo2}
      arreglo={arreglo}
      badge={badge}
      onCtaClick={() => router.push(link)}
    />
  );
};
