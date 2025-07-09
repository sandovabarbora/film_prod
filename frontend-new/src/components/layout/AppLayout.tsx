import React from 'react';
import styled from 'styled-components';
import { Sidebar } from './Sidebar';
import { useSidebar } from '../../hooks/useSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background?.primary || theme.colors.cinema?.midnight || '#0f0f23'};
`;

const MainContent = styled.main<{ $sidebarCollapsed: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  margin-left: ${({ $sidebarCollapsed }) => $sidebarCollapsed ? '80px' : '280px'};
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background?.primary || theme.colors.cinema?.midnight || '#0f0f23'};
  
  @media (max-width: 1024px) {
    margin-left: 0;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background: ${({ theme }) => theme.colors.background?.primary || theme.colors.cinema?.midnight || '#0f0f23'};
`;

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isCollapsed } = useSidebar();

  return (
    <LayoutContainer>
      <Sidebar />
      <MainContent $sidebarCollapsed={isCollapsed}>
        <ContentWrapper>
          {children}
        </ContentWrapper>
      </MainContent>
    </LayoutContainer>
  );
};

export default AppLayout;
