'use client';

type CmsFetchInit = Omit<RequestInit, 'body'> & { body?: unknown };

/** Peticiones al CMS (route handlers de Next). */
export async function cmsFetch<T>(path: string, init?: CmsFetchInit): Promise<T> {
  const { body, headers, ...rest } = init ?? {};
  let res: Response;
  try {
    res = await fetch(path, {
      ...rest,
      credentials: 'include',
      headers: {
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    const err = new Error('NETWORK_ERROR') as Error & { isNetworkError?: boolean };
    err.isNetworkError = true;
    throw err;
  }

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const err = new Error('CMS request failed') as Error & { response?: { data?: unknown } };
    err.response = { data };
    throw err;
  }

  return data as T;
}
