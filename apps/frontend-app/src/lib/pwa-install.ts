export type InstallPlatform =
  | "ios"
  | "android"
  | "chromium"
  | "safari-mac"
  | "firefox";

export function isIosDevice() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/i.test(ua);
  const iPadOS =
    window.navigator.platform === "MacIntel" &&
    window.navigator.maxTouchPoints > 1;
  return iOS || iPadOS;
}

export function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  const standalone = window.matchMedia("(display-mode: standalone)").matches;
  return standalone || window.navigator.standalone === true;
}

export function getDeferredPrompt() {
  if (typeof window === "undefined") return null;
  return window.__pwaDeferredPrompt ?? null;
}

export function getInstallPlatform(): InstallPlatform {
  if (typeof window === "undefined") return "chromium";
  if (isIosDevice()) return "ios";

  const ua = window.navigator.userAgent;
  if (/Android/i.test(ua)) return "android";
  if (/Firefox/i.test(ua)) return "firefox";
  if (
    /Safari/i.test(ua) &&
    !/Chrome|Chromium|Edg|OPR|Android/i.test(ua)
  ) {
    return "safari-mac";
  }
  return "chromium";
}

export function isDevInstallServiceWorker(
  registration: ServiceWorkerRegistration,
) {
  const urls = [
    registration.active?.scriptURL,
    registration.installing?.scriptURL,
    registration.waiting?.scriptURL,
  ];
  return urls.some((url) => Boolean(url?.includes("pwa-dev-sw.js")));
}
