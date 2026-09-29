import type { NextConfig } from "next";
import path from "node:path";
import withBundleAnalyzer from "@next/bundle-analyzer";
import withPWA from "@ducanh2912/next-pwa";
import { shouldPrecacheManifestUrl } from "./lib/pwa-precache-filter";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://browser.sentry.io;
  worker-src 'self';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co https://*.vercel-insights.com wss://*.vercel-insights.com https://browser.sentry.io;
  media-src 'self' blob: data: https:;
  frame-src 'self' https://vercel.live https://www.youtube.com https://www.youtube-nocookie.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  upgrade-insecure-requests;
`.replace(/\s+/g, " ").trim();

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const pwaConfig = {
  dest: "public",
  register: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
  publicExcludes: [
    "!noprecache/**/*",
    "!videos/**/*",
    "!imgs/**/*",
    "!auth/fondovideo.mp4",
  ],
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    skipWaiting: false,
    clientsClaim: true,
    maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
    manifestTransforms: [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (manifestEntries: any) => {
        const manifest = manifestEntries.filter(({ url }: { url: string }) =>
          shouldPrecacheManifestUrl(url),
        );
        return { manifest, warnings: [] };
      },
    ],
  },
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "unsplash-images",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\/api\/.*$/i,
      handler: "NetworkOnly",
      options: {
        cacheName: "api-cache",
      },
    },
  ],
};

const nextConfig: NextConfig = {
  transpilePackages: ["@ivisfit/database", "@ivisfit/auth"],
  compiler: {
    styledComponents: true,
  },
  experimental: {
    viewTransition: true,
    optimizePackageImports: ["lucide-react", "@mui/material", "@mui/icons-material"],
  },
  outputFileTracingRoot: path.join(__dirname, "../.."),
  poweredByHeader: false,
  async headers() {
    const devCacheHeaders =
      process.env.NODE_ENV === "development"
        ? [
            {
              key: "Cache-Control",
              value: "no-store, no-cache, must-revalidate, max-age=0",
            },
            { key: "Pragma", value: "no-cache" },
            { key: "Expires", value: "0" },
          ]
        : [];

    const prodStaticCache =
      process.env.NODE_ENV === "production"
        ? [
            {
              source: "/_next/static/:path*",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },
          ]
        : [];

    return [
      ...prodStaticCache,
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json; charset=utf-8",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          ...devCacheHeaders,
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp4|webm|ogg)$/i,
      type: "asset/resource",
    });
    return config;
  },
  async redirects() {
    return [
      { source: "/admin", destination: "/panel", permanent: true },
      { source: "/admin/panel", destination: "/panel", permanent: true },
      {
        source: "/admin/ejercicios",
        destination: "/ejercicios",
        permanent: true,
      },
      { source: "/admin/alumnas", destination: "/alumnas", permanent: true },
      {
        source: "/admin/rutinas/nuevo",
        destination: "/rutinas",
        permanent: true,
      },
      { source: "/admin/rutinas", destination: "/rutinas", permanent: true },
      { source: "/planes-landing", destination: "/web-config", permanent: true },
      {
        source: "/planes-landing/:path*",
        destination: "/web-config/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default bundleAnalyzer(withPWA(pwaConfig)(nextConfig));