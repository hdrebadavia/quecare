// Read-only public smoke check. Does not authenticate or create application data.
const raw = process.argv[2];
if (!raw) throw new Error('Usage: npm run verify:deployment -- https://your-public-origin');
const origin = new URL(raw);
if (origin.protocol !== 'https:' || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) throw new Error('Supply an HTTPS origin without a path or credentials.');
async function get(path) {
  const response = await fetch(new URL(path, origin), { redirect: 'manual', signal: AbortSignal.timeout(90000) });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  if (!response.headers.get('content-security-policy')) throw new Error(`${path}: CSP is missing`);
  if (path.startsWith('/api/') && !response.headers.get('cache-control')?.includes('no-store')) throw new Error(`${path}: API caching must be disabled`);
  return response;
}
const page = await get('/');
if (!page.headers.get('content-type')?.includes('text/html')) throw new Error('Frontend did not return HTML.');
const health = await (await get('/api/health')).json();
if (health.status !== 'ok') throw new Error('Database health check failed.');
const config = await (await get('/api/config')).json();
if (config.demo !== false || config.emailProvider !== 'resend') throw new Error('Production demo/email configuration is incorrect.');
const me = await (await get('/api/auth/me')).json();
if (me.user !== null) throw new Error('Anonymous request unexpectedly returned an authenticated user.');
const missing = await fetch(new URL('/api/deployment-check-missing', origin), { signal: AbortSignal.timeout(90000) });
if (missing.status !== 404 || !missing.headers.get('content-type')?.includes('application/json') || !missing.headers.get('cache-control')?.includes('no-store')) throw new Error('Unknown API routes must return uncached JSON 404s, never the SPA.');
console.log('Public deployment smoke check passed: frontend, API/database, production config, anonymous auth, security headers, and uncached API routing.');
