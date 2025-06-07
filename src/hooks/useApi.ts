
import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3001/api';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

class ApiClient {
  private token: string | null = null;
  
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }
  
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }
  
  removeToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }
  
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error de conexión' }));
      throw new Error(errorData.error || `Error ${response.status}`);
    }
    
    return response.json();
  }
  
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();

export function useApi<T>(endpoint: string, dependencies: any[] = []) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  
  useEffect(() => {
    if (!endpoint) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    apiClient.get<T>(endpoint)
      .then(data => setState({ data, loading: false, error: null }))
      .catch(error => setState({ data: null, loading: false, error: error.message }));
  }, [endpoint, ...dependencies]);
  
  return state;
}

export function useApiMutation<T, U = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  
  const mutate = async (endpoint: string, data?: U, method: 'POST' | 'PUT' | 'DELETE' = 'POST') => {
    setState({ data: null, loading: true, error: null });
    
    try {
      let result: T;
      switch (method) {
        case 'POST':
          result = await apiClient.post<T>(endpoint, data);
          break;
        case 'PUT':
          result = await apiClient.put<T>(endpoint, data);
          break;
        case 'DELETE':
          result = await apiClient.delete<T>(endpoint);
          break;
      }
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error: any) {
      setState({ data: null, loading: false, error: error.message });
      throw error;
    }
  };
  
  return { ...state, mutate };
}
