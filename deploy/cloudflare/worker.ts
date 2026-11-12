interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  API_ORIGIN: string;
}

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'no-referrer',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src 'self'; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; connect-src 'self'; upgrade-insecure-requests",
};

function finish(response: Response, api: boolean) {
  const result = new Response(response.body, response);
  for (const [name, value] of Object.entries(securityHeaders)) result.headers.set(name, value);
  // Never cache sessions, patient data, API errors, or downloads at the edge/browser.
  if (api) result.headers.set('Cache-Control', 'no-store');
  return result;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const incoming = new URL(request.url);
    const api = incoming.pathname === '/api' || incoming.pathname.startsWith('/api/');
    if (!api) return finish(await env.ASSETS.fetch(request), false);

    let origin: URL;
    try {
      origin = new URL(env.API_ORIGIN);
      if (origin.protocol !== 'https:' || origin.username || origin.password ||
          origin.pathname !== '/' || origin.search || origin.hash || origin.host === incoming.host) {
        throw new Error('Invalid backend origin');
      }
    } catch {
      return finish(Response.json({ error: 'Backend origin is not configured.' }, { status: 503 }), true);
    }

    const target = new URL(incoming.pathname + incoming.search, origin);
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('forwarded');
    headers.delete('x-real-ip');
    headers.delete('x-forwarded-for');
    const clientIP = request.headers.get('CF-Connecting-IP');
    if (clientIP) headers.set('X-Forwarded-For', clientIP);
    headers.set('X-Forwarded-Host', incoming.host);
    headers.set('X-Forwarded-Proto', 'https');
    // Preserve Origin, Cookie, CSRF, multipart boundaries, and the request body.
    // Do not follow redirects with credentials to another origin.
    try {
      const response = await fetch(target, {
        method: request.method,
        headers,
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
        redirect: 'manual',
        // Allow the selected free Render instance time to wake after idling.
        signal: AbortSignal.timeout(90000),
        cache: 'no-store',
      });
      return finish(response, true);
    } catch {
      return finish(Response.json({ error: 'The service is temporarily unavailable. Please try again.' }, { status: 502 }), true);
    }
  },
};
