import { NextResponse, type NextRequest } from "next/server";

function getBackendOrigin(): string {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000"
  ).replace(/\/$/, "");
}

/** Fetch API colapsa varios Set-Cookie en uno; hay que reenviarlos uno por uno. */
function forwardUpstreamHeaders(upstream: Response): Headers {
  const responseHeaders = new Headers();

  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") return;
    responseHeaders.set(key, value);
  });

  const setCookies = upstream.headers.getSetCookie?.() ?? [];
  if (setCookies.length > 0) {
    for (const cookie of setCookies) {
      responseHeaders.append("set-cookie", cookie);
    }
  } else {
    const single = upstream.headers.get("set-cookie");
    if (single) {
      responseHeaders.set("set-cookie", single);
    }
  }

  responseHeaders.delete("content-encoding");
  responseHeaders.delete("transfer-encoding");
  return responseHeaders;
}

export function shouldProxyBackendApi(pathname: string): boolean {
  if (!pathname.startsWith("/api/")) return false;
  if (pathname.startsWith("/api/site-content")) return false;
  if (pathname.startsWith("/api/uploads")) return false;
  return true;
}

export async function proxyApiRequest(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  const apiPrefix = "/api/";
  const relativePath = pathname.startsWith(apiPrefix)
    ? pathname.slice(apiPrefix.length)
    : "";
  const pathSegments = relativePath ? relativePath.split("/") : [];

  try {
    const targetUrl = `${getBackendOrigin()}/api/${pathSegments.join("/")}${request.nextUrl.search}`;

    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("connection");
    headers.delete("content-length");

    const init: RequestInit = {
      method: request.method,
      headers,
      redirect: "manual",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = await request.arrayBuffer();
    }

    let upstream: Response;
    try {
      upstream = await fetch(targetUrl, init);
    } catch {
      return NextResponse.json(
        {
          error: "No se pudo conectar con el servidor de la API",
          code: "API_UNREACHABLE",
          path: pathSegments,
        },
        { status: 502 },
      );
    }

    const body = await upstream.arrayBuffer();
    const responseHeaders = forwardUpstreamHeaders(upstream);
    if (body.byteLength > 0) {
      responseHeaders.set("content-length", String(body.byteLength));
    } else {
      responseHeaders.delete("content-length");
    }

    return new NextResponse(body.byteLength > 0 ? body : null, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[api proxy]", error);
    return NextResponse.json(
      {
        error:
          "No se pudo reenviar la solicitud al servidor. Reintentá en unos segundos.",
        code: "PROXY_ERROR",
        path: pathSegments,
      },
      { status: 500 },
    );
  }
}
