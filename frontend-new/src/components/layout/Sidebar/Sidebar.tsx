// src/components/layout/Sidebar/Sidebar.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled, { css, keyframes } from 'styled-components';
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

interface SidebarProps {
  className?: string;
  isVisible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
  onCollapseChange?: (collapsed: boolean) => void;
  variant?: 'default' | 'glass' | 'minimal';
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

export function Sidebar({ 
  className, 
  isVisible: externalIsVisible, 
  onVisibilityChange: externalOnVisibilityChange,
  onCollapseChange,
  variant = 'default' 
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Internal visibility state
  const [internalIsVisible, setInternalIsVisible] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showEdgeTrigger, setShowEdgeTrigger] = useState(false);
  
  // Use external state if provided, otherwise internal
  const isVisible = externalIsVisible !== undefined ? externalIsVisible : internalIsVisible;
  const onVisibilityChange = externalOnVisibilityChange || setInternalIsVisible;

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // On mobile, start hidden
      if (mobile && externalIsVisible === undefined) {
        setInternalIsVisible(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [externalIsVisible]);

  // Notify parent about collapse state changes
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);

  // Show/hide edge trigger based on sidebar visibility
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (!isVisible) {
      // Show edge trigger after short delay
      timer = setTimeout(() => setShowEdgeTrigger(true), 300);
    } else {
      // Hide edge trigger immediately when sidebar is visible
      setShowEdgeTrigger(false);
    }
    
    return () => clearTimeout(timer);
  }, [isVisible]);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobile && isVisible) {
      onVisibilityChange(false);
    }
  }, [location.pathname, isMobile, isVisible, onVisibilityChange]);

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        onVisibilityChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, onVisibilityChange]);

  const hasPermission = (permissions?: string[]): boolean => {
    if (!permissions || !user) return true;
    
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

  const handleNavigation = useCallback((path: string): void => {
    navigate(path);
  }, [navigate]);

  const isActiveItem = (item: MenuItem): boolean => {
    if (location.pathname === item.path) return true;
    if (item.subItems) {
      return item.subItems.some(subItem => location.pathname === subItem.path);
    }
    return false;
  };

  const visibleMenuItems = menuItems.filter(item => hasPermission(item.permissions));

  // Backdrop click handler
  const handleBackdropClick = useCallback(() => {
    onVisibilityChange(false);
  }, [onVisibilityChange]);

  // Toggle sidebar visibility
  const handleToggleVisibility = useCallback(() => {
    onVisibilityChange(!isVisible);
  }, [isVisible, onVisibilityChange]);

  // Show sidebar from edge trigger
  const handleShowSidebar = useCallback(() => {
    onVisibilityChange(true);
  }, [onVisibilityChange]);

  // Toggle collapse
  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed]);

  return (
    <>
      {/* Edge Trigger - shows when sidebar is hidden */}
      {showEdgeTrigger && !isVisible && (
        <EdgeTrigger onClick={handleShowSidebar}>
          <EdgeTriggerIcon>→</EdgeTriggerIcon>
          <EdgeTriggerTooltip>Zobrazit menu</EdgeTriggerTooltip>
        </EdgeTrigger>
      )}

      {/* Mobile Backdrop */}
      {isMobile && isVisible && (
        <Backdrop onClick={handleBackdropClick} />
      )}

      {/* Sidebar */}
      {isVisible && (
        <SidebarContainer 
          $isCollapsed={isCollapsed}
          $isMobile={isMobile}
          $variant={variant}
          className={className}
        >
          {/* Floating Collapse Button - desktop only */}
          {!isMobile && (
            <FloatingCollapseButton 
              $isCollapsed={isCollapsed}
              onClick={handleToggleCollapse}
              title={isCollapsed ? 'Rozbalit sidebar' : 'Sbalit sidebar'}
            >
              <CollapseArrow $isCollapsed={isCollapsed}>
                ←
              </CollapseArrow>
            </FloatingCollapseButton>
          )}

          <SidebarHeader>
            <LogoContainer $isCollapsed={isCollapsed}>
              <Logo>🎬</Logo>
              {!isCollapsed && <LogoText>FilmPro</LogoText>}
            </LogoContainer>
            
            <HeaderActions>
              {/* Hide button */}
              <HideButton 
                onClick={handleToggleVisibility}
                title="Skrýt sidebar"
              >
                ✕
              </HideButton>
            </HeaderActions>
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
      )}
    </>
  );
}

