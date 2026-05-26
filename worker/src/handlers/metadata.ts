import { Env, json, handleError } from '../utils';

export async function getCategories(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get('active') !== 'false';
    const where = activeOnly ? 'WHERE is_active = 1' : '';
    const rows = await env.DB.prepare(`SELECT * FROM categories ${where} ORDER BY display_order ASC, name_en ASC`).all();
    return json({ data: rows.results || [] }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function getGovernorates(request: Request, env: Env): Promise<Response> {
  try {
    const rows = await env.DB.prepare('SELECT * FROM governorates ORDER BY name_en ASC').all();
    if (rows.results && rows.results.length > 0) {
      return json({ data: rows.results }, 200, env);
    }
    const bizRows = await env.DB.prepare("SELECT DISTINCT governorate FROM businesses WHERE governorate IS NOT NULL AND governorate != '' ORDER BY governorate ASC").all();
    const govs = (bizRows.results || []).map((r: any) => ({ id: r.governorate, name_en: r.governorate, name_ar: r.governorate, name_ku: r.governorate }));
    return json({ data: govs }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function getCities(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const govId = url.searchParams.get('governorateId');
    const rows = govId
      ? await env.DB.prepare('SELECT * FROM cities WHERE governorate_id = ? ORDER BY name_en ASC').bind(govId).all()
      : await env.DB.prepare('SELECT * FROM cities ORDER BY name_en ASC').all();
    return json({ data: rows.results || [] }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function getBusinessGovernorates(_request: Request, env: Env): Promise<Response> {
  try {
    const rows = await env.DB.prepare("SELECT DISTINCT governorate FROM businesses WHERE governorate IS NOT NULL AND governorate != '' ORDER BY governorate ASC").all();
    const unique = (rows.results || []).map((r: any) => r.governorate as string);
    return json({ data: unique }, 200, env);
  } catch (err) {
    return handleError(err, env);
  }
}
