import 'dotenv/config';
import { existsSync } from 'node:fs';

const errors = [];
const required = name => {
  const value = process.env[name]?.trim();
  if (!value || /REPLACE_WITH|PROJECT_REF|URL_ENCODED_PASSWORD|POOLER_HOST/.test(value)) errors.push(`${name}: supply a real value in the backend environment`);
  return value;
};
function httpsOrigin(name) {
  const value = required(name);
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash || url.hostname.endsWith('.example.com') || url.hostname === 'example.com' || url.hostname === 'localhost') throw new Error();
  } catch { errors.push(`${name}: use a canonical HTTPS origin without a path`); }
}
if (process.env.NODE_ENV !== 'production') errors.push('NODE_ENV must be production');
if (process.env.ALLOW_DEMO_LOGIN !== 'false') errors.push('ALLOW_DEMO_LOGIN must be false');
httpsOrigin('APP_URL');
const database = required('DATABASE_URL');
try {
  const url = new URL(database);
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || ['localhost', '127.0.0.1', '::1'].includes(url.hostname)) throw new Error();
  if (url.searchParams.get('sslmode') !== 'verify-full') errors.push('DATABASE_URL: require sslmode=verify-full for verified TLS');
} catch { errors.push('DATABASE_URL: use the production PostgreSQL connection string'); }
if (process.env.STORAGE_PROVIDER !== 'supabase') errors.push('STORAGE_PROVIDER must be supabase for this deployment');
httpsOrigin('SUPABASE_URL');
required('SUPABASE_SERVICE_ROLE_KEY'); required('SUPABASE_STORAGE_BUCKET');
if (process.env.EMAIL_PROVIDER !== 'resend') errors.push('EMAIL_PROVIDER must be resend for this deployment');
required('RESEND_API_KEY');
const sender = required('EMAIL_FROM');
if (sender && /@(?:example\.com|your-domain\.example)/.test(sender)) errors.push('EMAIL_FROM: use your verified Resend sender');
if (process.env.AI_PROVIDER && process.env.AI_PROVIDER !== 'groq') errors.push('AI_PROVIDER: the existing app supports groq only');
if (process.env.AI_PROVIDER === 'groq') required('GROQ_API_KEY');
if (process.env.INITIAL_ADMIN_PASSWORD) errors.push('Remove INITIAL_ADMIN_PASSWORD after provisioning and before launch');
for (const name of Object.keys(process.env)) {
  if (name.startsWith('VITE_') && /SECRET|PASSWORD|SERVICE_ROLE|DATABASE|PRIVATE|API_KEY/.test(name)) errors.push(`${name}: never expose backend credentials through Vite`);
}
if (!existsSync('dist/index.html')) errors.push('Build the frontend with npm run build first');
if (errors.length) {
  console.error('Deployment configuration needs attention (values are intentionally hidden):');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('Backend configuration checks passed. Provider connectivity, private bucket, database API exposure, backups, and email delivery still require live verification.');
}
