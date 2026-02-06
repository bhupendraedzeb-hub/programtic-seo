import { getSession } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
}

async function makeRequest(endpoint: string, options: ApiOptions = {}) {
  const session = await getSession();
  const token = session?.access_token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (process.env.NODE_ENV !== 'production') {
    // Helpful local debug visibility for request payloads.
    const debugHeaders = { ...headers };
    if (debugHeaders.Authorization) {
      debugHeaders.Authorization = 'Bearer [redacted]';
    }
    console.debug('[api] request', {
      url: `${API_URL}${endpoint}`,
      method: options.method || 'GET',
      headers: debugHeaders,
      body: options.body ?? null,
    });
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (process.env.NODE_ENV !== 'production') {
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    console.debug('[api] response', {
      url: `${API_URL}${endpoint}`,
      status: response.status,
      ok: response.ok,
      headers: responseHeaders,
    });
  }

  if (!response.ok) {
    let detail = 'API request failed';
    try {
      const errorJson = await response.json();
      if (typeof errorJson?.detail === 'string') {
        detail = errorJson.detail;
      } else if (Array.isArray(errorJson?.detail)) {
        detail = errorJson.detail.join('; ');
      }
    } catch {
      try {
        const text = await response.text();
        if (text) {
          detail = text;
        } else if (response.statusText) {
          detail = response.statusText;
        }
      } catch {
        if (response.statusText) {
          detail = response.statusText;
        }
      }
    }
    throw new Error(`${detail} (HTTP ${response.status})`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  getCurrentUser: () => makeRequest('/api/auth/me'),
};

// Templates API
export const templatesApi = {
  create: (name: string, htmlContent: string, seoChecks?: any) =>
    makeRequest('/api/templates/', {
      method: 'POST',
      body: { name, html_content: htmlContent, seo_checks: seoChecks },
    }),

  list: () => makeRequest('/api/templates/', { method: 'GET' }),

  get: (templateId: string) =>
    makeRequest(`/api/templates/${templateId}`, { method: 'GET' }),

  update: (templateId: string, data: any) =>
    makeRequest(`/api/templates/${templateId}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (templateId: string) =>
    makeRequest(`/api/templates/${templateId}`, { method: 'DELETE' }),

  validate: (templateId: string) =>
    makeRequest(`/api/templates/${templateId}/validate`, { method: 'POST' }),

  extractVariables: (htmlContent: string) =>
    makeRequest('/api/templates/validate', {
      method: 'POST',
      body: { html_content: htmlContent },
    }),

  validateContent: (htmlContent: string) =>
    makeRequest('/api/templates/validate', {
      method: 'POST',
      body: { html_content: htmlContent },
    }),
};

// Pages API
export const pagesApi = {
  create: (templateId: string, variables: Record<string, string>) =>
    makeRequest('/api/pages/', {
      method: 'POST',
      body: { template_id: templateId, variables },
    }),

  list: () => makeRequest('/api/pages/', { method: 'GET' }),

  get: (pageId: string) =>
    makeRequest(`/api/pages/${pageId}`),

  getBySlug: (slug: string) =>
    makeRequest(`/api/pages/slug/${slug}`),

  update: (pageId: string, data: any) =>
    makeRequest(`/api/pages/${pageId}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (pageId: string) =>
    makeRequest(`/api/pages/${pageId}`, { method: 'DELETE' }),

  search: (query: string, skip?: number, limit?: number) =>
    makeRequest(
      `/api/pages/search/${query}?skip=${skip || 0}&limit=${limit || 50}`
    ),

  getSeoReport: (pageId: string) =>
    makeRequest(`/api/pages/${pageId}`, { method: 'GET' }),
};

// Bulk Jobs API
export const bulkApi = {
  create: async (templateId: string, file: File) => {
    const session = await getSession();
    const token = session?.access_token;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${API_URL}/api/bulk/?template_id=${templateId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create bulk job');
    }

    return response.json();
  },

  list: () => makeRequest('/api/bulk/', { method: 'GET' }),

  get: (jobId: string) =>
    makeRequest(`/api/bulk/${jobId}`),

  getStatus: (jobId: string) =>
    makeRequest(`/api/bulk/${jobId}`),

  delete: (jobId: string) =>
    makeRequest(`/api/bulk/${jobId}`, { method: 'DELETE' }),
};

// Jobs API
export const jobsApi = {
  getStats: () => makeRequest('/api/jobs/stats'),

  getRecent: (limit?: number) =>
    makeRequest(`/api/jobs/recent?limit=${limit || 10}`),
};

export default {
  authApi,
  templatesApi,
  pagesApi,
  bulkApi,
  jobsApi,
};
