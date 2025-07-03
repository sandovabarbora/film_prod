import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import { Sidebar } from './components/layout/Sidebar';
import { PageContainer } from './components/layout/Container';
import { ProductionDashboard } from './components/features/ProductionDashboard';
import { ScheduleCalendar } from './components/features/Schedule';
import { CrewList } from './components/features/CrewManagement';
import { RealTimeHub } from './components/features/RealTimeHub';
import { SmartBudgetTracker } from './components/features/BudgetTracker';
import { GreenProductionTracker } from './components/features/GreenProduction';
import { Login } from './pages/Auth/Login';
import { Onboarding } from './pages/Auth/Onboarding';
import { JoinProduction } from './pages/Auth/JoinProduction';

// Icons
const DashboardIcon = () => <span>📊</span>;
const LiveIcon = () => <span>🔴</span>;
const ScheduleIcon = () => <span>📅</span>;
const CrewIcon = () => <span>👥</span>;
const BudgetIcon = () => <span>💰</span>;
const GreenIcon = () => <span>🌱</span>;
const AnalyticsIcon = () => <span>📈</span>;

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { id: 'live', label: 'Live Hub', icon: <LiveIcon />, path: '/live' },
  { id: 'schedule', label: 'Schedule', icon: <ScheduleIcon />, path: '/schedule' },
  { id: 'crew', label: 'Crew', icon: <CrewIcon />, path: '/crew' },
  { id: 'budget', label: 'Budget AI', icon: <BudgetIcon />, path: '/budget' },
  { id: 'green', label: 'Eco Track', icon: <GreenIcon />, path: '/green' },
  { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('authToken');
  const hasCompletedOnboarding = localStorage.getItem('onboardingComplete');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!hasCompletedOnboarding && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
  }
  
  return <>{children}</>;
};

// Layout wrapper for authenticated pages
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Sidebar navItems={navItems} />
      {children}
    </>
  );
};

// Pages
const Dashboard = () => (
  <PageContainer>
    <h1>Production Management Dashboard</h1>
    <ProductionDashboard />
  </PageContainer>
);

const LiveHub = () => (
  <PageContainer>
    <h1>Real-time Collaboration Hub</h1>
    <p style={{ marginBottom: '1.5rem', color: '#999' }}>
      Live updates from set • AI insights • Instant communication
    </p>
    <RealTimeHub />
  </PageContainer>
);

const Schedule = () => (
  <PageContainer>
    <h1>Production Schedule</h1>
    <ScheduleCalendar />
  </PageContainer>
);

const Crew = () => (
  <PageContainer>
    <h1>Crew Management</h1>
    <CrewList />
  </PageContainer>
);

const Budget = () => (
  <PageContainer>
    <h1>AI-Powered Budget Tracking</h1>
    <p style={{ marginBottom: '1.5rem', color: '#999' }}>
      Real-time cost analysis • Predictive alerts • Smart recommendations
    </p>
    <SmartBudgetTracker />
  </PageContainer>
);

const Green = () => (
  <PageContainer>
    <h1>Green Production Tracker</h1>
    <p style={{ marginBottom: '1.5rem', color: '#999' }}>
      Reduce carbon footprint • Save costs • Industry-leading sustainability
    </p>
    <GreenProductionTracker />
  </PageContainer>
);

const Analytics = () => (
  <PageContainer>
    <h1>Production Analytics</h1>
    <p>Advanced analytics and insights coming soon...</p>
  </PageContainer>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/join" element={<JoinProduction />} />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />
            
            {/* App Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/live" element={
              <ProtectedRoute>
                <AppLayout>
                  <LiveHub />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/schedule" element={
              <ProtectedRoute>
                <AppLayout>
                  <Schedule />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/crew" element={
              <ProtectedRoute>
                <AppLayout>
                  <Crew />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/budget" element={
              <ProtectedRoute>
                <AppLayout>
                  <Budget />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/green" element={
              <ProtectedRoute>
                <AppLayout>
                  <Green />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AppLayout>
                  <Analytics />
                </AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
