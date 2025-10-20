// shared/api/apiClient.js
const getApiBaseUrl = () => {
  // In production, use the same domain with php/api path
  if (import.meta.env.PROD) {
    return '/php/api';
  }
  
  // In development, use your local PHP app
  return import.meta.env.VITE_API_URL + '/api' || 'http://my-php-app.local/php/api';
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

// Example service classes for your SolPulsen CRM
export class LeadsService {
  static async getLeads() {
    return apiClient.get('/leads.php');
  }

  static async getLeadById(id) {
    return apiClient.get(`/leads.php?id=${id}`);
  }

  static async createLead(leadData) {
    return apiClient.post('/leads.php', leadData);
  }

  static async updateLead(id, leadData) {
    return apiClient.put(`/leads.php?id=${id}`, leadData);
  }

  static async deleteLead(id) {
    return apiClient.delete(`/leads.php?id=${id}`);
  }
}

export class CustomersService {
  static async getCustomers() {
    return apiClient.get('/customers.php');
  }

  static async getCustomerById(id) {
    return apiClient.get(`/customers.php?id=${id}`);
  }

  static async createCustomer(customerData) {
    return apiClient.post('/customers.php', customerData);
  }

  static async updateCustomer(id, customerData) {
    return apiClient.put(`/customers.php?id=${id}`, customerData);
  }
}

export class ActivitiesService {
  static async getActivities() {
    return apiClient.get('/activities.php');
  }

  static async createActivity(activityData) {
    return apiClient.post('/activities.php', activityData);
  }

  static async updateActivity(id, activityData) {
    return apiClient.put(`/activities.php?id=${id}`, activityData);
  }

  static async deleteActivity(id) {
    return apiClient.delete(`/activities.php?id=${id}`);
  }
}

export class SellerService {
  static async submitSellerForm(formData) {
    return apiClient.post('/seller-form.php', formData);
  }
}

// Add the new StromService
export class StromService {
  static async submitStromForm(formData) {
    return apiClient.post('/incoming/submit-strom-form.php', formData);
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