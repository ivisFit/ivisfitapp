const DAY = 24 * 60 * 60;

type RouteContext = {
  url: URL;
  request: Request;
  sameOrigin: boolean;
};

type RuntimeCachingRule = {
  urlPattern: RegExp | ((context: RouteContext) => boolean);
  handler: "CacheFirst" | "StaleWhileRevalidate" | "NetworkFirst" | "NetworkOnly";
  method?: "GET";
  options?: {
    cacheName: string;
    expiration?: {
      maxEntries: number;
      maxAgeSeconds: number;
      purgeOnQuotaError?: boolean;
    };
    networkTimeoutSeconds?: number;
    rangeRequests?: boolean;
  };
};

/**
 * Ordered Workbox routes for the installed PWA.
 * Specific assets must stay above the pages catch-all: the first match wins.
 * Hashed `/_next/static` files and images are CacheFirst. Other CSS and fonts
 * use Stale-While-Revalidate. Documents fall back to cache after 3s, and
 * `/api` stays NetworkOnly so private responses are never stored.
 */
export const pwaRuntimeCaching: RuntimeCachingRule[] = [
  {
    urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
    handler: "CacheFirst",
    options: {
      cacheName: "google-fonts-webfonts",
      expiration: {
        maxEntries: 8,
        maxAgeSeconds: 365 * DAY,
        purgeOnQuotaError: true,
      },
    },
  },
  {
    urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "google-fonts-stylesheets",
      expiration: {
        maxEntries: 8,
        maxAgeSeconds: 7 * DAY,
        purgeOnQuotaError: true,
      },
    },
  },
  {
    urlPattern: /\/_next\/static\/.+\.woff2$/i,
    handler: "CacheFirst",
    options: {
      cacheName: "next-static-font-assets",
      expiration: {
        maxEntries: 24,
        maxAgeSeconds: 365 * DAY,
        purgeOnQuotaError: true,
      },
    },
  },
  {
    urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font\.css)$/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "static-font-assets",
      expiration: {
        maxEntries: 24,
        maxAgeSeconds: 30 * DAY,
        purgeOnQuotaError: true,
      },
    },
  },
  {
    urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
    handler: "CacheFirst",
    options: {
      cacheName: "unsplash-images",
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 30 * DAY,
        purgeOnQuotaError: true,
      },
    },
  },
  {
    urlPattern: /\.(?:avif|jpg|jpeg|gif|png|svg|ico|webp)$/i,
    handler: "CacheFirst",
    options: {
      cacheName: "static-image-assets",
      expiration: {
        maxEntries: 96,
        maxAgeSeconds: 30 * DAY,
        purgeOnQuotaError: true,
      },
    },
  },
  {
    urlPattern: /\/_next\/static.+\.js$/i,
    handler: "CacheFirst",
    options: {
      cacheName: "next-static-js-assets",
      expiration: {
        maxEntries: 160,
        maxAgeSeconds: 30 * DAY,
        purgeOnQuotaError: true,
      },
    },
  },
  {
    urlPattern: /\/_next\/image\?url=.+$/i,
    handler: "CacheFirst",
    options: {
      cacheName: "next-image",
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 7 * DAY,
        purgeOnQuotaError: true,
      },
    },
  },
  {
    urlPattern: /\.(?:mp3|wav|ogg)$/i,
    handler: "CacheFirst",
    options: {
      rangeRequests: true,
      cacheName: "static-audio-assets",
      expiration: {
        maxEntries: 16,
        maxAgeSeconds: DAY,
        purgeOnQuotaError: true,
      },
    },
  },
  {
    urlPattern: /\.(?:mp4|webm)$/i,
    handler: "NetworkOnly",
    options: {
      cacheName: "static-video-assets",
    },
  },
  {
    urlPattern: /\/_next\/static.+\.css$/i,
    handler: "CacheFirst",
    options: {
      cacheName: "next-static-style-assets",
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 30 * DAY,
        purgeOnQuotaError: true,
      },
    },
  },
  {
    urlPattern: /\.(?:css|less)$/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "static-style-assets",
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 30 * DAY,
        purgeOnQuotaError: true,
      },
    },
  },
  {
    urlPattern: /\.(?:js)$/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "static-js-assets",
      expiration: {
        maxEntries: 48,
        maxAgeSeconds: 7 * DAY,
        purgeOnQuotaError: true,
      },
    },
  },
  {
    urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "next-data",
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: DAY,
        purgeOnQuotaError: true,
      },
    },
  },
  {
    urlPattern: /\.(?:json|xml|csv)$/i,
    handler: "NetworkFirst",
    options: {
      cacheName: "static-data-assets",
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: DAY,
      },
      networkTimeoutSeconds: 3,
    },
  },
  {
    urlPattern: ({ url }: RouteContext) => url.pathname.startsWith("/api/"),
    handler: "NetworkOnly",
    method: "GET",
    options: {
      cacheName: "apis",
    },
  },
  {
    urlPattern: ({ request, url, sameOrigin }: RouteContext) =>
      request.headers.get("RSC") === "1" &&
      request.headers.get("Next-Router-Prefetch") === "1" &&
      sameOrigin &&
      !url.pathname.startsWith("/api/"),
    handler: "NetworkFirst",
    options: {
      cacheName: "pages-rsc-prefetch",
      expiration: {
        maxEntries: 24,
        maxAgeSeconds: 60 * 60,
      },
      networkTimeoutSeconds: 3,
    },
  },
  {
    urlPattern: ({ request, url, sameOrigin }: RouteContext) =>
      request.headers.get("RSC") === "1" &&
      sameOrigin &&
      !url.pathname.startsWith("/api/"),
    handler: "NetworkFirst",
    options: {
      cacheName: "pages-rsc",
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: DAY,
      },
      networkTimeoutSeconds: 3,
    },
  },
  {
    urlPattern: ({ url, sameOrigin }: RouteContext) =>
      sameOrigin && !url.pathname.startsWith("/api/"),
    handler: "NetworkFirst",
    options: {
      cacheName: "pages",
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: DAY,
      },
      networkTimeoutSeconds: 3,
    },
  },
];
