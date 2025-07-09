import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// API base URL using Vite env variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
      } else if (token) {
        // Fetch user data if token exists but user data is missing
        const response = await fetch(`${API_BASE_URL}/auth/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.ok) {
          const currentUser = await response.json();
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/token/`, {
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
      const userResponse = await fetch(`${API_BASE_URL}/auth/me/`, {
        headers: { Authorization: `Bearer ${data.access}` },
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const register = async (userData: any): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
