// src/components/layout/Sidebar/Sidebar.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../../contexts/AuthContext';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  badge?: number;
  subItems?: MenuItem[];
  permissions?: string[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: '📊',
  },
  {
    id: 'films',
    label: 'Projekty',
    path: '/films',
    icon: '🎬',
  },
  {
    id: 'schedule',
    label: 'Harmonogram',
    path: '/schedule',
    icon: '📅',
  },
  {
    id: 'crew',
    label: 'Štáb',
    path: '/crew',
    icon: '👥',
  },
  {
    id: 'communication',
    label: 'Komunikace',
    path: '/communication',
    icon: '💬',
    badge: 3,
  },
  {
    id: 'budget',
    label: 'Rozpočet',
    path: '/budget',
    icon: '💰',
    permissions: ['production_manager', 'admin'],
  },
  {
    id: 'equipment',
    label: 'Technika',
    path: '/equipment',
    icon: '📷',
  },
  {
    id: 'locations',
    label: 'Lokace',
    path: '/locations',
    icon: '📍',
  },
  {
    id: 'documents',
    label: 'Dokumenty',
    path: '/documents',
    icon: '📄',
  },
  {
    id: 'weather',
    label: 'Počasí',
    path: '/weather',
    icon: '🌤️',
  },
];

export function Sidebar(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const hasPermission = (permissions?: string[]): boolean => {
    if (!permissions || !user) return true;
    
    // Check if user has required permissions
    return permissions.some(permission => {
      switch (permission) {
        case 'admin':
          return user.is_staff || user.is_superuser;
        case 'production_manager':
          return user.role === 'production_manager' || user.is_staff;
        default:
          return true;
      }
    });
  };

  const toggleExpanded = (itemId: string): void => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleNavigation = (path: string): void => {
    navigate(path);
  };

  const isActiveItem = (item: MenuItem): boolean => {
    if (item.path === location.pathname) return true;
    if (item.subItems) {
      return item.subItems.some(subItem => subItem.path === location.pathname);
    }
    return location.pathname.startsWith(item.path) && item.path !== '/';
  };

  const visibleMenuItems = menuItems.filter(item => hasPermission(item.permissions));

  return (
    <SidebarContainer $isCollapsed={isCollapsed}>
      <SidebarHeader>
        <LogoContainer $isCollapsed={isCollapsed}>
          <Logo>🎬</Logo>
          {!isCollapsed && <LogoText>FilmFlow</LogoText>}
        </LogoContainer>
        
        <CollapseButton onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? '→' : '←'}
        </CollapseButton>
      </SidebarHeader>

      <Navigation>
        {visibleMenuItems.map(item => (
          <MenuItem key={item.id}>
            <MenuItemButton
              $isActive={isActiveItem(item)}
              $isCollapsed={isCollapsed}
              onClick={() => {
                if (item.subItems) {
                  toggleExpanded(item.id);
                } else {
                  handleNavigation(item.path);
                }
              }}
            >
              <MenuIcon>{item.icon}</MenuIcon>
              {!isCollapsed && (
                <>
                  <MenuLabel>{item.label}</MenuLabel>
                  {item.badge && item.badge > 0 && (
                    <MenuBadge>{item.badge}</MenuBadge>
                  )}
                  {item.subItems && (
                    <ExpandIcon $isExpanded={expandedItems.includes(item.id)}>
                      ▼
                    </ExpandIcon>
                  )}
                </>
              )}
            </MenuItemButton>

            {item.subItems && expandedItems.includes(item.id) && !isCollapsed && (
              <SubMenu>
                {item.subItems.map(subItem => (
                  <SubMenuItem
                    key={subItem.id}
                    $isActive={location.pathname === subItem.path}
                    onClick={() => handleNavigation(subItem.path)}
                  >
                    <SubMenuIcon>{subItem.icon}</SubMenuIcon>
                    <SubMenuLabel>{subItem.label}</SubMenuLabel>
                    {subItem.badge && subItem.badge > 0 && (
                      <MenuBadge>{subItem.badge}</MenuBadge>
                    )}
                  </SubMenuItem>
                ))}
              </SubMenu>
            )}
          </MenuItem>
        ))}
      </Navigation>

      {!isCollapsed && (
        <SidebarFooter>
          <UserInfo>
            <UserAvatar>
              {user?.display_name?.charAt(0) || user?.username?.charAt(0) || '?'}
            </UserAvatar>
            <UserDetails>
              <UserName>{user?.display_name || user?.username}</UserName>
              <UserRole>{user?.role || 'Uživatel'}</UserRole>
            </UserDetails>
          </UserInfo>
        </SidebarFooter>
      )}
    </SidebarContainer>
  );
}

// Styled components
const SidebarContainer = styled.aside<{ $isCollapsed: boolean }>`
  width: ${props => props.$isCollapsed ? '60px' : '280px'};
  height: 100vh;
  background: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
`;

const SidebarHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LogoContainer = styled.div<{ $isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
`;

const LogoText = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const CollapseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
  }
`;

const Navigation = styled.nav`
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
`;

const MenuItem = styled.div`
  margin-bottom: 0.25rem;
`;

const MenuItemButton = styled.button<{ $isActive: boolean; $isCollapsed: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: none;
  background: ${props => props.$isActive ? props.theme.colors.primaryLight : 'transparent'};
  color: ${props => props.$isActive ? props.theme.colors.primary : props.theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  border-left: 3px solid ${props => props.$isActive ? props.theme.colors.primary : 'transparent'};

  &:hover {
    background: ${props => props.$isActive ? props.theme.colors.primaryLight : props.theme.colors.background};
  }

  ${props => props.$isCollapsed && `
    justify-content: center;
    padding: 0.75rem;
  `}
`;

const MenuIcon = styled.span`
  font-size: 1.25rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
`;

const MenuLabel = styled.span`
  flex: 1;
  font-weight: 500;
  font-size: 0.875rem;
`;

const MenuBadge = styled.span`
  background: ${props => props.theme.colors.error};
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
`;

const ExpandIcon = styled.span<{ $isExpanded: boolean }>`
  font-size: 0.75rem;
  transition: transform 0.2s ease;
  transform: rotate(${props => props.$isExpanded ? '0deg' : '-90deg'});
`;

const SubMenu = styled.div`
  padding-left: 2.5rem;
`;

const SubMenuItem = styled.button<{ $isActive: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: ${props => props.$isActive ? props.theme.colors.primaryLight : 'transparent'};
  color: ${props => props.$isActive ? props.theme.colors.primary : props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
  }
`;

const SubMenuIcon = styled.span`
  font-size: 1rem;
`;

const SubMenuLabel = styled.span`
  flex: 1;
  font-size: 0.8rem;
`;

const SidebarFooter = styled.div`
  padding: 1rem;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
`;

const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-weight: 500;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default Sidebar;
