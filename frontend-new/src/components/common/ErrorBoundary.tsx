// src/components/common/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import styled from 'styled-components';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Sentry, LogRocket, etc.
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Něco se pokazilo</ErrorTitle>
          <ErrorMessage>
            Aplikace narazila na neočekávanou chybu. Prosím obnovte stránku nebo zkuste později.
          </ErrorMessage>
          <ErrorDetails>
            {this.state.error?.message && (
              <details>
                <summary>Detaily chyby</summary>
                <pre>{this.state.error.message}</pre>
              </details>
            )}
          </ErrorDetails>
          <RetryButton onClick={() => window.location.reload()}>
            Obnovit stránku
          </RetryButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

// API Error Boundary - specificky pro API chyby
export function ApiErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <ErrorContainer>
          <ErrorIcon>🌐</ErrorIcon>
          <ErrorTitle>Problém s připojením</ErrorTitle>
          <ErrorMessage>
            Nepodařilo se načíst data ze serveru. Zkontrolujte připojení k internetu.
          </ErrorMessage>
          <RetryButton onClick={() => window.location.reload()}>
            Zkusit znovu
          </RetryButton>
        </ErrorContainer>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
  background: ${props => props.theme.colors.background};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h2`
  color: ${props => props.theme.colors.error};
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const ErrorMessage = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1.5rem;
  max-width: 500px;
  line-height: 1.6;
`;

const ErrorDetails = styled.div`
  margin-bottom: 1.5rem;
  
  details {
    text-align: left;
    
    summary {
      cursor: pointer;
      color: ${props => props.theme.colors.textSecondary};
      margin-bottom: 0.5rem;
    }
    
    pre {
      background: ${props => props.theme.colors.surface};
      padding: 1rem;
      border-radius: 4px;
      font-size: 0.875rem;
      overflow-x: auto;
      color: ${props => props.theme.colors.error};
    }
  }
`;

const RetryButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default ErrorBoundary;
