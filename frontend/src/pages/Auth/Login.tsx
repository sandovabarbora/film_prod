import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.primary.dark};
  position: relative;
  overflow: hidden;
`;

const BackgroundVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.3;
  z-index: 0;
`;

const AuthCard = styled(motion.div)`
  background: rgba(33, 33, 33, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.colors.gray[800]};
  border-radius: 16px;
  padding: ${({ theme }) => theme.spacing.xxl};
  width: 100%;
  max-width: 480px;
  z-index: 1;
  position: relative;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  h1 {
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: ${({ theme }) => theme.sizes.h2};
    color: ${({ theme }) => theme.colors.accent.main};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }
  
  p {
    color: ${({ theme }) => theme.colors.gray[500]};
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.gray[900]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.primary.light};
  font-size: ${({ theme }) => theme.sizes.body};
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.main};
    background: ${({ theme }) => theme.colors.gray[850]};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[500]};
  }
`;

const Label = styled.label`
  position: absolute;
  top: -8px;
  left: 12px;
  background: ${({ theme }) => theme.colors.gray[900]};
  padding: 0 8px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.gray[400]};
`;

const Button = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.accent.main};
  color: ${({ theme }) => theme.colors.primary.light};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: ${({ theme }) => theme.sizes.body};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.accent.muted};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.lg} 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.gray[700]};
  }
  
  span {
    color: ${({ theme }) => theme.colors.gray[500]};
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

const SocialButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
`;

const SocialButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.primary.light};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.gray[700]};
  }
`;

const ToggleMode = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.gray[500]};
  font-size: ${({ theme }) => theme.sizes.small};
  
  a {
    color: ${({ theme }) => theme.colors.accent.main};
    cursor: pointer;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled(motion.div)`
  background: ${({ theme }) => theme.colors.status.error}20;
  border: 1px solid ${({ theme }) => theme.colors.status.error};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.status.error};
  font-size: ${({ theme }) => theme.sizes.small};
`;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: '',
    productionCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulace API call
      setTimeout(() => {
        localStorage.setItem('authToken', 'mock-token');
        navigate('/');
      }, 1500);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <AuthContainer>
      <BackgroundVideo autoPlay muted loop>
        <source src="/film-reel-bg.mp4" type="video/mp4" />
      </BackgroundVideo>

      <AuthCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Logo>
          <h1>FILMFLOW</h1>
          <p>Professional Production Management</p>
        </Logo>

        <Form onSubmit={handleSubmit}>
          {error && (
            <ErrorMessage
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </ErrorMessage>
          )}

          {!isLogin && (
            <InputGroup>
              <Label>Full Name</Label>
              <Input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
              />
            </InputGroup>
          )}

          <InputGroup>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              placeholder="john@productioncompany.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label>Password</Label>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </InputGroup>

          {!isLogin && (
            <>
              <InputGroup>
                <Label>Role</Label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required={!isLogin}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#212121',
                    border: '1px solid #616161',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select your role</option>
                  <option value="producer">Producer</option>
                  <option value="director">Director</option>
                  <option value="production_manager">Production Manager</option>
                  <option value="location_manager">Location Manager</option>
                  <option value="dop">Director of Photography</option>
                  <option value="sound">Sound Department</option>
                  <option value="art">Art Department</option>
                  <option value="crew">Crew Member</option>
                </select>
              </InputGroup>

              <InputGroup>
                <Label>Production Code (Optional)</Label>
                <Input
                  type="text"
                  name="productionCode"
                  placeholder="PROJ2024-001"
                  value={formData.productionCode}
                  onChange={handleChange}
                />
              </InputGroup>
            </>
          )}

          <Button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>
        </Form>

        <Divider>
          <span>or continue with</span>
        </Divider>

        <SocialButtons>
          <SocialButton type="button">
            <span>🔷</span> Guild Account
          </SocialButton>
          <SocialButton type="button">
            <span>🎬</span> Studio Login
          </SocialButton>
        </SocialButtons>

        <ToggleMode>
          {isLogin ? (
            <>
              New to FilmFlow? <a onClick={() => setIsLogin(false)}>Create account</a>
            </>
          ) : (
            <>
              Already have an account? <a onClick={() => setIsLogin(true)}>Sign in</a>
            </>
          )}
        </ToggleMode>
      </AuthCard>
    </AuthContainer>
  );
};
