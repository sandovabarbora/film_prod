// src/components/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from './common/Notification';

export function Header(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const titles: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/films': 'Projekty',
      '/schedule': 'Harmonogram',
      '/crew': 'Štáb',
      '/communication': 'Komunikace',
      '/budget': 'Rozpočet',
      '/equipment': 'Technika',
      '/locations': 'Lokace',
      '/documents': 'Dokumenty',
      '/weather': 'Počasí',
    };
    
    return titles[path] || 'FilmFlow';
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        {/* Left section - Logo and breadcrumbs */}
        <LeftSection>
          <Logo onClick={() => navigate('/dashboard')}>
            <LogoIcon>🎬</LogoIcon>
            <LogoText>FilmFlow</LogoText>
          </Logo>
          
          <Breadcrumbs>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <PageTitle>{getPageTitle()}</PageTitle>
          </Breadcrumbs>
        </LeftSection>

        {/* Center section - Search (future) */}
        <CenterSection>
          <SearchContainer>
            <SearchInput 
              type="text" 
              placeholder="Hledat projekty, štáb, dokumenty..."
              disabled 
            />
            <SearchIcon>🔍</SearchIcon>
          </SearchContainer>
        </CenterSection>

        {/* Right section - Actions and user */}
        <RightSection>
          {/* Quick actions */}
          <QuickActions>
            <ActionButton 
              onClick={() => navigate('/communication')}
              title="Zprávy"
            >
              💬
              <NotificationBadge>3</NotificationBadge>
            </ActionButton>
            
            <ActionButton 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              title="Notifikace"
              ref={notificationsRef}
            >
              🔔
              <NotificationBadge>2</NotificationBadge>
              {notificationsOpen && (
                <NotificationsDropdown>
                  <DropdownHeader>
                    <h4>Notifikace</h4>
                    <ClearAllButton>Označit vše jako přečtené</ClearAllButton>
                  </DropdownHeader>
                  <NotificationList>
                    <NotificationItem>
                      <NotificationIcon>📅</NotificationIcon>
                      <NotificationContent>
                        <NotificationTitle>Nový harmonogram</NotificationTitle>
                        <NotificationTime>před 5 minutami</NotificationTime>
                      </NotificationContent>
                    </NotificationItem>
                    <NotificationItem>
                      <NotificationIcon>👥</NotificationIcon>
                      <NotificationContent>
                        <NotificationTitle>Nový člen štábu přiřazen</NotificationTitle>
                        <NotificationTime>před 1 hodinou</NotificationTime>
                      </NotificationContent>
                    </NotificationItem>
                  </NotificationList>
                  <DropdownFooter>
                    <ViewAllButton onClick={() => navigate('/notifications')}>
                      Zobrazit všechny
                    </ViewAllButton>
                  </DropdownFooter>
                </NotificationsDropdown>
              )}
            </ActionButton>
          </QuickActions>

          {/* User menu */}
          <UserSection ref={userMenuRef}>
            <UserButton 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              isOpen={userMenuOpen}
            >
              <UserAvatar>
                {user?.display_name?.charAt(0) || user?.username?.charAt(0) || '?'}
              </UserAvatar>
              <UserInfo>
                <UserName>{user?.display_name || user?.username}</UserName>
                <UserRole>{user?.role || 'Uživatel'}</UserRole>
              </UserInfo>
              <DropdownArrow isOpen={userMenuOpen}>▼</DropdownArrow>
            </UserButton>

            {userMenuOpen && (
              <UserDropdown>
                <DropdownHeader>
                  <UserDropdownInfo>
                    <strong>{user?.display_name || user?.username}</strong>
                    <span>{user?.email}</span>
                  </UserDropdownInfo>
                </DropdownHeader>
                
                <DropdownMenu>
                  <DropdownItem onClick={() => navigate('/profile')}>
                    <DropdownIcon>👤</DropdownIcon>
                    Profil
                  </DropdownItem>
                  <DropdownItem onClick={() => navigate('/settings')}>
                    <DropdownIcon>⚙️</DropdownIcon>
                    Nastavení
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem onClick={() => navigate('/help')}>
                    <DropdownIcon>❓</DropdownIcon>
                    Nápověda
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem onClick={handleLogout} danger>
                    <DropdownIcon>🚪</DropdownIcon>
                    Odhlásit se
                  </DropdownItem>
                </DropdownMenu>
              </UserDropdown>
            )}
          </UserSection>
        </RightSection>
      </HeaderContent>
    </HeaderContainer>
  );
}

// Styled components
const HeaderContainer = styled.header`
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  position: sticky;
  top: 0;
  z-index: ${props => props.theme.zIndex.dropdown};
  backdrop-filter: blur(8px);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  max-width: 100%;
  gap: ${props => props.theme.spacing.lg};
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  min-width: 0;
`;

const Logo = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  background: none;
  border: none;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: background-color ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const LogoIcon = styled.span`
  font-size: 1.5rem;
`;

const LogoText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
`;

const Breadcrumbs = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    display: none;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: ${props => props.theme.colors.textMuted};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
`;

const CenterSection = styled.div`
  flex: 1;
  max-width: 600px;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  padding-right: 3rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.background};
  font-size: ${props => props.theme.typography.fontSize.sm};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  right: ${props => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.textMuted};
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const QuickActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const ActionButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: 1.25rem;
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  background: ${props => props.theme.colors.error};
  color: white;
  font-size: ${props => props.theme.typography.fontSize.xs};
  padding: 2px 6px;
  border-radius: ${props => props.theme.borderRadius.full};
  min-width: 18px;
  text-align: center;
`;

const UserSection = styled.div`
  position: relative;
`;

const UserButton = styled.button<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border: none;
  background: ${props => props.isOpen ? props.theme.colors.surfaceHover : 'none'};
  border-radius: ${props => props.theme.borderRadius.lg};
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    display: none;
  }
`;

const UserName = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
`;

const UserRole = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
  white-space: nowrap;
`;

const DropdownArrow = styled.span<{ isOpen: boolean }>`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textMuted};
  transition: transform ${props => props.theme.transitions.fast};
  transform: rotate(${props => props.isOpen ? '180deg' : '0deg'});
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    display: none;
  }
`;

// Shared dropdown styles
const BaseDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: ${props => props.theme.zIndex.dropdown};
  min-width: 280px;
  overflow: hidden;
  animation: slideInDown 0.2s ease-out;
`;

const UserDropdown = styled(BaseDropdown)``;
const NotificationsDropdown = styled(BaseDropdown)``;

const DropdownHeader = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const UserDropdownInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  strong {
    color: ${props => props.theme.colors.text};
    font-size: ${props => props.theme.typography.fontSize.sm};
  }
  
  span {
    color: ${props => props.theme.colors.textSecondary};
    font-size: ${props => props.theme.typography.fontSize.xs};
  }
`;

const ClearAllButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.fontSize.xs};
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const DropdownMenu = styled.div`
  padding: ${props => props.theme.spacing.xs} 0;
`;

const DropdownItem = styled.button<{ danger?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: none;
  background: none;
  text-align: left;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.danger ? props.theme.colors.error : props.theme.colors.text};
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const DropdownIcon = styled.span`
  font-size: 1rem;
  width: 20px;
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: ${props => props.theme.colors.border};
  margin: ${props => props.theme.spacing.xs} 0;
`;

const NotificationList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationIcon = styled.span`
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationTitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  margin-bottom: 2px;
`;

const NotificationTime = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const DropdownFooter = styled.div`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const ViewAllButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.sm};
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  text-align: center;
  border-radius: ${props => props.theme.borderRadius.md};
  transition: background-color ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

export default Header;
