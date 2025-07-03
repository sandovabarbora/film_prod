import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Eye, EyeOff, Film, Clapperboard, Camera, Mic, Palette, Edit3, Users, Lock } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.primary.dark};
  position: relative;
  overflow: hidden;
`;

const VideoBackground = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 1;
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const LoginBox = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
  margin: 0 ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.gray[900]};
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.gray[800]};
  padding: ${({ theme }) => theme.spacing.xxl};
  animation: ${fadeIn} 0.6s ease-out;
  box-shadow: ${({ theme }) => theme.shadows.xl};
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const LogoCircle = styled.div`
  width: 64px;
  height: 64px;
  background: ${({ theme }) => theme.colors.accent.main};
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => theme.sizes.h2};
  color: ${({ theme }) => theme.colors.primary.light};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  letter-spacing: 2px;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.gray[400]};
  font-size: ${({ theme }) => theme.sizes.body};
`;

const TabContainer = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.gray[850]};
  border-radius: 8px;
  padding: 4px;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: 6px;
  background: ${({ active, theme }) => active ? theme.colors.accent.main : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.primary.light : theme.colors.gray[400]};
  font-weight: 500;
  transition: all ${({ theme }) => theme.transitions.fast};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.primary.light};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[300]};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Input = styled.input`
  background: ${({ theme }) => theme.colors.gray[850]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary.light};
  font-size: ${({ theme }) => theme.sizes.body};
  transition: all ${({ theme }) => theme.transitions.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[500]};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent.main}33;
  }
`;

const PasswordWrapper = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: ${({ theme }) => theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.gray[500]};
  cursor: pointer;
  padding: 4px;

  &:hover {
    color: ${({ theme }) => theme.colors.primary.light};
  }
`;

const RoleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};
`;

const RoleButton = styled.button<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: 8px;
  border: 1px solid ${({ selected, theme }) => 
    selected ? theme.colors.accent.main : theme.colors.gray[700]};
  background: ${({ selected, theme }) => 
    selected ? `${theme.colors.accent.main}20` : theme.colors.gray[850]};
  color: ${({ selected, theme }) => 
    selected ? theme.colors.accent.main : theme.colors.gray[400]};
  font-size: ${({ theme }) => theme.sizes.small};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.main};
    color: ${({ theme }) => theme.colors.primary.light};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SubmitButton = styled.button`
  background: ${({ theme }) => theme.colors.accent.main};
  color: ${({ theme }) => theme.colors.primary.light};
  padding: ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: ${({ theme }) => theme.sizes.body};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.accent.muted};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
`;

const SecondaryButton = styled(SubmitButton)`
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};

  &:hover {
    background: ${({ theme }) => theme.colors.gray[700]};
  }
`;

const Divider = styled.div`
  position: relative;
  text-align: center;
  margin: ${({ theme }) => theme.spacing.xl} 0;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: ${({ theme }) => theme.colors.gray[700]};
  }

  span {
    position: relative;
    background: ${({ theme }) => theme.colors.gray[900]};
    padding: 0 ${({ theme }) => theme.spacing.md};
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
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.primary.light};
  font-size: ${({ theme }) => theme.sizes.small};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.gray[700]};
  }
`;

const Footer = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const FooterText = styled.p`
  color: ${({ theme }) => theme.colors.gray[500]};
  font-size: ${({ theme }) => theme.sizes.small};

  button {
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.accent.main};
    cursor: pointer;
    transition: color ${({ theme }) => theme.transitions.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.accent.muted};
    }
  }
