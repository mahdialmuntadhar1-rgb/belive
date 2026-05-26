export interface Env {
  DB: D1Database;
  R2_BUCKET?: R2Bucket;
  JWT_SECRET: string;
  RESEND_API_KEY?: string;
  ADMIN_EMAIL?: string;
  CORS_ORIGIN?: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

// ─── JWT ───────────────────────────────────────────────────────────────────────

function b64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function b64urlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signJWT(
  payload: Omit<JWTPayload, 'exp' | 'iat'>,
  secret: string,
  expiresInSec = 7 * 24 * 3600
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = { ...payload, iat: now, exp: now + expiresInSec };
  const header = b64url(new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = b64url(new TextEncoder().encode(JSON.stringify(fullPayload)));
  const data = `${header}.${body}`;
  const key = await getHmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return `${data}.${b64url(sig)}`;
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT format');
  const [header, body, sig] = parts;
  const data = `${header}.${body}`;
  const key = await getHmacKey(secret);
  const sigBytes = b64urlDecode(sig);
  const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(data));
  if (!valid) throw new Error('Invalid JWT signature');
  const payload: JWTPayload = JSON.parse(new TextDecoder().decode(b64urlDecode(body)));
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('JWT expired');
  return payload;
}

// ─── Password ─────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  return `${btoa(String.fromCharCode(...salt))}:${btoa(String.fromCharCode(...new Uint8Array(bits)))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [saltB64, hashB64] = stored.split(':');
    const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
    const keyMaterial = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
      keyMaterial, 256
    );
    return btoa(String.fromCharCode(...new Uint8Array(bits))) === hashB64;
  } catch {
    return false;
  }
}

// ─── ID ───────────────────────────────────────────────────────────────────────

export function generateId(): string {
  return crypto.randomUUID();
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

export function json(data: unknown, status = 200, env?: Env): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(env),
  });
}

export function error(message: string, status = 400, env?: Env): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: corsHeaders(env),
  });
}

export function corsHeaders(env?: Env, requestOrigin?: string | null): HeadersInit {
  let allowed = env?.CORS_ORIGIN;
  let origin = '*';
  if (allowed) {
    const list = allowed.split(',').map(s => s.trim());
    if (requestOrigin && list.includes(requestOrigin)) origin = requestOrigin;
    else if (list.length === 1) origin = list[0];
  } else if (requestOrigin) {
    origin = requestOrigin;
  }
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export function preflight(env?: Env, requestOrigin?: string | null): Response {
  return new Response(null, { status: 204, headers: corsHeaders(env, requestOrigin) });
}

// ─── Auth extraction ──────────────────────────────────────────────────────────

export async function getAuth(request: Request, env: Env): Promise<JWTPayload | null> {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    return await verifyJWT(auth.slice(7), env.JWT_SECRET);
  } catch {
    return null;
  }
}

export async function requireAuth(request: Request, env: Env): Promise<JWTPayload> {
  const payload = await getAuth(request, env);
  if (!payload) throw new UnauthorizedError('Authentication required');
  return payload;
}

export async function requireAdmin(request: Request, env: Env): Promise<JWTPayload> {
  const payload = await requireAuth(request, env);
  if (payload.role !== 'admin') throw new ForbiddenError('Admin access required');
  return payload;
}

// ─── Custom errors ────────────────────────────────────────────────────────────

export class UnauthorizedError extends Error {
  status = 401;
  constructor(msg = 'Unauthorized') { super(msg); }
}
export class ForbiddenError extends Error {
  status = 403;
  constructor(msg = 'Forbidden') { super(msg); }
}
export class NotFoundError extends Error {
  status = 404;
  constructor(msg = 'Not found') { super(msg); }
}

export function handleError(err: unknown, env?: Env): Response {
  if (err instanceof UnauthorizedError) return error(err.message, 401, env);
  if (err instanceof ForbiddenError) return error(err.message, 403, env);
  if (err instanceof NotFoundError) return error(err.message, 404, env);
  if (err instanceof Error) return error(err.message, 400, env);
  return error('Internal server error', 500, env);
}

// ─── Pagination cursor ────────────────────────────────────────────────────────

export function parsePagination(url: URL): { limit: number; offset: number } {
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0');
  return { limit, offset };
}
