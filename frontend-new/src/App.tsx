// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './components/common/Notification';

// Components
import ErrorBoundary from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/Header';

// Pages
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard';
import Films from './pages/Films';
import Communication from './pages/Communication';
import Schedule from './pages/Schedule';
import Crew from './pages/Crew';
import Budget from './pages/Budget';
import Equipment from './pages/Equipment';
import Locations from './pages/Locations';
import Documents from './pages/Documents';
import Weather from './pages/Weather';

// Styles
import { GlobalStyles } from './styles/GlobalStyles';
import { Theme } from './styles/theme';

function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={Theme}>
        <GlobalStyles />
        <NotificationProvider>
          <AuthProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes with layout */}
                <Route path="/*" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Header />
                      <MainContent>
                        <Sidebar />
                        <ContentArea>
                          <ErrorBoundary>
                            <Routes>
                              <Route path="/" element={<Navigate to="/dashboard" replace />} />
                              <Route path="/dashboard" element={<Dashboard />} />
                              <Route path="/films" element={<Films />} />
                              <Route path="/films/:id" element={<Films />} />
                              <Route path="/communication" element={<Communication />} />
                              <Route path="/communication/:productionId" element={<Communication />} />
                              <Route path="/schedule" element={<Schedule />} />
                              <Route path="/schedule/:productionId" element={<Schedule />} />
                              <Route path="/crew" element={<Crew />} />
                              <Route path="/crew/:productionId" element={<Crew />} />
                              <Route path="/budget" element={<Budget />} />
                              <Route path="/budget/:productionId" element={<Budget />} />
                              <Route path="/equipment" element={<Equipment />} />
                              <Route path="/equipment/:productionId" element={<Equipment />} />
                              <Route path="/locations" element={<Locations />} />
                              <Route path="/locations/:productionId" element={<Locations />} />
                              <Route path="/documents" element={<Documents />} />
                              <Route path="/documents/:productionId" element={<Documents />} />
                              <Route path="/weather" element={<Weather />} />
                              
                              {/* 404 fallback */}
                              <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                          </ErrorBoundary>
                        </ContentArea>
                      </MainContent>
                    </AppLayout>
                  </ProtectedRoute>
                } />
              </Routes>
            </Router>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// Layout components
const AppLayout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${props => props.theme.colors.background};
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ContentArea = styled.main`
  flex: 1;
  overflow-y: auto;
  background: ${props => props.theme.colors.surface};
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.textSecondary};
  }
`;

export default App;
