import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  background: ${({ theme }) => theme?.colors?.background || 'rgba(15, 15, 15, 0.95)'};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme?.colors?.border || 'rgba(255, 255, 255, 0.1)'};
  backdrop-filter: blur(20px);
  animation: ${fadeIn} 0.3s ease-out;
  max-width: 600px;
  margin: 2rem auto;
  text-align: center;
`;

const ErrorTitle = styled.h2`
  color: ${({ theme }) => theme?.colors?.danger || '#ff6b6b'};
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme?.colors?.textSecondary || 'rgba(255, 255, 255, 0.7)'};
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const RetryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.25);
  }
`;

const ErrorDetails = styled.details`
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: ${({ theme }) => theme?.colors?.textTertiary || 'rgba(255, 255, 255, 0.5)'};
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  text-align: left;
  max-width: 100%;
  overflow-x: auto;

  summary {
    cursor: pointer;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme?.colors?.textSecondary || 'rgba(255, 255, 255, 0.7)'};
  }

  pre {
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorContainer>
          <ErrorTitle>🎬 Něco se pokazilo</ErrorTitle>
          <ErrorMessage>
            Nastala neočekávaná chyba v aplikaci. Zkuste to prosím znovu nebo kontaktujte podporu.
          </ErrorMessage>
          <RetryButton onClick={this.handleRetry}>
            Zkusit znovu
          </RetryButton>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <ErrorDetails>
              <summary>Detaily chyby (pouze v development)</summary>
              <pre>
                <strong>Error:</strong> {this.state.error.message}
                {this.state.error.stack && (
                  <>
                    <br /><br />
                    <strong>Stack:</strong>
                    <br />
                    {this.state.error.stack}
                  </>
                )}
                {this.state.errorInfo && (
                  <>
                    <br /><br />
                    <strong>Component Stack:</strong>
                    <br />
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </pre>
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;