import { Anton, Archivo, Cormorant_Garamond } from "next/font/google";

const landingAnton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const landingArchivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-body",
});

const landingCormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-accent",
});

export const landingFontClassName = `${landingAnton.variable} ${landingArchivo.variable} ${landingCormorant.variable} ${landingArchivo.className}`;
