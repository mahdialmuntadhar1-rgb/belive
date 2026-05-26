import {
  Env, json, error, handleError,
  hashPassword, verifyPassword,
  signJWT, generateId,
  requireAuth,
} from '../utils';

export async function signup(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as any;
    const { email, password, full_name, role = 'user', business_name } = body;

    if (!email || !password) return error('Email and password are required', 400, env);
    if (password.length < 6) return error('Password must be at least 6 characters', 400, env);
    if (role === 'business_owner' && !business_name) return error('Business name is required for business owners', 400, env);

    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first();
    if (existing) return error('Email already in use', 409, env);

    const id = generateId();
    const now = Date.now();
    const passwordHash = await hashPassword(password);
    const effectiveRole = env.ADMIN_EMAIL && email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase() ? 'admin' : role;

    await env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, role, full_name, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, email.toLowerCase(), passwordHash, effectiveRole, full_name || null, now).run();

    if (effectiveRole === 'business_owner' && business_name) {
      const bizId = generateId();
      await env.DB.prepare(
        'INSERT INTO businesses (id, owner_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(bizId, id, business_name, now, now).run();
    }

    const token = await signJWT({ sub: id, email: email.toLowerCase(), role: effectiveRole }, env.JWT_SECRET);
    return json({ token, user: { id, email: email.toLowerCase(), role: effectiveRole, full_name: full_name || null } }, 201, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function login(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as any;
    const { email, password } = body;

    if (!email || !password) return error('Email and password are required', 400, env);

    const user = await env.DB.prepare(
      'SELECT id, email, password_hash, role, full_name, avatar_url FROM users WHERE email = ?'
    ).bind(email.toLowerCase()).first<any>();

    if (!user) return error('Invalid email or password', 401, env);

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) return error('Invalid email or password', 401, env);

    const token = await signJWT({ sub: user.id, email: user.email, role: user.role }, env.JWT_SECRET);
    return json({
      token,
      user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name, avatar_url: user.avatar_url }
    }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function me(request: Request, env: Env): Promise<Response> {
  try {
    const payload = await requireAuth(request, env);
    const user = await env.DB.prepare(
      'SELECT id, email, role, full_name, avatar_url, created_at FROM users WHERE id = ?'
    ).bind(payload.sub).first<any>();

    if (!user) return error('User not found', 404, env);
    return json({ user }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function resetPasswordRequest(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as any;
    const { email } = body;
    if (!email) return error('Email is required', 400, env);

    const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first<any>();
    if (!user) return json({ message: 'If the email exists, a reset link has been sent.' }, 200, env);

    const token = generateId();
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    await env.DB.prepare(
      'INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)'
    ).bind(token, user.id, expiresAt).run();

    if (env.RESEND_API_KEY) {
      const resetUrl = `${request.headers.get('Origin') || ''}/reset-password?token=${token}`;
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'noreply@belive.iq',
          to: email,
          subject: 'Reset your password',
          html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`
        })
      });
    }

    return json({ message: 'If the email exists, a reset link has been sent.', debug_token: env.RESEND_API_KEY ? undefined : token }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function resetPasswordConfirm(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as any;
    const { token, password } = body;
    if (!token || !password) return error('Token and password are required', 400, env);
    if (password.length < 6) return error('Password must be at least 6 characters', 400, env);

    const reset = await env.DB.prepare(
      'SELECT user_id, expires_at, used FROM password_resets WHERE token = ?'
    ).bind(token).first<any>();

    if (!reset) return error('Invalid or expired reset token', 400, env);
    if (reset.used) return error('Reset token already used', 400, env);
    if (reset.expires_at < Date.now()) return error('Reset token expired', 400, env);

    const passwordHash = await hashPassword(password);
    await env.DB.batch([
      env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(passwordHash, reset.user_id),
      env.DB.prepare('UPDATE password_resets SET used = 1 WHERE token = ?').bind(token),
    ]);

    return json({ message: 'Password updated successfully' }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}
