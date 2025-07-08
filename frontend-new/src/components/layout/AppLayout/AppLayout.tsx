// src/components/layout/AppLayout/AppLayout.tsx
import React, { ReactNode, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Sidebar, useSidebar } from '../Sidebar';

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  const { isVisible, toggle, show, hide } = useSidebar();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate content margin based on sidebar state
  const getContentMargin = () => {
    if (!isVisible || isMobile) return 0; // No margin on mobile or when hidden
    return isCollapsed ? 80 : 280; // Collapsed vs expanded width
  };

  return (
    <LayoutContainer className={className}>
      <Sidebar 
        isVisible={isVisible} 
        onVisibilityChange={(visible) => visible ? show() : hide()}
        onCollapseChange={(collapsed) => setIsCollapsed(collapsed)}
      />
      <MainContent $marginLeft={getContentMargin()}>
        {children}
      </MainContent>
    </LayoutContainer>
  );
}

// Layout s external sidebar control
interface ControlledAppLayoutProps {
  children: ReactNode;
  sidebarVisible?: boolean;
  onSidebarToggle?: () => void;
  className?: string;
}

export function ControlledAppLayout({ 
  children, 
  sidebarVisible = true, 
  onSidebarToggle,
  className 
}: ControlledAppLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate content margin based on sidebar state
  const getContentMargin = () => {
    if (!sidebarVisible || isMobile) return 0;
    return isCollapsed ? 80 : 280;
  };

  return (
    <LayoutContainer className={className}>
      <Sidebar 
        isVisible={sidebarVisible} 
        onVisibilityChange={onSidebarToggle}
        onCollapseChange={(collapsed) => setIsCollapsed(collapsed)}
      />
      <MainContent $marginLeft={getContentMargin()}>
        {children}
      </MainContent>
    </LayoutContainer>
  );
}

// Hook pro sidebar info v komponentách
export function useSidebarLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getSidebarWidth = () => {
    if (!isVisible) return 0;
    if (isMobile) return 0; // mobile sidebar is overlay
    return isCollapsed ? 80 : 280;
  };

  return {
    isCollapsed,
    setIsCollapsed,
    isVisible,
    setIsVisible,
    isMobile,
    sidebarWidth: getSidebarWidth(),
  };
}

// Styled components
const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  overflow: hidden;
`;

const MainContent = styled.main<{ $marginLeft: number }>`
  flex: 1;
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  overflow-y: auto;
  transition: margin-left ${props => props.theme.transitions.normal};
  margin-left: ${props => props.$marginLeft}px;
  
  /* Ensure content doesn't go under sidebar on mobile */
  @media (max-width: 767px) {
    margin-left: 0 !important;
  }
`;
