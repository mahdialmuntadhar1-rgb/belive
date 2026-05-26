import { Env, json, error, handleError, generateId, requireAuth, corsHeaders } from '../utils';

export async function uploadImage(request: Request, env: Env): Promise<Response> {
  try {
    await requireAuth(request, env);

    const url = new URL(request.url);
    const folder = url.searchParams.get('folder') || 'general';

    const contentType = request.headers.get('Content-Type') || '';

    if (contentType.includes('multipart/form-data')) {
      if (!env.R2_BUCKET) return error('R2 storage not configured', 503, env);
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) return error('No file in form data', 400, env);

      const ext = file.name.split('.').pop() || 'jpg';
      const key = `${folder}/${generateId()}.${ext}`;
      await env.R2_BUCKET.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });

      // Return URL pointing to Worker file serving endpoint
      const origin = url.origin;
      const publicUrl = `${origin}/files/${key}`;
      return json({ url: publicUrl, key }, 201, env);
    }

    const body = await request.json() as any;
    if (body.url) {
      return json({ url: body.url }, 200, env);
    }

    return error('Provide multipart/form-data with a file field, or JSON with a url field', 400, env);
  } catch (err) {
    return handleError(err, env);
  }
}

export async function serveFile(request: Request, env: Env, key: string): Promise<Response> {
  try {
    if (!env.R2_BUCKET) return error('R2 storage not configured', 503, env);

    const object = await env.R2_BUCKET.get(key);
    if (!object) return error('File not found', 404, env);

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Access-Control-Allow-Origin', env.CORS_ORIGIN?.split(',')[0] || '*');

    return new Response(object.body, { headers });
  } catch (err) {
    return handleError(err, env);
  }
}
