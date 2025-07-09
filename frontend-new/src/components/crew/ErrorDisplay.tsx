// src/components/crew/ErrorDisplay.tsx - Detailed error display component
import React from 'react';
import styled from 'styled-components';
import { AlertTriangle, X } from 'lucide-react';

const $ErrorContainer = styled.div`
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  backdrop-filter: blur(4px);
`;

const $ErrorHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  
  svg {
    color: #dc2626;
    flex-shrink: 0;
  }
`;

const $ErrorTitle = styled.h4`
  color: #dc2626;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  flex: 1;
`;

const $CloseButton = styled.button`
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: rgba(220, 38, 38, 0.1);
  }
`;

const $ErrorMessage = styled.p`
  color: #dc2626;
  font-size: 13px;
  margin: 0 0 8px 0;
  line-height: 1.4;
  white-space: pre-line;
`;

const $ErrorDetails = styled.div`
  font-size: 12px;
  color: #991b1b;
  background: rgba(220, 38, 38, 0.05);
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
`;

const $FieldErrors = styled.ul`
  margin: 8px 0 0 0;
  padding: 0 0 0 16px;
  
  li {
    color: #dc2626;
    font-size: 13px;
    margin: 4px 0;
  }
`;

interface ErrorDisplayProps {
  error: string | Error | any;
  onClose?: () => void;
  showDetails?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onClose, 
  showDetails = false 
}) => {
  if (!error) return null;

  // Parse error information
  let message = 'Nastala neočekávaná chyba';
  let details = null;
  let fieldErrors: Array<{field: string, message: string}> = [];

  if (typeof error === 'string') {
    message = error;
  } else if (error?.message) {
    message = error.message;
    
    // Extract additional details for DetailedApiError
    if (error.details && Array.isArray(error.details)) {
      fieldErrors = error.details;
    }
    
    if (showDetails && (error.status || error.rawData)) {
      details = {
        status: error.status,
        rawData: error.rawData,
        url: error.response?.url
      };
    }
  }

  return (
    <$ErrorContainer>
      <$ErrorHeader>
        <AlertTriangle size={16} />
        <$ErrorTitle>Chyba při ukládání</$ErrorTitle>
        {onClose && (
          <$CloseButton onClick={onClose}>
            <X size={16} />
          </$CloseButton>
        )}
      </$ErrorHeader>
      
      <$ErrorMessage>{message}</$ErrorMessage>
      
      {fieldErrors.length > 0 && (
        <$FieldErrors>
          {fieldErrors.map((fieldError, index) => (
            <li key={index}>
              <strong>{fieldError.field}:</strong> {fieldError.message}
            </li>
          ))}
        </$FieldErrors>
      )}
      
      {showDetails && details && (
        <$ErrorDetails>
          {JSON.stringify(details, null, 2)}
        </$ErrorDetails>
      )}
    </$ErrorContainer>
  );
};

export default ErrorDisplay;
