import localFont from "next/font/local";

export const inter = localFont({
  src: "../../assets/fonts/inter.woff2",
  display: "swap",
  variable: "--font-sans",
  weight: "100 900",
});

export const cormorantGaramond = localFont({
  src: "../../assets/fonts/cormorant.woff2",
  display: "swap",
  variable: "--font-display",
  weight: "300 700",
});

export const poppins = localFont({
  src: [
    {
      path: "../../assets/fonts/poppins-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../assets/fonts/poppins-600.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../assets/fonts/poppins-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-rutina",
});

const landingAnton = localFont({
  src: "../../assets/fonts/anton-400.woff2",
  weight: "400",
  display: "swap",
  variable: "--font-display",
});

const landingArchivo = localFont({
  src: [
    {
      path: "../../assets/fonts/archivo-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../assets/fonts/archivo-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../assets/fonts/archivo-600.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../assets/fonts/archivo-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-body",
});

const landingCormorant = localFont({
  src: [
    {
      path: "../../assets/fonts/cormorant.woff2",
      weight: "300 700",
      style: "normal",
    },
    {
      path: "../../assets/fonts/cormorant-italic.woff2",
      weight: "300 700",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-accent",
});

export const landingFontClassName = `${landingAnton.variable} ${landingArchivo.variable} ${landingCormorant.variable} ${landingArchivo.className}`;
