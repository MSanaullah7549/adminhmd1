class ApiClient {
  constructor(baseURL = '/api', token = null) {
    this.baseURL = baseURL;
    this.token = token || localStorage.getItem('authToken');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(data.message || 'API request failed', response.status, data);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || 'Network error', 0, error);
    }
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Auth endpoints
  auth = {
    register: (data) =>
      this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) =>
      this.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => {
      this.setToken(null);
      return Promise.resolve();
    },
  };

  // User endpoints
  users = {
    getAll: (limit = 10, offset = 0) =>
      this.request(`/users?limit=${limit}&offset=${offset}`),
    getById: (id) => this.request(`/users/${id}`),
    create: (data) =>
      this.request('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) =>
      this.request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) =>
      this.request(`/users/${id}`, { method: 'DELETE' }),
  };

  // Health endpoint
  health = {
    check: () => this.request('/health'),
  };
}

class ApiError extends Error {
  constructor(message, statusCode, data) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.name = 'ApiError';
  }
}

// Export for use in HTML pages
if (typeof window !== 'undefined') {
  window.ApiClient = ApiClient;
  window.apiClient = new ApiClient();
}

export { ApiClient, ApiError };
