import { afterEach, describe, expect, it, vi } from 'vitest';
import worker from '../deploy/cloudflare/worker';

const env = {
  API_ORIGIN: 'https://api.example.com',
  ASSETS: { fetch: vi.fn(async () => new Response('<html>QueCare</html>', { headers: { 'Content-Type': 'text/html' } })) },
};
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('Cloudflare deployment gateway', () => {
  it('serves the existing frontend with security headers', async () => {
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    const result = await worker.fetch(new Request('https://quecare.example.com/'), env);
    expect(await result.text()).toContain('QueCare');
    expect(result.headers.get('Content-Security-Policy')).toContain("connect-src 'self'");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('preserves sessions, CSRF, origin, uploads and backend errors without caching', async () => {
    const upstream = vi.fn(async () => new Response('{"error":"forbidden"}', {
      status: 403, headers: { 'Set-Cookie': 'quecare_session=abc; Path=/; HttpOnly; Secure; SameSite=Lax', 'Cache-Control': 'public, max-age=3600' },
    }));
    vi.stubGlobal('fetch', upstream);
    const body = new FormData(); body.set('file', new Blob(['example']), 'example.txt');
    const request = new Request('https://quecare.example.com/api/records?x=1', {
      method: 'POST', body,
      headers: { Origin: 'https://quecare.example.com', Cookie: 'quecare_session=abc', 'X-CSRF-Token': 'csrf', 'CF-Connecting-IP': '203.0.113.9', 'X-Forwarded-For': 'spoofed' },
    });
    const result = await worker.fetch(request, env);
    const [url, init] = upstream.mock.calls[0] as unknown as [URL, RequestInit];
    const headers = new Headers(init.headers);
    expect(url.toString()).toBe('https://api.example.com/api/records?x=1');
    expect(headers.get('origin')).toBe('https://quecare.example.com');
    expect(headers.get('cookie')).toBe('quecare_session=abc');
    expect(headers.get('x-csrf-token')).toBe('csrf');
    expect(headers.get('x-forwarded-for')).toBe('203.0.113.9');
    expect(headers.get('content-type')).toContain('multipart/form-data; boundary=');
    expect(init.body).toBe(request.body);
    expect(init.redirect).toBe('manual');
    expect(init.cache).toBe('no-store');
    expect(result.status).toBe(403);
    expect(result.headers.get('set-cookie')).toContain('quecare_session=abc');
    expect(result.headers.get('cache-control')).toBe('no-store');
  });

  it('does not turn API navigation or unknown API routes into the SPA', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'Endpoint not found.' }, { status: 404 })));
    const assets = vi.spyOn(env.ASSETS, 'fetch'); assets.mockClear();
    for (const path of ['/api', '/api/missing']) {
      const result = await worker.fetch(new Request('https://quecare.example.com' + path, { headers: { 'Sec-Fetch-Mode': 'navigate' } }), env);
      expect(result.status).toBe(404);
    }
    expect(assets).not.toHaveBeenCalled();
  });

  it('fails safely for missing/unsafe backend configuration and upstream outages', async () => {
    const fetcher = vi.fn(async () => { throw new Error('private upstream details'); });
    vi.stubGlobal('fetch', fetcher);
    for (const origin of ['', 'http://api.example.com', 'https://user:pass@api.example.com', 'https://api.example.com/path', 'https://quecare.example.com']) {
      const result = await worker.fetch(new Request('https://quecare.example.com/api/health'), { ...env, API_ORIGIN: origin });
      expect(result.status).toBe(503);
    }
    expect(fetcher).not.toHaveBeenCalled();
    const result = await worker.fetch(new Request('https://quecare.example.com/api/health'), env);
    expect(result.status).toBe(502);
    expect(result.headers.get('cache-control')).toBe('no-store');
    expect(await result.text()).not.toContain('private upstream details');
  });
});