`;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: '',
    productionCode: ''
  });

  const roles = [
    { id: 'producer', name: 'Producer', icon: Film },
    { id: 'director', name: 'Director', icon: Clapperboard },
    { id: 'dop', name: 'Director of Photography', icon: Camera },
    { id: 'sound', name: 'Sound Department', icon: Mic },
    { id: 'art', name: 'Art Department', icon: Palette },
    { id: 'post', name: 'Post Production', icon: Edit3 },
    { id: 'production', name: 'Production', icon: Users },
    { id: 'other', name: 'Other', icon: Lock }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Attempting login with:', { email: formData.email });
    
    try {
      const response = await api.post('/auth/token/', {
        username: formData.email,  // Django očekává username, ne email!
        password: formData.password
      });
      
      console.log('Login response:', response.data);
      
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user || {}));
      
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleJoinProduction = () => {
    navigate('/join');
  };

  return (
    <Container>
      <VideoBackground>
        <video autoPlay muted loop playsInline>
          <source src="https://cdn.coverr.co/videos/coverr%3Aprep-the-camera-on-a-film-set-with-a-scene-marker-clap-1091/1080p.mp4" type="video/mp4" />
        </video>
      </VideoBackground>

      <LoginBox>
        <LogoContainer>
          <LogoCircle>
            <Film size={32} color="white" />
          </LogoCircle>
          <Title>FilmFlow</Title>
          <Subtitle>
            {isLogin ? 'Welcome back to your production' : 'Start your next masterpiece'}
          </Subtitle>
        </LogoContainer>

        <TabContainer>
          <Tab active={isLogin} onClick={() => setIsLogin(true)}>
            Sign In
          </Tab>
          <Tab active={!isLogin} onClick={() => setIsLogin(false)}>
            Sign Up
          </Tab>
        </TabContainer>

        <Form onSubmit={handleSubmit}>
          {!isLogin && (
            <FormGroup>
              <Label>Full Name</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Steven Spielberg"
              />
            </FormGroup>
          )}

          <FormGroup>
            <Label>Email Address</Label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
            />
          </FormGroup>

          <FormGroup>
            <Label>Password</Label>
            <PasswordWrapper>
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                style={{ paddingRight: '48px' }}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
            </PasswordWrapper>
          </FormGroup>

          {!isLogin && (
            <>
              <FormGroup>
                <Label>Your Role</Label>
                <RoleGrid>
                  {roles.map(role => {
                    const Icon = role.icon;
                    return (
                      <RoleButton
                        key={role.id}
                        type="button"
                        selected={formData.role === role.id}
                        onClick={() => setFormData({ ...formData, role: role.id })}
                      >
                        <Icon />
                        {role.name}
                      </RoleButton>
                    );
                  })}
                </RoleGrid>
              </FormGroup>

              <FormGroup>
                <Label>
                  Production Code <span style={{ color: '#6B7280' }}>(Optional)</span>
                </Label>
                <Input
                  type="text"
                  value={formData.productionCode}
                  onChange={(e) => setFormData({ ...formData, productionCode: e.target.value.toUpperCase() })}
                  placeholder="FILM2024"
                  maxLength={8}
                  style={{ fontFamily: 'monospace', letterSpacing: '2px' }}
                />
                <p style={{ marginTop: '4px', fontSize: '12px', color: '#6B7280' }}>
                  Have a code from your production manager? Enter it here.
                </p>
              </FormGroup>
            </>
          )}

          <SubmitButton type="submit">
            {isLogin ? 'Sign In' : 'Create Account'}
          </SubmitButton>

          {isLogin && (
            <SecondaryButton type="button" onClick={handleJoinProduction}>
              Join Existing Production
            </SecondaryButton>
          )}
        </Form>

        <Divider>
          <span>Or continue with</span>
        </Divider>

        <SocialButtons>
          <SocialButton>Guild Login</SocialButton>
          <SocialButton>Studio SSO</SocialButton>
        </SocialButtons>

        <Footer>
          <FooterText>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </FooterText>
          <FooterText style={{ marginTop: '16px' }}>
            By continuing, you agree to our{' '}
            <button>Terms</button>
            {' and '}
            <button>Privacy Policy</button>
          </FooterText>
        </Footer>
      </LoginBox>
    </Container>
  );
};

export default Login;
