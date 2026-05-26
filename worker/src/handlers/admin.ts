import { Env, json, error, handleError, requireAdmin, parsePagination } from '../utils';

export async function getSummary(request: Request, env: Env): Promise<Response> {
  try {
    await requireAdmin(request, env);
    const [biz, posts, claims, featured, verified] = await env.DB.batch([
      env.DB.prepare('SELECT COUNT(*) as c FROM businesses'),
      env.DB.prepare('SELECT COUNT(*) as c FROM posts'),
      env.DB.prepare("SELECT COUNT(*) as c FROM claim_requests WHERE status = 'pending'"),
      env.DB.prepare('SELECT COUNT(*) as c FROM businesses WHERE is_featured = 1'),
      env.DB.prepare('SELECT COUNT(*) as c FROM businesses WHERE is_verified = 1'),
    ]);
    return json({
      totalBusinesses: (biz.results[0] as any)?.c ?? 0,
      totalPosts: (posts.results[0] as any)?.c ?? 0,
      pendingClaims: (claims.results[0] as any)?.c ?? 0,
      featuredBusinesses: (featured.results[0] as any)?.c ?? 0,
      verifiedBusinesses: (verified.results[0] as any)?.c ?? 0,
    }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function searchBusinesses(request: Request, env: Env): Promise<Response> {
  try {
    await requireAdmin(request, env);
    const url = new URL(request.url);
    const { limit, offset } = parsePagination(url);
    const name = url.searchParams.get('name');
    const phone = url.searchParams.get('phone');
    const category = url.searchParams.get('category');
    const governorate = url.searchParams.get('governorate');

    const conditions: string[] = [];
    const bindings: unknown[] = [];
    if (name) { conditions.push('name LIKE ?'); bindings.push(`%${name}%`); }
    if (phone) {
      conditions.push('(phone LIKE ? OR phone_1 LIKE ? OR phone_2 LIKE ?)');
      bindings.push(`%${phone}%`, `%${phone}%`, `%${phone}%`);
    }
    if (category) { conditions.push('category = ?'); bindings.push(category); }
    if (governorate) { conditions.push('governorate = ?'); bindings.push(governorate); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await env.DB.prepare(
      `SELECT * FROM businesses ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).bind(...bindings, limit, offset).all();

    return json({ data: rows.results || [] }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function listClaimRequests(request: Request, env: Env): Promise<Response> {
  try {
    await requireAdmin(request, env);
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'pending';

    const rows = await env.DB.prepare(`
      SELECT cr.*,
        b.name AS business_name,
        u.full_name AS user_name, u.email AS user_email
      FROM claim_requests cr
      LEFT JOIN businesses b ON cr.business_id = b.id
      LEFT JOIN users u ON cr.user_id = u.id
      WHERE cr.status = ?
      ORDER BY cr.created_at DESC
    `).bind(status).all();

    return json({ data: rows.results || [] }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function handleClaim(request: Request, env: Env, id: string): Promise<Response> {
  try {
    await requireAdmin(request, env);
    const body = await request.json() as any;
    const { action, verify = false } = body;
    if (!['approve', 'reject'].includes(action)) return error('action must be approve or reject', 400, env);

    const claim = await env.DB.prepare('SELECT * FROM claim_requests WHERE id = ?').bind(id).first<any>();
    if (!claim) return error('Claim request not found', 404, env);

    const stmts = [
      env.DB.prepare("UPDATE claim_requests SET status = ? WHERE id = ?").bind(action === 'approve' ? 'approved' : 'rejected', id)
    ];

    if (action === 'approve') {
      stmts.push(
        env.DB.prepare('UPDATE businesses SET owner_id = ?, is_verified = ? WHERE id = ?').bind(claim.user_id, verify ? 1 : 0, claim.business_id)
      );
    }

    await env.DB.batch(stmts);
    return json({ message: `Claim ${action}d` }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}
