import {
  Env, json, error, handleError,
  generateId, parsePagination,
  requireAuth, NotFoundError,
} from '../utils';

export async function listPosts(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const { limit, offset } = parsePagination(url);
    const businessId = url.searchParams.get('businessId');

    const conditions = ["p.is_active = 1 AND p.status = 'active'"];
    const bindings: unknown[] = [];
    if (businessId) { conditions.push('p.business_id = ?'); bindings.push(businessId); }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const rows = await env.DB.prepare(`
      SELECT p.*,
        b.name AS business_name, b.name_ar AS business_name_ar,
        b.category AS business_category, b.city AS business_city,
        b.image_url AS business_image, b.phone AS business_phone,
        b.is_active AS business_is_active, b.status AS business_status
      FROM posts p
      LEFT JOIN businesses b ON p.business_id = b.id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...bindings, limit, offset).all();

    return json({ data: rows.results || [] }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function createPost(request: Request, env: Env): Promise<Response> {
  try {
    const payload = await requireAuth(request, env);
    const body = await request.json() as any;
    const { business_id, caption, content, image_url, title } = body;

    if (!business_id) return error('business_id is required', 400, env);

    const business = await env.DB.prepare('SELECT owner_id FROM businesses WHERE id = ?').bind(business_id).first<any>();
    if (!business) throw new NotFoundError('Business not found');
    if (payload.role !== 'admin' && business.owner_id !== payload.sub) {
      return error('Not authorized to post for this business', 403, env);
    }

    const id = generateId();
    const now = Date.now();
    await env.DB.prepare(
      'INSERT INTO posts (id, business_id, title, content, caption, image_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, business_id, title || null, content || null, caption || null, image_url || null, now).run();

    const row = await env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
    return json({ data: row }, 201, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function updatePost(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const payload = await requireAuth(request, env);
    const body = await request.json() as any;

    const updatable = ['title', 'content', 'caption', 'image_url', 'is_active', 'status', 'likes_count', 'views'];
    const fields: string[] = [];
    const vals: unknown[] = [];
    for (const key of updatable) {
      if (key in body) { fields.push(`${key} = ?`); vals.push(body[key]); }
    }
    if (!fields.length) return error('No updatable fields provided', 400, env);

    await env.DB.prepare(`UPDATE posts SET ${fields.join(', ')} WHERE id = ?`).bind(...vals, id).run();
    const row = await env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
    return json({ data: row }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function deletePost(request: Request, env: Env, id: string): Promise<Response> {
  try {
    await requireAuth(request, env);
    await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
    return json({ message: 'Post deleted' }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function likePost(request: Request, env: Env, id: string): Promise<Response> {
  try {
    await env.DB.prepare('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?').bind(id).run();
    return json({ message: 'Liked' }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function addComment(request: Request, env: Env, postId: string): Promise<Response> {
  try {
    const body = await request.json() as any;
    const { author_name, comment_text } = body;
    if (!comment_text) return error('comment_text is required', 400, env);

    const cid = generateId();
    const now = Date.now();
    await env.DB.batch([
      env.DB.prepare('INSERT INTO post_comments (id, post_id, author_name, comment_text, created_at) VALUES (?, ?, ?, ?, ?)').bind(cid, postId, author_name || 'Anonymous', comment_text, now),
      env.DB.prepare('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?').bind(postId),
    ]);

    return json({ data: { id: cid, post_id: postId, author_name, comment_text, created_at: now } }, 201, env);
  } catch (err) {
    return handleError(err, env);
  }
}
