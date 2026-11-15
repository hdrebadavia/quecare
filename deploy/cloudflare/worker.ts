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
    const safeRead = request.method === 'GET' || request.method === 'HEAD';
    const deadline = Date.now() + 90000;
    const delays = [1000, 2000, 4000, 8000, 12000, 16000, 20000];
    const unavailable = (status = 502) => finish(Response.json({
      error: 'The health service is starting or temporarily unavailable. Please wait while we reconnect.',
      retryable: true,
    }, { status, headers: { 'Retry-After': '5' } }), true);
    for (let attempt = 0; ; attempt++) {
      let response: Response | undefined;
      try {
        response = await fetch(target, {
          method: request.method,
          headers,
          body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
          redirect: 'manual',
          signal: AbortSignal.timeout(Math.max(1, Math.min(safeRead ? 30000 : 90000, deadline - Date.now()))),
          cache: 'no-store',
        });
      } catch { /* Network failures are retried only for reads. */ }
      const html = response?.headers.get('content-type')?.toLowerCase().includes('text/html');
      const transient = !response || [502, 503, 504].includes(response.status) || (response.ok && html);
      if (!transient && response) return finish(response, true);
      const delay = delays[attempt];
      if (!safeRead || delay === undefined || Date.now() + delay >= deadline) {
        // Render can send an HTML loading/error page instead of an API response.
        if (response && !html) return finish(response, true);
        return unavailable(response?.status === 503 || response?.ok ? 503 : 502);
      }
      await response?.body?.cancel();
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  },
};
