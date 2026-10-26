import { NextRequest, NextResponse } from "next/server";
import { proxyApiRequest, shouldProxyBackendApi } from "@/lib/backend-api-proxy";
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
  response.headers.set(
    "X-Frame-Options",
    isCmsPreviewPath(request.nextUrl.pathname) ? "SAMEORIGIN" : "DENY",
  );
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(self), microphone=(), geolocation=()",
  );

  return response;
}

function applyApiRateLimits(request: NextRequest): NextResponse | null {
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

  return null;
}

export async function middleware(request: NextRequest) {
  const rateLimited = applyApiRateLimits(request);
  if (rateLimited) {
    return applySecurityHeaders(request, rateLimited);
  }

  if (shouldProxyBackendApi(request.nextUrl.pathname)) {
    const proxied = await proxyApiRequest(request);
    return applySecurityHeaders(request, proxied);
  }

  return applySecurityHeaders(request, NextResponse.next());
}

export function authMiddleware(request: NextRequest) {
  const rateLimited = applyApiRateLimits(request);
  if (rateLimited) return rateLimited;
  return applySecurityHeaders(request, NextResponse.next());
}

export function securityHeadersMiddleware(request: NextRequest) {
  return applySecurityHeaders(request, NextResponse.next());
}

export default middleware;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|pwa-dev-sw.js|robots.txt|sitemap.xml|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.webp$|.*\\.ico$|.*\\.woff$|.*\\.woff2$|.*\\.mp4$|.*\\.webm$).*)",
  ],
};
