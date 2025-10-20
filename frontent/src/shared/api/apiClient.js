// shared/api/apiClient.js
const getApiBaseUrl = () => {
  // In production, use the same domain with php/api path
  if (import.meta.env.PROD) {
    return '/php/api';
  }
  
  // In development, use your local PHP app
  
  return process.env.NODE_ENV === 'production' ? 'https://crm.solpulsen.se/php' : import.meta.env.VITE_API_URL;
};

class ApiClient {
  constructor() {
    this.baseURL = getApiBaseUrl();
    this.timeout = 10000;
  }

  // Method to get Authorization header if token exists
  getAuthHeaders() {
    const token = localStorage.getItem('jwt');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(), // Automatically include auth headers
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();


export class EgenkontrollService {
  static async submitForm(formData) {
    return apiClient.post('/api/egenskontroll.php', formData)
  }

  static async getForms() {
    return apiClient.get('/api/egenskontroll.php')
  }

  static async getFormById(id) {
    return apiClient.get(`/api/egenskontroll.php?id=${id}`)
  }

  static async getPhoto(photoId) {
    const response = await fetch(`${apiClient.baseURL}/api/egenskontroll.php?photoId=${photoId}`, {
      headers: apiClient.getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.blob()
  }

  static async updateForm(id, formData) {
    return apiClient.put(`/api/egenskontroll.php?id=${id}`, formData)
  }

  static async deleteForm(id) {
    return apiClient.delete(`/api/egenskontroll.php?id=${id}`)
  }
}



export class InstallationService {
  static async submitForm(formData) {
    return apiClient.post('/api/installation.php', formData)
  }

  static async getForms() {
    return apiClient.get('/api/installation.php')
  }

  static async getFormById(id) {
    return apiClient.get(`/api/installation.php?id=${id}`)
  }

  static async getPhoto(photoId) {
    const response = await fetch(`${apiClient.baseURL}/api/installation.php?photoId=${photoId}`, {
      headers: apiClient.getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.blob()
  }

  static async updateForm(id, formData) {
    return apiClient.put(`/api/installation.php?id=${id}`, formData)
  }

  static async deleteForm(id) {
    return apiClient.delete(`/api/installation.php?id=${id}`)
  }
}



export class AuthService {
  static async login(credentials) {
    return apiClient.post('/auth/login.php', credentials);
  }

  static async logout() {
    return apiClient.post('/auth/logout.php');
  }

  static async refreshToken() {
    return apiClient.post('/auth/refresh.php');
  }
}