// Hook for programmatic sidebar control
export function useSidebar() {
  const [isVisible, setIsVisible] = useState(true);
  
  const toggle = useCallback(() => setIsVisible(prev => !prev), []);
  const show = useCallback(() => setIsVisible(true), []);
  const hide = useCallback(() => setIsVisible(false), []);
  
  return { isVisible, toggle, show, hide };
}

// Burger Menu Button Component for Header
export function SidebarToggle({ isVisible, onToggle, className }: {
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <BurgerButton 
      onClick={onToggle} 
      className={className}
      title={isVisible ? 'Skrýt menu' : 'Zobrazit menu'}
    >
      <BurgerLine $isVisible={isVisible} $index={0} />
      <BurgerLine $isVisible={isVisible} $index={1} />
      <BurgerLine $isVisible={isVisible} $index={2} />
    </BurgerButton>
  );
}

// Animations
const slideInFromLeft = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
`;

const slideInFromRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

// Styled components
const EdgeTrigger = styled.button`
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 80px;
  background: ${props => props.theme.colors.primary};
  border: none;
  border-radius: 0 12px 12px 0;
  color: white;
  cursor: pointer;
  z-index: 101;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.theme.shadows.lg};
  transition: all ${props => props.theme.transitions.normal};
  animation: ${slideInFromLeft} 0.3s ease-out;

  &:hover {
    width: 50px;
    background: ${props => props.theme.colors.primaryDark};
    box-shadow: ${props => props.theme.shadows.xl};
    
    &::after {
      opacity: 1;
      visibility: visible;
    }
  }

  &:active {
    animation: ${pulse} 0.2s ease-out;
  }
`;

const EdgeTriggerIcon = styled.span`
  font-size: 1.25rem;
  font-weight: bold;
  transition: transform ${props => props.theme.transitions.fast};
  
  ${EdgeTrigger}:hover & {
    transform: translateX(2px);
  }
`;

const EdgeTriggerTooltip = styled.div`
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 12px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  white-space: nowrap;
  box-shadow: ${props => props.theme.shadows.lg};
  opacity: 0;
  visibility: hidden;
  transition: all ${props => props.theme.transitions.fast};
  pointer-events: none;
  
  &::before {
    content: '';
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 6px solid transparent;
    border-right-color: ${props => props.theme.colors.surface};
  }
  
  ${EdgeTrigger}:hover & {
    opacity: 1;
    visibility: visible;
  }
`;

// Floating Collapse Button
const FloatingCollapseButton = styled.button<{ $isCollapsed: boolean }>`
  position: absolute;
  right: -15px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 60px;
  background: ${props => props.theme.colors.primary};
  border: none;
  border-radius: 0 8px 8px 0;
  color: white;
  cursor: pointer;
  z-index: 102;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.theme.shadows.md};
  transition: all ${props => props.theme.transitions.normal};
  animation: ${slideInFromRight} 0.3s ease-out 0.2s both;

  &:hover {
    width: 36px;
    height: 70px;
    background: ${props => props.theme.colors.primaryDark};
    box-shadow: ${props => props.theme.shadows.lg};
    right: -18px;
  }

  &:active {
    animation: ${pulse} 0.2s ease-out;
  }

  /* Hide on mobile */
  @media (max-width: 767px) {
    display: none;
  }
`;

const CollapseArrow = styled.span<{ $isCollapsed: boolean }>`
  font-size: 1rem;
  font-weight: bold;
  transition: transform ${props => props.theme.transitions.normal};
  transform: rotate(${props => props.$isCollapsed ? '180deg' : '0deg'});
  
  ${FloatingCollapseButton}:hover & {
    transform: rotate(${props => props.$isCollapsed ? '180deg' : '0deg'}) scale(1.2);
  }
