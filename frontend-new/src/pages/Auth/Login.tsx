import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import authService from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

// Tvoje existující styled komponenty
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.gray[900]};
`;

const LoginForm = styled.form`
  background: ${({ theme }) => theme.colors.gray[800]};
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.gray[300]};
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.gray[600]};
  border-radius: 4px;
  font-size: 1rem;
  background: ${({ theme }) => theme.colors.gray[700]};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.gray[600]};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background-color: rgba(231, 76, 60, 0.1);
  color: ${({ theme }) => theme.colors.danger};
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  border: 1px solid rgba(231, 76, 60, 0.3);
`;

const LinkContainer = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: ${({ theme }) => theme.colors.gray[400]};
  
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth(); // použití AuthContext pokud ho máš
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', formData.username);
      
      // Přihlášení přes authService
      const response = await authService.login(formData);
      
      // Pokud používáš AuthContext, aktualizuj ho
      if (contextLogin) {
        contextLogin(response.user, response.access);
      }
      
      // Úspěšné přihlášení - přesměrování
      navigate('/');
      
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.response?.status === 401) {
        setError('Nesprávné uživatelské jméno nebo heslo');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Nastala chyba při přihlašování. Zkuste to prosím znovu.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginForm onSubmit={handleSubmit}>
        <Title>FilmFlow</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <FormGroup>
          <Label htmlFor="username">Uživatelské jméno</Label>
          <Input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            autoComplete="username"
            placeholder="demo"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="password">Heslo</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            placeholder="••••••"
          />
        </FormGroup>
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Přihlašování...' : 'Přihlásit se'}
        </Button>
        
        <LinkContainer>
          Nemáte účet? <Link to="/join">Připojit se k produkci</Link>
        </LinkContainer>
      </LoginForm>
    </LoginContainer>
  );
};

export default Login;