// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './components/common/Notification';

// Components
import ErrorBoundary from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
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
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/films" element={<Films />} />
                        <Route path="/communication" element={<Communication />} />
                        <Route path="/schedule" element={<Schedule />} />
                        <Route path="/crew" element={<Crew />} />
                        <Route path="/budget" element={<Budget />} />
                        <Route path="/equipment" element={<Equipment />} />
                        <Route path="/locations" element={<Locations />} />
                        <Route path="/documents" element={<Documents />} />
                        <Route path="/weather" element={<Weather />} />
                      </Routes>
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

export default App;
