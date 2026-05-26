import {
  Env, json, error, handleError,
  generateId, requireAuth, requireAdmin,
} from '../utils';

// ─── Hero Slides ──────────────────────────────────────────────────────────────

export async function listHeroSlides(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get('active') !== 'false';
    const where = activeOnly ? 'WHERE is_active = 1' : '';
    const rows = await env.DB.prepare(`SELECT * FROM hero_slides ${where} ORDER BY display_order ASC`).all();
    return json({ data: rows.results || [] }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function createHeroSlide(request: Request, env: Env): Promise<Response> {
  try {
    await requireAdmin(request, env);
    const body = await request.json() as any;
    const id = generateId();
    const now = Date.now();
    await env.DB.prepare(`
      INSERT INTO hero_slides (id, title_en, title_ar, title_ku, subtitle_en, subtitle_ar, subtitle_ku,
        slogan_en, slogan_ar, slogan_ku, image_url, cta_text_en, cta_text_ar, cta_text_ku,
        cta_link, display_order, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, body.title_en || null, body.title_ar || null, body.title_ku || null,
      body.subtitle_en || null, body.subtitle_ar || null, body.subtitle_ku || null,
      body.slogan_en || null, body.slogan_ar || null, body.slogan_ku || null,
      body.image_url || null, body.cta_text_en || null, body.cta_text_ar || null, body.cta_text_ku || null,
      body.cta_link || null, body.display_order ?? 0, body.is_active !== false ? 1 : 0, now, now
    ).run();
    const row = await env.DB.prepare('SELECT * FROM hero_slides WHERE id = ?').bind(id).first();
    return json({ data: row }, 201, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function updateHeroSlide(request: Request, env: Env, id: string): Promise<Response> {
  try {
    await requireAdmin(request, env);
    return await genericUpdate(env, 'hero_slides', id, await request.json() as any, [
      'title_en', 'title_ar', 'title_ku', 'subtitle_en', 'subtitle_ar', 'subtitle_ku',
      'slogan_en', 'slogan_ar', 'slogan_ku', 'image_url',
      'cta_text_en', 'cta_text_ar', 'cta_text_ku', 'cta_link', 'display_order', 'is_active'
    ]);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function deleteHeroSlide(request: Request, env: Env, id: string): Promise<Response> {
  try {
    await requireAdmin(request, env);
    await env.DB.prepare('DELETE FROM hero_slides WHERE id = ?').bind(id).run();
    return json({ message: 'Deleted' }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

// ─── Features ─────────────────────────────────────────────────────────────────

export async function listFeatures(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get('active') !== 'false';
    const where = activeOnly ? 'WHERE is_active = 1' : '';
    const rows = await env.DB.prepare(`SELECT * FROM features ${where} ORDER BY display_order ASC`).all();
    return json({ data: rows.results || [] }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function createFeature(request: Request, env: Env): Promise<Response> {
  try {
    await requireAdmin(request, env);
    const body = await request.json() as any;
    const id = generateId();
    const now = Date.now();
    await env.DB.prepare(`
      INSERT INTO features (id, title_en, title_ar, title_ku, description_en, description_ar, description_ku,
        icon_name, display_order, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, body.title_en || null, body.title_ar || null, body.title_ku || null,
      body.description_en || null, body.description_ar || null, body.description_ku || null,
      body.icon_name || null, body.display_order ?? 0, body.is_active !== false ? 1 : 0, now, now
    ).run();
    const row = await env.DB.prepare('SELECT * FROM features WHERE id = ?').bind(id).first();
    return json({ data: row }, 201, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function updateFeature(request: Request, env: Env, id: string): Promise<Response> {
  try {
    await requireAdmin(request, env);
    return await genericUpdate(env, 'features', id, await request.json() as any, [
      'title_en', 'title_ar', 'title_ku', 'description_en', 'description_ar', 'description_ku',
      'icon_name', 'display_order', 'is_active'
    ]);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function deleteFeature(request: Request, env: Env, id: string): Promise<Response> {
  try {
    await requireAdmin(request, env);
    await env.DB.prepare('DELETE FROM features WHERE id = ?').bind(id).run();
    return json({ message: 'Deleted' }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function createCategory(request: Request, env: Env): Promise<Response> {
  try {
    await requireAdmin(request, env);
    const body = await request.json() as any;
    if (!body.name_en) return error('name_en is required', 400, env);
    const id = generateId();
    const now = Date.now();
    await env.DB.prepare(`
      INSERT INTO categories (id, name_en, name_ar, name_ku, icon_name, image_url, display_order, is_active, is_hot, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, body.name_en, body.name_ar || null, body.name_ku || null, body.icon_name || 'LayoutGrid',
      body.image_url || null, body.display_order ?? 0, body.is_active !== false ? 1 : 0, body.is_hot ? 1 : 0, now, now
    ).run();
    const row = await env.DB.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first();
    return json({ data: row }, 201, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function updateCategory(request: Request, env: Env, id: string): Promise<Response> {
  try {
    await requireAdmin(request, env);
    return await genericUpdate(env, 'categories', id, await request.json() as any, [
      'name_en', 'name_ar', 'name_ku', 'icon_name', 'image_url', 'display_order', 'is_active', 'is_hot'
    ]);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function deleteCategory(request: Request, env: Env, id: string): Promise<Response> {
  try {
    await requireAdmin(request, env);
    await env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
    return json({ message: 'Deleted' }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

// ─── Generic content update (for useAdminDB) ─────────────────────────────────

export async function genericContentUpdate(request: Request, env: Env, table: string, id: string): Promise<Response> {
  try {
    await requireAdmin(request, env);
    const body = await request.json() as any;
    const allowed = ['hero_slides', 'features', 'categories', 'posts', 'businesses'];
    if (!allowed.includes(table)) return error('Invalid table', 400, env);
    return await genericUpdate(env, table, id, body, Object.keys(body));
  } catch (err) {
    return handleError(err, env);
  }
}

export async function genericContentCreate(request: Request, env: Env, table: string): Promise<Response> {
  try {
    await requireAdmin(request, env);
    const allowed = ['hero_slides', 'features', 'categories', 'posts'];
    if (!allowed.includes(table)) return error('Invalid table', 400, env);
    const body = await request.json() as any;
    const id = generateId();
    const now = Date.now();
    const fields = ['id', ...Object.keys(body), 'created_at', 'updated_at'];
    const vals = [id, ...Object.values(body), now, now];
    await env.DB.prepare(
      `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`
    ).bind(...vals).run();
    const row = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first();
    return json({ data: row }, 201, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function genericContentDelete(request: Request, env: Env, table: string, id: string): Promise<Response> {
  try {
    await requireAdmin(request, env);
    const allowed = ['hero_slides', 'features', 'categories', 'posts', 'businesses'];
    if (!allowed.includes(table)) return error('Invalid table', 400, env);
    await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
    return json({ message: 'Deleted' }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

// ─── Internal helper ──────────────────────────────────────────────────────────

async function genericUpdate(env: Env, table: string, id: string, body: any, allowedFields: string[]): Promise<Response> {
  const now = Date.now();
  const fields: string[] = [];
  const vals: unknown[] = [];
  for (const key of allowedFields) {
    if (key in body && key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = ?`);
      vals.push(body[key]);
    }
  }
  fields.push('updated_at = ?');
  vals.push(now);
  await env.DB.prepare(`UPDATE ${table} SET ${fields.join(', ')} WHERE id = ?`).bind(...vals, id).run();
  const row = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first();
  return json({ data: row }, 200, env);
}
