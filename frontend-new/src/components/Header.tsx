// src/components/Header.tsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Film, 
  Calendar, 
  Users, 
  Package, 
  MapPin, 
  DollarSign, 
  FileText, 
  MessageSquare, 
  Cloud,
  Settings,
  LogOut,
  Search,
  Bell,
  User
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const HeaderContainer = styled.header`
  background: ${({ theme }) => theme.colors.gray[800]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[700]};
  padding: 0 1rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NavItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.text.secondary};
  text-decoration: none;
  transition: all 0.2s;
  font-size: 0.875rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.gray[700]};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SearchBar = styled.div`
  position: relative;
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const SearchInput = styled.input`
  background: ${({ theme }) => theme.colors.gray[700]};
  border: 1px solid ${({ theme }) => theme.colors.gray[600]};
  border-radius: 8px;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  width: 300px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  
  &:hover {
    background: ${({ theme }) => theme.colors.gray[700]};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const NotificationDot = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: ${({ theme }) => theme.colors.danger};
  border-radius: 50%;
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.gray[700]};
  cursor: pointer;
`;

const UserInfo = styled.div`
  text-align: right;
`;

const UserName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const UserRole = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
`;

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const navItems = [
    { path: '/', icon: Film, label: 'Dashboard' },
    { path: '/schedule', icon: Calendar, label: 'Schedule' },
    { path: '/crew', icon: Users, label: 'Crew' },
    { path: '/equipment', icon: Package, label: 'Equipment' },
    { path: '/locations', icon: MapPin, label: 'Locations' },
    { path: '/budget', icon: DollarSign, label: 'Budget' },
    { path: '/documents', icon: FileText, label: 'Documents' },
    { path: '/communication', icon: MessageSquare, label: 'Communication' },
    { path: '/weather', icon: Cloud, label: 'Weather' },
  ];
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  return (
    <HeaderContainer>
      <LeftSection>
        <Logo to="/">
          <Film />
          FilmFlow
        </Logo>
        
        <Nav>
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavItem 
              key={path} 
              to={path}
              $active={location.pathname === path}
            >
              <Icon />
              {label}
            </NavItem>
          ))}
        </Nav>
      </LeftSection>
      
      <RightSection>
        <SearchBar>
          <Search />
          <SearchInput placeholder="Search..." />
        </SearchBar>
        
        <IconButton>
          <Bell />
          <NotificationDot />
        </IconButton>
        
        <IconButton>
          <Settings />
        </IconButton>
        
        <UserMenu>
          <UserInfo>
            <UserName>{user?.first_name || user?.username || 'User'}</UserName>
            <UserRole>Producer</UserRole>
          </UserInfo>
          <UserAvatar>{getUserInitials()}</UserAvatar>
        </UserMenu>
        
        <IconButton onClick={handleLogout} title="Logout">
          <LogOut />
        </IconButton>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;