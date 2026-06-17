// src/services/api.ts

// Mengambil URL dasar dari file .env
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fungsi bantuan untuk mengambil token dari localStorage
const getToken = () => localStorage.getItem('token');

// Konfigurasi dasar untuk fungsi fetch()
const defaultConfig = () => ({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Otomatis pasang token jika ada
    ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {})
  }
});

// Fungsi bantuan untuk intercept response
const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    // Token expired atau invalid, paksa logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Terjadi kesalahan pada server');
  }

  return data;
};

// KUMPULAN FUNGSI API
export const api = {
  // 1. GET Request
  get: async (endpoint: string) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      ...defaultConfig(),
    });
    return handleResponse(response);
  },

  // 2. POST Request
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      ...defaultConfig(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // 3. PUT Request (Update)
  put: async (endpoint: string, data: any) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      ...defaultConfig(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // 4. DELETE Request
  delete: async (endpoint: string) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      ...defaultConfig(),
    });
    return handleResponse(response);
  },

  // 5. PATCH Request (Partial update)
  patch: async (endpoint: string, data?: any) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      ...defaultConfig(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse(response);
  }
};