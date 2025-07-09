import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${({ theme }) => theme?.borderRadius?.['2xl'] || '1rem'};
  box-shadow: ${({ theme }) => theme?.shadows?.xl || '0 25px 50px -12px rgba(0, 0, 0, 0.25)'};
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: ${({ theme }) => theme?.spacing?.['2xl'] || '3rem'};
  width: 100%;
  max-width: 400px;
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme?.spacing?.xl || '2rem'};
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme?.spacing?.md || '1rem'};
  margin-bottom: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
`;

const Logo = styled.div`
  font-size: 3rem;
`;

const AppName = styled.h1`
  font-size: ${({ theme }) => theme?.typography?.sizes?.['2xl'] || '1.5rem'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.bold || 700};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#1a202c'};
  margin: 0;
`;

const WelcomeText = styled.p`
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#718096'};
  font-size: ${({ theme }) => theme?.typography?.sizes?.lg || '1.125rem'};
  margin: 0;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme?.spacing?.md || '1rem'};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme?.typography?.sizes?.sm || '0.875rem'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.medium || 500};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#1a202c'};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme?.spacing?.md || '1rem'};
  border: 1px solid ${({ theme }) => theme?.colors?.border?.primary || '#e2e8f0'};
  border-radius: ${({ theme }) => theme?.borderRadius?.lg || '0.5rem'};
  background: rgba(255, 255, 255, 0.8);
  color: ${({ theme }) => theme?.colors?.text?.primary || '#1a202c'};
  font-size: ${({ theme }) => theme?.typography?.sizes?.base || '1rem'};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme?.colors?.accent?.primary || '#3182ce'};
    box-shadow: 0 0 0 3px ${({ theme }) => theme?.colors?.accent?.muted || 'rgba(49, 130, 206, 0.1)'};
    background: rgba(255, 255, 255, 1);
  }
`;

const LoginButton = styled.button`
  padding: ${({ theme }) => theme?.spacing?.md || '1rem'} ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme?.borderRadius?.lg || '0.5rem'};
  font-size: ${({ theme }) => theme?.typography?.sizes?.base || '1rem'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.semibold || 600};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: ${({ theme }) => theme?.spacing?.md || '1rem'};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme?.shadows?.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.1)'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid #e53e3e;
  color: #e53e3e;
  padding: ${({ theme }) => theme?.spacing?.md || '1rem'};
  border-radius: ${({ theme }) => theme?.borderRadius?.md || '0.375rem'};
  font-size: ${({ theme }) => theme?.typography?.sizes?.sm || '0.875rem'};
  margin-bottom: ${({ theme }) => theme?.spacing?.md || '1rem'};
`;

const DevCredentials = styled.div`
  background: rgba(0, 0, 255, 0.1);
  border: 1px solid #3182ce;
  color: #3182ce;
  padding: ${({ theme }) => theme?.spacing?.md || '1rem'};
  border-radius: ${({ theme }) => theme?.borderRadius?.md || '0.375rem'};
  font-size: ${({ theme }) => theme?.typography?.sizes?.sm || '0.875rem'};
  margin-bottom: ${({ theme }) => theme?.spacing?.md || '1rem'};
  text-align: center;
`;

interface LoginCredentials {
  username: string;
  password: string;
}

export default function Login() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Pre-fill with admin credentials for development
  const [credentials, setCredentials] = useState<LoginCredentials>({ 
    username: 'admin', 
    password: 'admin123' 
  });
  const [error, setError] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!credentials.username || !credentials.password) {
      setError('Prosím vyplňte všechna pole');
      return;
    }

    try {
      console.log('Attempting login with:', { username: credentials.username });
      await login(credentials.username, credentials.password);
      console.log('Login successful, should redirect to dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Přihlášení se nezdařilo');
    }
  };

  const handleInputChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LoginHeader>
          <LogoSection>
            <Logo>🎬</Logo>
            <AppName>FilmFlow</AppName>
          </LogoSection>
          <WelcomeText>Přihlášení do systému</WelcomeText>
        </LoginHeader>

        <LoginForm onSubmit={handleSubmit}>
          <DevCredentials>
            <strong>Development Login:</strong><br />
            Username: admin / Password: admin123
          </DevCredentials>

          {error && (
            <ErrorMessage>{error}</ErrorMessage>
          )}

          <FormGroup>
            <Label htmlFor="username">Uživatelské jméno</Label>
            <Input
              id="username"
              type="text"
              value={credentials.username}
              onChange={handleInputChange('username')}
              placeholder="admin"
              disabled={isLoading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Heslo</Label>
            <Input
              id="password"
              type="password"
              value={credentials.password}
              onChange={handleInputChange('password')}
              placeholder="admin123"
              disabled={isLoading}
            />
          </FormGroup>

          <LoginButton type="submit" disabled={isLoading}>
            {isLoading ? 'Přihlašuji...' : 'Přihlásit se'}
          </LoginButton>
        </LoginForm>
      </LoginCard>
    </LoginContainer>
  );
}
