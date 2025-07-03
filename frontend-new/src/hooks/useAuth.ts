import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api, apiEndpoints } from '../services/api';

interface LoginData {
  email: string;
  password: string;
}

export const useLogin = () => {
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await api.post(apiEndpoints.auth.login, data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  
  return () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };
};
