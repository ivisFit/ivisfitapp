import { NextRequest, NextResponse } from "next/server";
import {
  authRateLimiter,
  apiRateLimiter,
} from "@/lib/rate-limiter";

function isCmsPreviewPath(pathname: string): boolean {
  return pathname === "/cms-preview" || pathname.startsWith("/cms-preview/");
}

function applySecurityHeaders(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  // La preview del CMS se embebe en un iframe same-origin (/web-config).
  response.headers.set(
    "X-Frame-Options",
    isCmsPreviewPath(request.nextUrl.pathname) ? "SAMEORIGIN" : "DENY",
  );
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  return response;
}

export function authMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith("/api/auth/");
  const isTwoFactorRoute = pathname.startsWith("/api/auth/two-factor/");
  const isReadOnly = request.method === "GET";

  if (isAuthRoute && !isTwoFactorRoute && !isReadOnly) {
    const rateLimitResponse = authRateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;
  }

  const isApiRoute = pathname.startsWith("/api/");
  if (isApiRoute && !isAuthRoute) {
    const rateLimitResponse = apiRateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;
  }

  return applySecurityHeaders(request, NextResponse.next());
}

export function securityHeadersMiddleware(request: NextRequest) {
  return applySecurityHeaders(request, NextResponse.next());
}

export default authMiddleware;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json, sw.js, robots.txt, sitemap.xml
     * - public folder assets (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|pwa-dev-sw.js|robots.txt|sitemap.xml|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.webp$|.*\\.ico$|.*\\.woff$|.*\\.woff2$|.*\\.mp4$|.*\\.webm$).*)",
  ],
};
