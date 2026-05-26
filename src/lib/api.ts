const rawUrl = import.meta.env.VITE_API_URL;
if (!rawUrl) {
  throw new Error(
    'VITE_API_URL is not defined. ' +
    'Set it in your build environment (Cloudflare Pages → Settings → Environment Variables). ' +
    'Example: VITE_API_URL=https://belive-100back.mahdialmuntadhar1.workers.dev'
  );
}
const API_URL = rawUrl.replace(/\/$/, '');

// Deployed: 2026-05-26
const TOKEN_KEY = 'belive_token';
const USER_KEY = 'belive_user';

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  role: 'user' | 'business_owner' | 'admin';
  full_name?: string | null;
  avatar_url?: string | null;
}

export interface ApiError {
  error: string;
  status: number;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const body = await res.json() as any; msg = body.error || msg; } catch {}
    const err = new Error(msg) as any;
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  signup: (data: {
    email: string; password: string; full_name?: string;
    role?: string; business_name?: string;
  }) => apiFetch<{ token: string; user: AuthUser }>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }, false),

  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: AuthUser }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, false),

  me: () => apiFetch<{ user: AuthUser }>('/auth/me'),

  resetPasswordRequest: (email: string) =>
    apiFetch<{ message: string; debug_token?: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email }) }, false),

  resetPasswordConfirm: (token: string, password: string) =>
    apiFetch<{ message: string }>('/auth/reset-password/confirm', { method: 'POST', body: JSON.stringify({ token, password }) }, false),
};

// ─── Businesses ───────────────────────────────────────────────────────────────

export const businessesApi = {
  list: (params: { governorate?: string; city?: string; category?: string; search?: string; limit?: number; offset?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.governorate) qs.set('governorate', params.governorate);
    if (params.city) qs.set('city', params.city);
    if (params.category) qs.set('category', params.category);
    if (params.search) qs.set('search', params.search);
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.offset !== undefined) qs.set('offset', String(params.offset));
    return apiFetch<{ data: any[]; total: number; limit: number; offset: number; hasMore: boolean }>(`/businesses?${qs}`);
  },

  get: (id: string) => apiFetch<{ data: any }>(`/businesses/${id}`),

  create: (data: any) => apiFetch<{ data: any }>('/businesses', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: any) => apiFetch<{ data: any }>(`/businesses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch<{ message: string }>(`/businesses/${id}`, { method: 'DELETE' }),

  owned: () => apiFetch<{ data: any[] }>('/businesses/owned'),

  claim: (id: string, phone: string) =>
    apiFetch<{ message: string; id: string }>(`/businesses/${id}/claim`, { method: 'POST', body: JSON.stringify({ phone }) }),

  searchByPhone: (phone: string) =>
    apiFetch<{ data: any[] }>(`/businesses/search?phone=${encodeURIComponent(phone)}`),

  bulk: (businesses: any[]) =>
    apiFetch<{ inserted: number }>('/businesses/bulk', { method: 'POST', body: JSON.stringify(businesses) }),

  governorates: () => apiFetch<{ data: string[] }>('/businesses/governorates'),
};

// ─── Posts ────────────────────────────────────────────────────────────────────

export const postsApi = {
  list: (params: { businessId?: string; limit?: number; offset?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.businessId) qs.set('businessId', params.businessId);
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.offset !== undefined) qs.set('offset', String(params.offset));
    return apiFetch<{ data: any[] }>(`/posts?${qs}`);
  },

  create: (data: { business_id: string; caption?: string; content?: string; image_url?: string; title?: string }) =>
    apiFetch<{ data: any }>('/posts', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: any) => apiFetch<{ data: any }>(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch<{ message: string }>(`/posts/${id}`, { method: 'DELETE' }),

  like: (id: string) => apiFetch<{ message: string }>(`/posts/${id}/like`, { method: 'POST' }),

  addComment: (postId: string, author_name: string, comment_text: string) =>
    apiFetch<{ data: any }>(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ author_name, comment_text }) }),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const reviewsApi = {
  list: (businessId: string, params: { limit?: number; offset?: number } = {}) => {
    const qs = new URLSearchParams({ businessId });
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.offset !== undefined) qs.set('offset', String(params.offset));
    return apiFetch<{ data: any[]; total: number }>(`/reviews?${qs}`);
  },

  add: (business_id: string, rating: number, comment?: string) =>
    apiFetch<{ data: any }>('/reviews', { method: 'POST', body: JSON.stringify({ business_id, rating, comment }) }),
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadataApi = {
  categories: (active = true) => apiFetch<{ data: any[] }>(`/categories?active=${active}`),
  governorates: () => apiFetch<{ data: any[] }>('/governorates'),
  cities: (governorateId?: string) => {
    const qs = governorateId ? `?governorateId=${governorateId}` : '';
    return apiFetch<{ data: any[] }>(`/cities${qs}`);
  },
};

// ─── Hero Slides ──────────────────────────────────────────────────────────────

export const heroSlidesApi = {
  list: (active = true) => apiFetch<{ data: any[] }>(`/hero-slides?active=${active}`),
  create: (data: any) => apiFetch<{ data: any }>('/hero-slides', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch<{ data: any }>(`/hero-slides/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<{ message: string }>(`/hero-slides/${id}`, { method: 'DELETE' }),
};

// ─── Features ─────────────────────────────────────────────────────────────────

export const featuresApi = {
  list: (active = true) => apiFetch<{ data: any[] }>(`/features?active=${active}`),
  create: (data: any) => apiFetch<{ data: any }>('/features', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch<{ data: any }>(`/features/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<{ message: string }>(`/features/${id}`, { method: 'DELETE' }),
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminApi = {
  summary: () => apiFetch<any>('/admin/summary'),

  searchBusinesses: (params: { name?: string; phone?: string; category?: string; governorate?: string; limit?: number } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined) qs.set(k, String(v)); });
    return apiFetch<{ data: any[] }>(`/admin/businesses?${qs}`);
  },

  claimRequests: (status = 'pending') =>
    apiFetch<{ data: any[] }>(`/admin/claim-requests?status=${status}`),

  handleClaim: (id: string, action: 'approve' | 'reject', verify = false) =>
    apiFetch<{ message: string }>(`/admin/claim-requests/${id}`, { method: 'PUT', body: JSON.stringify({ action, verify }) }),
};

// ─── Generic content (useAdminDB) ─────────────────────────────────────────────

export const contentApi = {
  update: (table: string, id: string, data: any) =>
    apiFetch<{ data: any }>(`/content/${table}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  create: (table: string, data: any) =>
    apiFetch<{ data: any }>(`/content/${table}`, { method: 'POST', body: JSON.stringify(data) }),
  delete: (table: string, id: string) =>
    apiFetch<{ message: string }>(`/content/${table}/${id}`, { method: 'DELETE' }),
};

// ─── Upload ───────────────────────────────────────────────────────────────────

export const uploadApi = {
  image: async (file: File, folder: string = 'general'): Promise<string> => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/upload?folder=${folder}`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json() as any;
      throw new Error(body.error || 'Upload failed');
    }
    const data = await res.json() as { url: string };
    return data.url;
  },

  imageUrl: async (url: string): Promise<string> => {
    const res = await apiFetch<{ url: string }>('/upload?folder=general', { method: 'POST', body: JSON.stringify({ url }) });
    return res.url;
  },
};
