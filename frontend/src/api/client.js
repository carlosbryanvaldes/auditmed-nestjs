/**
 * Axios API client — adjunta JWT automáticamente.
 * baseURL se toma de VITE_API_URL o cae a '' (usa proxy de Vite en dev).
 */
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: adjuntar token ───────────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: logout en 401 ───────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(err);
  },
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (username, password) =>
    apiClient.post('/api/auth/login', { username, password }),
  me: () => apiClient.get('/api/auth/me'),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  list:   ()        => apiClient.get('/api/users'),
  get:    (id)      => apiClient.get(`/api/users/${id}`),
  create: (d)       => apiClient.post('/api/users', d),
  update: (id, d)   => apiClient.put(`/api/users/${id}`, d),
  remove: (id)      => apiClient.delete(`/api/users/${id}`),
};

// ── Roles ─────────────────────────────────────────────────────────────────────
export const rolesAPI = {
  list:              ()         => apiClient.get('/api/roles'),
  get:               (id)       => apiClient.get(`/api/roles/${id}`),
  permissions:       ()         => apiClient.get('/api/roles/permissions'),
  updatePermissions: (id, pIds) => apiClient.put(`/api/roles/${id}/permissions`, { permissionIds: pIds }),
};

// ── Master ────────────────────────────────────────────────────────────────────
export const masterAPI = {
  listUnidades:   ()        => apiClient.get('/api/master/unidades-ejecutoras'),
  createUnidad:   (d)       => apiClient.post('/api/master/unidades-ejecutoras', d),
  updateUnidad:   (id, d)   => apiClient.put(`/api/master/unidades-ejecutoras/${id}`, d),
  deleteUnidad:   (id)      => apiClient.delete(`/api/master/unidades-ejecutoras/${id}`),
};

// ── Forms ─────────────────────────────────────────────────────────────────────
export const formsAPI = {
  list:    ()        => apiClient.get('/api/forms'),
  get:     (id)      => apiClient.get(`/api/forms/${id}`),
  create:  (d)       => apiClient.post('/api/forms', d),
  update:  (id, d)   => apiClient.put(`/api/forms/${id}`, d),
  publish: (id)      => apiClient.patch(`/api/forms/${id}/publish`),
  remove:  (id)      => apiClient.delete(`/api/forms/${id}`),
};

// ── Audits ────────────────────────────────────────────────────────────────────
export const auditsAPI = {
  stats:  ()             => apiClient.get('/api/audits/stats'),
  list:   (params)       => apiClient.get('/api/audits', { params }),
  get:    (id)           => apiClient.get(`/api/audits/${id}`),
  create: (d)            => apiClient.post('/api/audits', d),
  update: (id, d)        => apiClient.put(`/api/audits/${id}`, d),
  close:  (id, d)        => apiClient.patch(`/api/audits/${id}/close`, d),
  remove: (id)           => apiClient.delete(`/api/audits/${id}`),
};
