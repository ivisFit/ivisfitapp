import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import type { ReactNode } from "react";
import Script from "next/script";
import { Providers } from "@/providers/Providers";
import * as Sentry from "@sentry/nextjs";
import "@/styles/global.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "IVIS Fit",
  description: "Panel del profe y app para alumnas",
  manifest: "/manifest.json",
  icons: {
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IVIS Fit",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0f0f",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{window.__pwaDeferredPrompt=null;window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__pwaDeferredPrompt=e});window.addEventListener("appinstalled",function(){window.__pwaDeferredPrompt=null});var h=location.hostname;if((h==="localhost"||h==="127.0.0.1"||h==="[::1]")&&"serviceWorker"in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){return Promise.all(rs.map(function(r){var u=((r.active||r.installing||r.waiting||{}).scriptURL||"");return u.indexOf("pwa-dev-sw.js")===-1?r.unregister():Promise.resolve()}))}).then(function(){return navigator.serviceWorker.register("/pwa-dev-sw.js",{scope:"/"})}).catch(function(){})}}catch(e){}`,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Script id="app-color-scheme-fouc" strategy="beforeInteractive">
          {`try{var a=localStorage.getItem("ivis-alumna-color-scheme");var p=localStorage.getItem("ivis-profe-color-scheme");var r=document.documentElement;if(a==="light"){r.setAttribute("data-alumna-color-scheme","light")}if(p==="light"){r.setAttribute("data-profe-color-scheme","light")}if(a==="light"||p==="light"){r.setAttribute("data-color-scheme","light");r.style.colorScheme="light"}}catch(e){}`}
        </Script>
        <Sentry.ErrorBoundary fallback={<div>Algo salió mal. Por favor, recarga la página.</div>}>
          <Providers>{children}</Providers>
        </Sentry.ErrorBoundary>
      </body>
    </html>
  );
}
