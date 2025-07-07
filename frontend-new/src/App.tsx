// src/App.tsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/Header'
import styled, { ThemeProvider } from 'styled-components'
import { theme } from './styles/theme'

// Import pages
import Login from './pages/Auth/Login'
import Dashboard from './pages/Dashboard'
import Films from './pages/Films'
import Communication from './pages/Communication'
import Schedule from './pages/Schedule'
import Crew from './pages/Crew'
import Budget from './pages/Budget'
import Equipment from './pages/Equipment'
import Locations from './pages/Locations'
import Documents from './pages/Documents'
import Weather from './pages/Weather'

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
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
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/films" element={<Films />} />
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
                        <Route path="/weather/:productionId" element={<Weather />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </ContentArea>
                  </MainContent>
                </AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

// Styled Components
const AppLayout = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background};
`

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`

const ContentArea = styled.main`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

export default App