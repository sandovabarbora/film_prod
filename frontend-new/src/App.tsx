import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { Theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import ErrorBoundary from './components/common/ErrorBoundary';
import Loading from './components/common/Loading';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Films from './pages/Films';
import ProjectDetail from './pages/ProjectDetail';
import Crew from './pages/Crew';
import Schedule from './pages/Schedule';
import Budget from './pages/Budget';
import Documents from './pages/Documents';
import Communication from './pages/Communication';
import Equipment from './pages/Equipment';
import Locations from './pages/Locations';
import Weather from './pages/Weather';

// Auth pages
import Login from './pages/Auth/Login';
import Onboarding from './pages/Auth/Onboarding';
import JoinProduction from './pages/Auth/JoinProduction';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={Theme}>
        <GlobalStyles />
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/join" element={<JoinProduction />} />
                
                {/* Protected app routes */}
                <Route 
                  path="/*" 
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Routes>
                          {/* Dashboard */}
                          <Route path="" element={<Dashboard />} />
                          <Route path="dashboard" element={<Dashboard />} />
                          
                          {/* Films */}
                          <Route path="films" element={<Films />} />
                          <Route path="films/:id" element={<ProjectDetail />} />
                          
                          {/* Project-specific routes with ProjectProvider */}
                          <Route path="films/:id/schedule" element={
                            <ProjectProvider>
                              <Schedule />
                            </ProjectProvider>
                          } />
                          <Route path="films/:id/crew" element={
                            <ProjectProvider>
                              <Crew />
                            </ProjectProvider>
                          } />
                          <Route path="films/:id/budget" element={
                            <ProjectProvider>
                              <Budget />
                            </ProjectProvider>
                          } />
                          <Route path="films/:id/documents" element={
                            <ProjectProvider>
                              <Documents />
                            </ProjectProvider>
                          } />
                          <Route path="films/:id/locations" element={
                            <ProjectProvider>
                              <Locations />
                            </ProjectProvider>
                          } />
                          
                          {/* Global routes - bez ProjectProvider */}
                          <Route path="crew" element={<Crew />} />
                          <Route path="schedule" element={<Schedule />} />
                          <Route path="budget" element={<Budget />} />
                          <Route path="documents" element={<Documents />} />
                          <Route path="communication" element={<Communication />} />
                          <Route path="equipment" element={<Equipment />} />
                          <Route path="locations" element={<Locations />} />
                          <Route path="weather" element={<Weather />} />
                        </Routes>
                      </AppLayout>
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