`;

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 99;
  animation: fadeIn 0.2s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'glass':
      return css`
        background: ${props => props.theme.glass.light.background};
        backdrop-filter: ${props => props.theme.glass.light.backdrop};
        border-right: 1px solid ${props => props.theme.glass.light.border};
      `;
    case 'minimal':
      return css`
        background: ${props => props.theme.colors.background};
        border-right: 1px solid ${props => props.theme.colors.border};
        box-shadow: none;
      `;
    default:
      return css`
        background: ${props => props.theme.colors.surface};
        border-right: 1px solid ${props => props.theme.colors.border};
        box-shadow: ${props => props.theme.shadows.lg};
      `;
  }
};

const SidebarContainer = styled.aside<{ 
  $isCollapsed: boolean; 
  $isMobile: boolean;
  $variant: string;
}>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  transition: all ${props => props.theme.transitions.normal};
  overflow: hidden;
  z-index: 100;
  position: relative;
  
  ${props => getVariantStyles(props.$variant)}

  /* Desktop styles */
  @media (min-width: 768px) {
    width: ${props => props.$isCollapsed ? '80px' : '280px'};
    position: fixed;
    left: 0;
    top: 0;
    animation: ${slideInFromLeft} 0.3s ease-out;
  }

  /* Mobile styles */
  @media (max-width: 767px) {
    width: 280px;
    position: fixed;
    left: 0;
    top: 0;
    box-shadow: ${props => props.theme.shadows['2xl']};
    animation: ${slideInFromLeft} 0.3s ease-out;
  }
`;

const SidebarHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => props.theme.colors.background};
  min-height: 72px;
`;

const LogoContainer = styled.div<{ $isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
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
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const HideButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all ${props => props.theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;

  &:hover {
    background: ${props => props.theme.colors.error}20;
    color: ${props => props.theme.colors.error};
    transform: scale(1.1);
  }
`;

// Burger button for header
const BurgerButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const BurgerLine = styled.div<{ $isVisible: boolean; $index: number }>`
  width: 18px;
  height: 2px;
  background: ${props => props.theme.colors.text};
  transition: all ${props => props.theme.transitions.fast};
  transform-origin: center;

  ${props => !props.$isVisible && props.$index === 0 && css`
    transform: rotate(45deg) translate(5px, 5px);
  `}
  
  ${props => !props.$isVisible && props.$index === 1 && css`
    opacity: 0;
  `}
  
  ${props => !props.$isVisible && props.$index === 2 && css`
    transform: rotate(-45deg) translate(5px, -5px);
  `}
`;

// Navigation and other styled components...
const Navigation = styled.nav`
  flex: 1;
  padding: ${props => props.theme.spacing.lg} 0;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 2px;
  }
`;

const MenuItem = styled.div`
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const MenuItemButton = styled.button<{ $isActive: boolean; $isCollapsed: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border: none;
  background: ${props => props.$isActive ? props.theme.colors.primaryLight : 'transparent'};
  color: ${props => props.$isActive ? props.theme.colors.primary : props.theme.colors.text};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  text-align: left;
  border-left: 3px solid ${props => props.$isActive ? props.theme.colors.primary : 'transparent'};
  font-weight: ${props => props.$isActive ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.normal};

  &:hover {
    background: ${props => props.$isActive ? props.theme.colors.primaryLight : props.theme.colors.background};
    color: ${props => props.$isActive ? props.theme.colors.primary : props.theme.colors.text};
    transform: translateX(4px);
  }

  ${props => props.$isCollapsed && css`
    justify-content: center;
    padding: ${props => props.theme.spacing.md};
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
  font-weight: inherit;
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const MenuBadge = styled.span`
  background: ${props => props.theme.colors.error};
  color: white;
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  min-width: 18px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ExpandIcon = styled.span<{ $isExpanded: boolean }>`
  font-size: ${props => props.theme.typography.fontSize.xs};
  transition: transform ${props => props.theme.transitions.fast};
  transform: rotate(${props => props.$isExpanded ? '0deg' : '-90deg'});
  color: ${props => props.theme.colors.textSecondary};
`;

const SubMenu = styled.div`
  padding-left: ${props => props.theme.spacing['3xl']};
`;

const SubMenuItem = styled.button<{ $isActive: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border: none;
  background: ${props => props.$isActive ? props.theme.colors.primaryLight : 'transparent'};
  color: ${props => props.$isActive ? props.theme.colors.primary : props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  text-align: left;

  &:hover {
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    transform: translateX(4px);
  }
`;

const SubMenuIcon = styled.span`
  font-size: 1rem;
`;

const SubMenuLabel = styled.span`
  flex: 1;
  font-size: ${props => props.theme.typography.fontSize.xs};
`;

const SidebarFooter = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
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

const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
