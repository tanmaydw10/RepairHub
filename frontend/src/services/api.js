// Use environment variable for backend API URL in production, or fallback to relative '/api' for Vite dev proxy
const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();

let normalizedBase = '';
if (rawApiUrl) {
  normalizedBase = rawApiUrl.replace(/\/+$/, '');
  if (normalizedBase.endsWith('/api')) {
    normalizedBase = normalizedBase.slice(0, -4);
  }
}

const API_BASE = normalizedBase ? `${normalizedBase}/api` : '/api';

export function getMediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${normalizedBase}${path.startsWith('/') ? '' : '/'}${path}`;
}


function getAuthHeaders(isFormData = false) {
  const token = localStorage.getItem('repairhub_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...getAuthHeaders(isFormData),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  auth: {
    login: (credentials) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),
    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      }),
    me: () => request('/auth/me')
  },

  requests: {
    create: (formDataOrJson) => {
      const isFormData = formDataOrJson instanceof FormData;
      return request('/requests', {
        method: 'POST',
        body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson)
      });
    },
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/requests${query ? '?' + query : ''}`);
    },
    getById: (id) => request(`/requests/${id}`),
    track: (id) => request(`/requests/track/${id}`),
    update: (id, updates) =>
      request(`/requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      }),
    updateStatus: (id, status, note) =>
      request(`/requests/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note })
      }),
    assign: (id, repairerData) =>
      request(`/requests/${id}/assign`, {
        method: 'POST',
        body: JSON.stringify(repairerData)
      })
  },

  reviews: {
    list: () => request('/reviews'),
    create: (reviewData) =>
      request('/reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData)
      })
  },

  ai: {
    diagnose: (problem, category = '') =>
      request('/ai/diagnose', {
        method: 'POST',
        body: JSON.stringify({ problem, category })
      })
  },

  repairer: {
    getStats: () => request('/repairer/dashboard/stats'),
    getProfile: (userId) => request(`/repairer/profile${userId ? '/' + userId : ''}`),
    updateProfile: (profileData) =>
      request('/repairer/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      })
  }
};

export default api;
