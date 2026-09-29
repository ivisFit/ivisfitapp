export function normalizeManifestPath(url: string): string {
  return url.replace(/^https?:\/\/[^/]+/, "").split("?")[0];
}

const ROUTE_DENY = [
  /\/\(landing\)\//i,
  /\/\(preview\)\//i,
  /\/\(evaluacion-nutricional\)\//i,
  /\/\(tutoriales\)\//i,
  /\/\(bienvenida\)\//i,
  /\/\(admin\)\//i,
  /\/app\/api\//i,
  /\/chunks\/app\/api\//i,
  /\/pages\/_app-/i,
  /\/pages\/_error-/i,
];

const ALWAYS_ALLOW = [
  /^\/offline$/i,
  /\/manifest\.json$/i,
  /\/icon-if-/i,
  /\/icon-192\.png$/i,
  /\/icon-512/i,
  /fitness-wallpaper/i,
  /\/fallback-/i,
  /\/chatbot-/i,
  /\/_next\/static\/[^/]+\/_buildManifest\.js$/i,
  /\/_next\/static\/[^/]+\/_ssgManifest\.js$/i,
  /\/_next\/static\/chunks\/framework-/i,
  /\/_next\/static\/chunks\/main-/i,
  /\/_next\/static\/chunks\/main-app-/i,
  /\/_next\/static\/chunks\/webpack-/i,
  /\/_next\/static\/chunks\/polyfills-/i,
];

const APP_ROUTE_ALLOW = [
  /\/\(auth\)\//i,
  /\/\(app\)\/layout-/i,
  /\/\(app\)\/loading-/i,
  /\/\(app\)\/\(alumna\)\//i,
  /\/\(app\)\/ajustes\//i,
  /\/chunks\/app\/layout-/i,
  /\/offline\//i,
];

const STATIC_ASSET_ALLOW = [
  /\/_next\/static\/css\//i,
  /\/_next\/static\/media\/.*\.woff2$/i,
  /\/_next\/static\/media\/.*\.(?:png|webp|avif)$/i,
];

const SHARED_CHUNK_ALLOW =
  /\/_next\/static\/chunks\/(?:\d+[\w.-]*|[\w]+)\.(?:js)$/i;

function isDenied(path: string): boolean {
  if (/\.(?:mp4|webm|mov)$/i.test(path)) return true;
  if (path.includes("/videos/")) return true;
  if (path.includes("/auth/fondovideo")) return true;
  if (path.includes("/imgs/")) return true;
  return ROUTE_DENY.some((re) => re.test(path));
}

/** Whether a workbox precache manifest entry should be installed offline. */
export function shouldPrecacheManifestUrl(url: string): boolean {
  const path = normalizeManifestPath(url);

  if (isDenied(path)) return false;

  if (ALWAYS_ALLOW.some((re) => re.test(path))) return true;

  if (STATIC_ASSET_ALLOW.some((re) => re.test(path))) return true;

  if (SHARED_CHUNK_ALLOW.test(path) && !isDenied(path)) {
    return true;
  }

  if (path.includes("/chunks/app/") || path.includes("/static/chunks/app/")) {
    return APP_ROUTE_ALLOW.some((re) => re.test(path));
  }

  if (path.startsWith("/_next/static/chunks/")) {
    return APP_ROUTE_ALLOW.some((re) => re.test(path));
  }

  if (!path.startsWith("/_next")) {
    if (path.includes("pwa-dev-sw")) return false;
    return ALWAYS_ALLOW.some((re) => re.test(path));
  }

  return false;
}
