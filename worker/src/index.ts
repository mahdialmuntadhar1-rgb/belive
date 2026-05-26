import { Env, preflight, error, corsHeaders } from './utils';
import { signup, login, me, resetPasswordRequest, resetPasswordConfirm } from './handlers/auth';
import {
  listBusinesses, getBusiness, createBusiness, updateBusiness, deleteBusiness,
  getOwnedBusinesses, claimBusiness, searchBusinessesByPhone, bulkInsertBusinesses
} from './handlers/businesses';
import { listPosts, createPost, updatePost, deletePost, likePost, addComment } from './handlers/posts';
import { listReviews, addReview } from './handlers/reviews';
import { getCategories, getGovernorates, getCities, getBusinessGovernorates } from './handlers/metadata';
import {
  listHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide,
  listFeatures, createFeature, updateFeature, deleteFeature,
  createCategory, updateCategory, deleteCategory,
  genericContentUpdate, genericContentCreate, genericContentDelete,
} from './handlers/content';
import { getSummary, searchBusinesses, listClaimRequests, handleClaim } from './handlers/admin';
import { uploadImage, serveFile } from './handlers/upload';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    if (request.method === 'OPTIONS') return preflight(env, origin);

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';
    const method = request.method;

    try {
      // ── Auth ──────────────────────────────────────────────────────────────
      if (path === '/auth/signup' && method === 'POST') return signup(request, env);
      if (path === '/auth/login' && method === 'POST') return login(request, env);
      if (path === '/auth/me' && method === 'GET') return me(request, env);
      if (path === '/auth/reset-password' && method === 'POST') return resetPasswordRequest(request, env);
      if (path === '/auth/reset-password/confirm' && method === 'POST') return resetPasswordConfirm(request, env);

      // ── Businesses ────────────────────────────────────────────────────────
      if (path === '/businesses' && method === 'GET') return listBusinesses(request, env);
      if (path === '/businesses' && method === 'POST') return createBusiness(request, env);
      if (path === '/businesses/owned' && method === 'GET') return getOwnedBusinesses(request, env);
      if (path === '/businesses/search' && method === 'GET') return searchBusinessesByPhone(request, env);
      if (path === '/businesses/bulk' && method === 'POST') return bulkInsertBusinesses(request, env);
      if (path === '/businesses/governorates' && method === 'GET') return getBusinessGovernorates(request, env);

      const bizMatch = path.match(/^\/businesses\/([^/]+)$/);
      if (bizMatch) {
        const id = bizMatch[1];
        if (method === 'GET') return getBusiness(request, env, id);
        if (method === 'PUT' || method === 'PATCH') return updateBusiness(request, env, id);
        if (method === 'DELETE') return deleteBusiness(request, env, id);
      }
      const claimMatch = path.match(/^\/businesses\/([^/]+)\/claim$/);
      if (claimMatch && method === 'POST') return claimBusiness(request, env, claimMatch[1]);

      // ── Posts ─────────────────────────────────────────────────────────────
      if (path === '/posts' && method === 'GET') return listPosts(request, env);
      if (path === '/posts' && method === 'POST') return createPost(request, env);

      const postMatch = path.match(/^\/posts\/([^/]+)$/);
      if (postMatch) {
        const id = postMatch[1];
        if (method === 'PUT' || method === 'PATCH') return updatePost(request, env, id);
        if (method === 'DELETE') return deletePost(request, env, id);
      }
      const likeMatch = path.match(/^\/posts\/([^/]+)\/like$/);
      if (likeMatch && method === 'POST') return likePost(request, env, likeMatch[1]);
      const commentMatch = path.match(/^\/posts\/([^/]+)\/comments$/);
      if (commentMatch && method === 'POST') return addComment(request, env, commentMatch[1]);

      // ── Reviews ───────────────────────────────────────────────────────────
      if (path === '/reviews' && method === 'GET') return listReviews(request, env);
      if (path === '/reviews' && method === 'POST') return addReview(request, env);

      // ── Metadata ──────────────────────────────────────────────────────────
      if (path === '/categories' && method === 'GET') return getCategories(request, env);
      if (path === '/categories' && method === 'POST') return createCategory(request, env);
      if (path === '/governorates' && method === 'GET') return getGovernorates(request, env);
      if (path === '/cities' && method === 'GET') return getCities(request, env);

      const catMatch = path.match(/^\/categories\/([^/]+)$/);
      if (catMatch) {
        const id = catMatch[1];
        if (method === 'PUT' || method === 'PATCH') return updateCategory(request, env, id);
        if (method === 'DELETE') return deleteCategory(request, env, id);
      }

      // ── Hero Slides ───────────────────────────────────────────────────────
      if (path === '/hero-slides' && method === 'GET') return listHeroSlides(request, env);
      if (path === '/hero-slides' && method === 'POST') return createHeroSlide(request, env);

      const heroMatch = path.match(/^\/hero-slides\/([^/]+)$/);
      if (heroMatch) {
        const id = heroMatch[1];
        if (method === 'PUT' || method === 'PATCH') return updateHeroSlide(request, env, id);
        if (method === 'DELETE') return deleteHeroSlide(request, env, id);
      }

      // ── Features ──────────────────────────────────────────────────────────
      if (path === '/features' && method === 'GET') return listFeatures(request, env);
      if (path === '/features' && method === 'POST') return createFeature(request, env);

      const featMatch = path.match(/^\/features\/([^/]+)$/);
      if (featMatch) {
        const id = featMatch[1];
        if (method === 'PUT' || method === 'PATCH') return updateFeature(request, env, id);
        if (method === 'DELETE') return deleteFeature(request, env, id);
      }

      // ── Generic content (useAdminDB) ─────────────────────────────────────
      const contentMatch = path.match(/^\/content\/([^/]+)\/([^/]+)$/);
      if (contentMatch) {
        const [, table, id] = contentMatch;
        if (method === 'PUT' || method === 'PATCH') return genericContentUpdate(request, env, table, id);
        if (method === 'DELETE') return genericContentDelete(request, env, table, id);
      }
      const contentCreateMatch = path.match(/^\/content\/([^/]+)$/);
      if (contentCreateMatch && method === 'POST') return genericContentCreate(request, env, contentCreateMatch[1]);

      // ── Admin ─────────────────────────────────────────────────────────────
      if (path === '/admin/summary' && method === 'GET') return getSummary(request, env);
      if (path === '/admin/businesses' && method === 'GET') return searchBusinesses(request, env);
      if (path === '/admin/claim-requests' && method === 'GET') return listClaimRequests(request, env);

      const claimActionMatch = path.match(/^\/admin\/claim-requests\/([^/]+)$/);
      if (claimActionMatch && (method === 'PUT' || method === 'PATCH')) return handleClaim(request, env, claimActionMatch[1]);

      // ── Upload ────────────────────────────────────────────────────────────
      if (path === '/upload' && method === 'POST') return uploadImage(request, env);

      // ── File Serving ───────────────────────────────────────────────────────
      const fileMatch = path.match(/^\/files\/(.+)$/);
      if (fileMatch && method === 'GET') return serveFile(request, env, fileMatch[1]);

      // ── Health ────────────────────────────────────────────────────────────
      if (path === '/health') {
        return new Response(JSON.stringify({ status: 'ok' }), { status: 200, headers: corsHeaders(env) });
      }

      return error('Route not found', 404, env);
    } catch (err) {
      console.error('Unhandled error:', err);
      return error('Internal server error', 500, env);
    }
  }
} satisfies ExportedHandler<Env>;
