import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await context.params;
    const targetUrl = `${getBackendOrigin()}/api/${path.join("/")}${request.nextUrl.search}`;

    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("connection");
    headers.delete("content-length");
    // El proxy es server-to-server. Reenviar Origin/Referer hace que Express
    // CORS en Render tire 500 si el frontend de Netlify no está en TRUSTED_ORIGINS.
    headers.delete("origin");
    headers.delete("referer");

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
        { error: "No se pudo conectar con el servidor" },
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
      { error: "Error al comunicarse con el servidor" },
      { status: 500 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;

export const dynamic = "force-dynamic";
