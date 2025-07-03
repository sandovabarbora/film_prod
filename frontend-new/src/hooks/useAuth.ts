import { useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AuthContext } from '../contexts/AuthContext';
import authService from '../services/authService';
import api from '../services/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Logout s navigací
  const handleLogout = useCallback(() => {
    context.logout();
    navigate('/login');
  }, [context, navigate]);
  
  // Mutation pro update profilu
  const updateProfile = useMutation({
    mutationFn: async (data: { first_name?: string; last_name?: string; email?: string }) => {
      const response = await api.patch('/auth/profile/', data);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      // Aktualizuj user data v localStorage a context
      const currentUser = authService.getCurrentUser();
      const newUser = { ...currentUser, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUser));
      context.login(newUser, localStorage.getItem('access_token') || '');
    },
  });
  
  return {
    ...context,
    logout: handleLogout,
    updateProfile: updateProfile.mutate,
    isUpdatingProfile: updateProfile.isPending,
  };
};