import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import styled from 'styled-components';
import { AuthProvider } from './contexts/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
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
  height: 100vh;
  background: ${({ theme }) => theme.colors.gray[850]};
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ContentArea = styled.main`
  flex: 1;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.gray[850]};
`;

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuth = localStorage.getItem('accessToken');
  
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppContainer>
      <Sidebar />
      <MainContent>
        <Header />
        <ContentArea>
          {children}
        </ContentArea>
      </MainContent>
    </AppContainer>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/join" element={<JoinProduction />} />
            <Route path="/onboarding" element={<Onboarding />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/schedule" element={
              <ProtectedRoute>
                <Layout>
                  <Schedule />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/crew" element={
              <ProtectedRoute>
                <Layout>
                  <Crew />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/equipment" element={
              <ProtectedRoute>
                <Layout>
                  <Equipment />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/locations" element={
              <ProtectedRoute>
                <Layout>
                  <Locations />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/budget" element={
              <ProtectedRoute>
                <Layout>
                  <Budget />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/documents" element={
              <ProtectedRoute>
                <Layout>
                  <Documents />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/communication" element={
              <ProtectedRoute>
                <Layout>
                  <Communication />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/weather" element={
              <ProtectedRoute>
                <Layout>
                  <Weather />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
