import {
  Env, json, error, handleError,
  generateId, parsePagination,
  requireAuth,
} from '../utils';

export async function listReviews(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const { limit, offset } = parsePagination(url);
    const businessId = url.searchParams.get('businessId');
    if (!businessId) return error('businessId is required', 400, env);

    const countRow = await env.DB.prepare('SELECT COUNT(*) as total FROM reviews WHERE business_id = ?').bind(businessId).first<{ total: number }>();
    const rows = await env.DB.prepare(`
      SELECT r.*, u.full_name AS user_name, u.avatar_url AS user_avatar
      FROM reviews r LEFT JOIN users u ON r.user_id = u.id
      WHERE r.business_id = ? ORDER BY r.created_at DESC LIMIT ? OFFSET ?
    `).bind(businessId, limit, offset).all();

    return json({ data: rows.results || [], total: countRow?.total ?? 0 }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function addReview(request: Request, env: Env): Promise<Response> {
  try {
    const payload = await requireAuth(request, env);
    const body = await request.json() as any;
    const { business_id, rating, comment } = body;
    if (!business_id || rating === undefined) return error('business_id and rating are required', 400, env);
    if (rating < 1 || rating > 5) return error('Rating must be between 1 and 5', 400, env);

    const id = generateId();
    const now = Date.now();
    await env.DB.prepare(
      'INSERT INTO reviews (id, business_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, business_id, payload.sub, rating, comment || null, now).run();

    const avgRow = await env.DB.prepare('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE business_id = ?').bind(business_id).first<any>();
    if (avgRow) {
      await env.DB.prepare('UPDATE businesses SET rating = ?, review_count = ? WHERE id = ?').bind(
        Math.round(avgRow.avg * 10) / 10, avgRow.cnt, business_id
      ).run();
    }

    return json({ data: { id, business_id, user_id: payload.sub, rating, comment, created_at: now } }, 201, env);
  } catch (err) {
    return handleError(err, env);
  }
}
