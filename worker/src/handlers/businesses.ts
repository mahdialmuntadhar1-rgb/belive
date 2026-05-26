import {
  Env, json, error, handleError,
  generateId, parsePagination,
  requireAuth, NotFoundError,
} from '../utils';

function mapBusiness(row: any) {
  return {
    ...row,
    social_links: row.social_links ? JSON.parse(row.social_links) : {},
    opening_hours: row.opening_hours ? JSON.parse(row.opening_hours) : {},
    is_featured: Boolean(row.is_featured),
    is_verified: Boolean(row.is_verified),
    is_active: Boolean(row.is_active),
  };
}

export async function listBusinesses(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const { limit, offset } = parsePagination(url);
    const governorate = url.searchParams.get('governorate');
    const city = url.searchParams.get('city');
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');

    const conditions: string[] = [];
    const bindings: unknown[] = [];

    if (governorate) { conditions.push('governorate = ?'); bindings.push(governorate); }
    if (city) { conditions.push('city = ?'); bindings.push(city); }
    if (category) { conditions.push('category = ?'); bindings.push(category); }
    if (search) {
      conditions.push('(name LIKE ? OR description LIKE ? OR name_ar LIKE ?)');
      bindings.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRow = await env.DB.prepare(`SELECT COUNT(*) as total FROM businesses ${where}`)
      .bind(...bindings).first<{ total: number }>();
    const total = countRow?.total ?? 0;

    const rows = await env.DB.prepare(
      `SELECT * FROM businesses ${where} ORDER BY is_featured DESC, created_at DESC LIMIT ? OFFSET ?`
    ).bind(...bindings, limit, offset).all();

    return json({
      data: (rows.results || []).map(mapBusiness),
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function getBusiness(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const row = await env.DB.prepare('SELECT * FROM businesses WHERE id = ?').bind(id).first<any>();
    if (!row) throw new NotFoundError('Business not found');
    return json({ data: mapBusiness(row) }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function createBusiness(request: Request, env: Env): Promise<Response> {
  try {
    const payload = await requireAuth(request, env);
    const body = await request.json() as any;
    const { name, ...rest } = body;
    if (!name) return error('Business name is required', 400, env);

    const id = generateId();
    const now = Date.now();
    await env.DB.prepare(`
      INSERT INTO businesses (
        id, owner_id, name, name_ar, name_ku, description, description_ar, description_ku,
        category, governorate, city, neighborhood, address, phone, phone_1, phone_2,
        website, image_url, social_links, opening_hours, lat, lng,
        is_featured, is_verified, is_active, status, rating, review_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 1, 'approved', 0, 0, ?, ?)
    `).bind(
      id, payload.sub, name,
      rest.name_ar || null, rest.name_ku || null,
      rest.description || null, rest.description_ar || null, rest.description_ku || null,
      rest.category || null, rest.governorate || null, rest.city || null,
      rest.neighborhood || null, rest.address || null,
      rest.phone || null, rest.phone_1 || null, rest.phone_2 || null,
      rest.website || null, rest.image_url || null,
      JSON.stringify(rest.social_links || {}),
      JSON.stringify(rest.opening_hours || {}),
      rest.lat || null, rest.lng || null,
      now, now
    ).run();

    const row = await env.DB.prepare('SELECT * FROM businesses WHERE id = ?').bind(id).first<any>();
    return json({ data: mapBusiness(row) }, 201, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function updateBusiness(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const payload = await requireAuth(request, env);
    const existing = await env.DB.prepare('SELECT owner_id FROM businesses WHERE id = ?').bind(id).first<any>();
    if (!existing) throw new NotFoundError('Business not found');
    if (payload.role !== 'admin' && existing.owner_id !== payload.sub) {
      return error('Not authorized to update this business', 403, env);
    }

    const body = await request.json() as any;
    const now = Date.now();
    const fields: string[] = [];
    const vals: unknown[] = [];

    const updatable = [
      'name', 'name_ar', 'name_ku', 'description', 'description_ar', 'description_ku',
      'category', 'governorate', 'city', 'neighborhood', 'address',
      'phone', 'phone_1', 'phone_2', 'website', 'image_url', 'lat', 'lng',
      'is_featured', 'is_verified', 'is_active', 'status', 'rating', 'review_count',
    ];

    for (const key of updatable) {
      if (key in body) { fields.push(`${key} = ?`); vals.push(body[key]); }
    }
    if ('social_links' in body) { fields.push('social_links = ?'); vals.push(JSON.stringify(body.social_links)); }
    if ('opening_hours' in body) { fields.push('opening_hours = ?'); vals.push(JSON.stringify(body.opening_hours)); }
    fields.push('updated_at = ?'); vals.push(now);

    await env.DB.prepare(`UPDATE businesses SET ${fields.join(', ')} WHERE id = ?`).bind(...vals, id).run();
    const row = await env.DB.prepare('SELECT * FROM businesses WHERE id = ?').bind(id).first<any>();
    return json({ data: mapBusiness(row) }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function deleteBusiness(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const payload = await requireAuth(request, env);
    const existing = await env.DB.prepare('SELECT owner_id FROM businesses WHERE id = ?').bind(id).first<any>();
    if (!existing) throw new NotFoundError('Business not found');
    if (payload.role !== 'admin' && existing.owner_id !== payload.sub) {
      return error('Not authorized to delete this business', 403, env);
    }
    await env.DB.prepare('DELETE FROM businesses WHERE id = ?').bind(id).run();
    return json({ message: 'Business deleted' }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function getOwnedBusinesses(request: Request, env: Env): Promise<Response> {
  try {
    const payload = await requireAuth(request, env);
    const rows = await env.DB.prepare('SELECT * FROM businesses WHERE owner_id = ? ORDER BY created_at DESC').bind(payload.sub).all();
    return json({ data: (rows.results || []).map(mapBusiness) }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function claimBusiness(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const payload = await requireAuth(request, env);
    const body = await request.json() as any;
    const { phone } = body;

    const business = await env.DB.prepare('SELECT id, owner_id FROM businesses WHERE id = ?').bind(id).first<any>();
    if (!business) throw new NotFoundError('Business not found');
    if (business.owner_id) return error('Business is already claimed', 409, env);

    const reqId = generateId();
    await env.DB.prepare(
      'INSERT INTO claim_requests (id, business_id, user_id, phone, status, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(reqId, id, payload.sub, phone || null, 'pending', Date.now()).run();

    return json({ message: 'Claim request submitted', id: reqId }, 201, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function searchBusinessesByPhone(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const phone = url.searchParams.get('phone');
    if (!phone) return error('phone query param required', 400, env);

    const rows = await env.DB.prepare(
      'SELECT * FROM businesses WHERE (phone = ? OR phone_1 = ? OR phone_2 = ?) AND owner_id IS NULL'
    ).bind(phone, phone, phone).all();
    return json({ data: (rows.results || []).map(mapBusiness) }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function bulkInsertBusinesses(request: Request, env: Env): Promise<Response> {
  try {
    const payload = await requireAuth(request, env);
    if (payload.role !== 'admin') return error('Admin only', 403, env);

    const body = await request.json() as any;
    const items: any[] = Array.isArray(body) ? body : body.businesses;
    if (!items?.length) return error('No businesses provided', 400, env);

    const now = Date.now();
    const stmts = items.map(b =>
      env.DB.prepare(`
        INSERT OR IGNORE INTO businesses (id, name, name_ar, name_ku, category, governorate, city, neighborhood, address,
          phone, phone_1, phone_2, website, image_url, social_links, description, description_ar,
          is_featured, is_verified, is_active, status, rating, review_count, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'approved', ?, ?, ?, ?)
      `).bind(
        b.id || generateId(), b.name || '', b.name_ar || null, b.name_ku || null,
        b.category || null, b.governorate || null, b.city || null, b.neighborhood || null, b.address || null,
        b.phone || null, b.phone_1 || null, b.phone_2 || null, b.website || null, b.image_url || null,
        JSON.stringify(b.social_links || {}), b.description || null, b.description_ar || null,
        b.is_featured ? 1 : 0, b.is_verified ? 1 : 0,
        b.rating || 0, b.review_count || 0, b.created_at || now, b.updated_at || now
      )
    );

    await env.DB.batch(stmts);
    return json({ inserted: items.length }, 201, env);
  } catch (err) {
    return handleError(err, env);
  }
}
