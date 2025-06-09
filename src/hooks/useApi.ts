import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:3001/api';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface ApiMutationState<T> {
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
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

export function useApi<T>(endpoint: string, dependencies: any[] = []): ApiState<T> {
  const [state, setState] = useState<Omit<ApiState<T>, 'refetch'>>({
    data: null,
    loading: true,
    error: null,
  });
  
  const fetchData = useCallback(async () => {
    if (!endpoint) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiClient.get<T>(endpoint);
      setState({ data, loading: false, error: null });
    } catch (error: any) {
      setState({ data: null, loading: false, error: error.message });
    }
  }, [endpoint]);
  
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);
  
  return { ...state, refetch };
}

export function useApiMutation<T, U = any>() {
  const [state, setState] = useState<ApiMutationState<T>>({
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
