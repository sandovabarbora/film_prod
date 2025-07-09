// src/services/apiClient.ts - Enhanced API client with auth
class ApiClient {
  private baseURL: string;
  private authURL: string;

  constructor() {
    // Vite uses import.meta.env instead of process.env
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'\;
    this.authURL = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000/api/v1/auth'\;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        await this.refreshToken();
        throw new Error('Authentication required');
      }
      
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return {} as T;
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.logout();
      return;
    }

    try {
      const response = await fetch(`${this.authURL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        if (data.refresh) {
          localStorage.setItem('refresh_token', data.refresh);
        }
      } else {
        this.logout();
      }
    } catch {
      this.logout();
    }
  }

  private logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  // Auth specific methods
  async login(username: string, password: string): Promise<any> {
    const response = await fetch(`${this.authURL}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      throw new Error('Invalid credentials');
    }
    
    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    
    // Get user info
    const userResponse = await fetch(`${this.authURL}/me/`, {
      headers: { Authorization: `Bearer ${data.access}` },
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    return data;
  }

  async register(userData: any): Promise<any> {
    const response = await fetch(`${this.authURL}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async getCurrentUser(): Promise<any> {
    return this.get('/auth/me/');
  }
}

export const apiClient = new ApiClient();
