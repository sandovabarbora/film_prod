import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Film, Users, Calendar, DollarSign, FileText, 
  MessageSquare, Wrench, MapPin, CloudRain,
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useSidebar } from '../../hooks/useSidebar';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/films', label: 'Projekty', icon: Film },
  { path: '/crew', label: 'Štáb', icon: Users },
  { path: '/schedule', label: 'Harmonogram', icon: Calendar },
  { path: '/budget', label: 'Rozpočet', icon: DollarSign },
  { path: '/documents', label: 'Dokumenty', icon: FileText },
  { path: '/communication', label: 'Komunikace', icon: MessageSquare },
  { path: '/equipment', label: 'Technika', icon: Wrench },
  { path: '/locations', label: 'Lokace', icon: MapPin },
  { path: '/weather', label: 'Počasí', icon: CloudRain },
];

const SidebarContainer = styled.aside<{ $isCollapsed: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${({ $isCollapsed }) => $isCollapsed ? '80px' : '280px'};
  background: ${({ theme }) => theme.colors.gray?.[900] || '#1a1a1a'};
  border-right: 1px solid ${({ theme }) => theme.colors.gray?.[700] || '#333'};
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 1024px) {
    transform: ${({ $isCollapsed }) => $isCollapsed ? 'translateX(-100%)' : 'translateX(0)'};
    width: 280px;
  }
`;

const SidebarHeader = styled.div<{ $isCollapsed: boolean }>`
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray?.[700] || '#333'};
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 80px;
`;

const Logo = styled.div`
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.accent?.main || '#667eea'};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const LogoText = styled.div<{ $isCollapsed: boolean }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary?.light || '#fff'};
  opacity: ${({ $isCollapsed }) => $isCollapsed ? 0 : 1};
  transform: ${({ $isCollapsed }) => $isCollapsed ? 'translateX(-10px)' : 'translateX(0)'};
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
`;

const Navigation = styled.nav`
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li<{ $isActive: boolean; $isCollapsed: boolean }>`
  margin: 0 1rem;
  
  a {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    text-decoration: none;
    color: ${({ $isActive, theme }) => 
      $isActive ? theme.colors.accent?.main || '#667eea' : theme.colors.gray?.[300] || '#d1d5db'
    };
    background: ${({ $isActive, theme }) => 
      $isActive ? `${theme.colors.accent?.main || '#667eea'}15` : 'transparent'
    };
    transition: all 0.2s ease;
    cursor: pointer;
    
    &:hover {
      background: ${({ theme }) => theme.colors.gray?.[800] || '#2a2a2a'};
      color: ${({ theme }) => theme.colors.primary?.light || '#fff'};
    }
    
    svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
    
    span {
      opacity: ${({ $isCollapsed }) => $isCollapsed ? 0 : 1};
      transform: ${({ $isCollapsed }) => $isCollapsed ? 'translateX(-10px)' : 'translateX(0)'};
      transition: all 0.3s ease;
      white-space: nowrap;
      overflow: hidden;
    }
  }
`;

const CollapseButton = styled.button`
  position: absolute;
  top: 50%;
  right: -12px;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gray?.[900] || '#1a1a1a'};
  border: 1px solid ${({ theme }) => theme.colors.gray?.[700] || '#333'};
  color: ${({ theme }) => theme.colors.gray?.[400] || '#9ca3af'};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${({ theme }) => theme.colors.accent?.main || '#667eea'};
    color: white;
    border-color: ${({ theme }) => theme.colors.accent?.main || '#667eea'};
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const MobileOverlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: ${({ $isVisible }) => $isVisible ? 1 : 0};
  visibility: ${({ $isVisible }) => $isVisible ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  z-index: 999;
  
  @media (min-width: 1025px) {
    display: none;
  }
`;

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCollapsed, toggle } = useSidebar();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <MobileOverlay $isVisible={!isCollapsed} onClick={toggle} />
      <SidebarContainer $isCollapsed={isCollapsed}>
        <SidebarHeader $isCollapsed={isCollapsed}>
          <Logo>🎬</Logo>
          <LogoText $isCollapsed={isCollapsed}>FilmFlow</LogoText>
        </SidebarHeader>

        <Navigation>
          <NavList>
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                $isActive={location.pathname === item.path || location.pathname.startsWith(item.path + '/')}
                $isCollapsed={isCollapsed}
              >
                <a onClick={() => handleNavigation(item.path)}>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </NavItem>
            ))}
          </NavList>
        </Navigation>

        <CollapseButton onClick={toggle}>
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </CollapseButton>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
