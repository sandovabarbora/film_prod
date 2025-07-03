import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import styled, { ThemeProvider } from 'styled-components';
import { AuthProvider } from './contexts/AuthContext';
import authService from './services/authService';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Crew from './pages/Crew';
import Equipment from './pages/Equipment';
import Locations from './pages/Locations';
import Budget from './pages/Budget';
import Documents from './pages/Documents';
import Communication from './pages/Communication';
import Weather from './pages/Weather';
import Login from './pages/Auth/Login';
import { JoinProduction } from './pages/Auth/JoinProduction';
import { Onboarding } from './pages/Auth/Onboarding';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${({ theme }) => theme.colors.gray[850]};
`;

const MainContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ContentArea = styled.main`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.gray[850]};
`;

// Vylepšený ProtectedRoute používající authService
const ProtectedRoute: React.FC = () => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

// Layout komponent s Outlet pro vnořené routes
const Layout: React.FC = () => {
  return (
    <AppContainer>
      <Header />
      <MainContent>
        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainContent>
    </AppContainer>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/join" element={<JoinProduction />} />
              <Route path="/onboarding" element={<Onboarding />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/crew" element={<Crew />} />
                  <Route path="/equipment" element={<Equipment />} />
                  <Route path="/locations" element={<Locations />} />
                  <Route path="/budget" element={<Budget />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/communication" element={<Communication />} />
                  <Route path="/weather" element={<Weather />} />
                </Route>
              </Route>
              
              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;