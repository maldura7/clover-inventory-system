// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, name) => api.post('/auth/register', { email, password, name }),
};

export const productService = {
  getAll: (search, category, supplier, status) =>
    api.get('/products', { params: { search, category, supplier, status, limit: 1000 } }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/alerts/low-stock'),
};

export const inventoryService = {
  getAll: (locationId, lowStock) =>
    api.get('/inventory', { params: { locationId, lowStock } }),
  adjust: (data) => api.post('/inventory/adjust', data),
  getHistory: (productId, locationId) =>
    api.get(`/inventory/history/${productId}`, { params: { locationId } }),
};

export const locationService = {
  getAll: () => api.get('/locations'),
  create: (data) => api.post('/locations', data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.delete(`/locations/${id}`),
};

export const supplierService = {
  getAll: () => api.get('/suppliers'),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getTopProducts: () => api.get('/dashboard/top-products'),
};

export const reportService = {
  getInventoryReport: (format, locationId) =>
    api.get('/reports/inventory-report', { params: { format, locationId } }),
};

export const cloverService = {
  getSyncHistory: () => api.get('/clover/sync-history'),
  syncNow: () => api.post('/clover/sync'),
  authenticate: (code) => api.post('/clover/authenticate', { code }),
};

export const alertService = {
  getAll: () => api.get('/alerts'),
};

export default api;
