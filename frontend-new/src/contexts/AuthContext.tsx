// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../services/apiClient';

// Inline typy - aby se vyhnuly import problémům
interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  avatar?: string;
  created_at: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  role?: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          const userData = await apiClient.auth.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.warn('Failed to get user data:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Call API login
      const tokens = await apiClient.auth.login(credentials);
      console.log('Login successful, tokens received:', { access: !!tokens.access, refresh: !!tokens.refresh });
      
      // Get user data
      const userData = await apiClient.auth.getCurrentUser();
      console.log('User data received:', userData);
      
      setUser(userData);
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Clear any stored tokens on login failure
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Re-throw for component to handle
      throw new Error(error.response?.data?.detail || 'Přihlášení se nezdařilo');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.auth.logout();
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const userData = await apiClient.auth.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      await logout();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
