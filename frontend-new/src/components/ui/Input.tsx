// src/components/ui/Input.tsx - Cinema-Grade Input
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  disabled?: boolean;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const InputContainer = styled.div<{ $fullWidth: boolean }>`
  position: relative;
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};
`;

const Label = styled.label`
  display: block;
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  transition: ${({ theme }) => theme.transitions.normal};
`;

const getSizeStyles = (size: string) => {
  const sizes = {
    sm: css`
      padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      min-height: 36px;
    `,
    
    md: css`
      padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
      font-size: ${({ theme }) => theme.typography.fontSize.base};
      min-height: 44px;
    `,
    
    lg: css`
      padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[5]};
      font-size: ${({ theme }) => theme.typography.fontSize.lg};
      min-height: 52px;
    `,
  };

  return sizes[size] || sizes.md;
};

const StyledInput = styled(motion.input)<{
  $hasIcon: boolean;
  $hasError: boolean;
  $size: string;
}>`
  width: 100%;
  background: ${({ theme }) => theme.colors.glass.surface};
  backdrop-filter: ${({ theme }) => theme.cinema.backdrop.light};
  border: 1px solid ${({ theme, $hasError }) => 
    $hasError ? theme.colors.status.shoot : theme.colors.glass.border
  };
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  transition: ${({ theme }) => theme.transitions.cinema};
  
  /* Size styles */
  ${({ $size }) => getSizeStyles($size)}
  
  /* Icon spacing */
  ${({ $hasIcon, theme }) => $hasIcon && css`
    padding-left: ${theme.spacing[10]};
  `}
  
  /* Placeholder styles */
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
    opacity: 1;
  }
  
  /* Focus styles */
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.text.accent};
    background: ${({ theme }) => theme.colors.glass.surfaceHover};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.text.accent}20;
  }
  
  /* Hover styles */
  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.glass.borderHover};
    background: ${({ theme }) => theme.colors.glass.surfaceHover};
  }
  
  /* Disabled styles */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.background.secondary};
  }
  
  /* Error styles */
  ${({ $hasError, theme }) => $hasError && css`
    border-color: ${theme.colors.status.shoot};
    
    &:focus {
      border-color: ${theme.colors.status.shoot};
      box-shadow: 0 0 0 3px ${theme.colors.status.shoot}20;
    }
  `}
`;

const IconWrapper = styled.div<{ $size: string }>`
  position: absolute;
  left: ${({ theme }) => theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.muted};
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  
  svg {
    width: ${({ $size }) => {
      const sizes = { sm: '16px', md: '18px', lg: '20px' };
      return sizes[$size] || '18px';
    }};
    height: ${({ $size }) => {
      const sizes = { sm: '16px', md: '18px', lg: '20px' };
      return sizes[$size] || '18px';
    }};
  }
`;

const ErrorMessage = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  margin-top: ${({ theme }) => theme.spacing[1]};
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.status.shoot};
  
  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled = false,
  error,
  icon,
  fullWidth = true,
  size = 'md',
  className,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const motionProps = {
    whileFocus: { scale: 1.01 },
    transition: { type: "spring", stiffness: 300, damping: 20 }
  };

  return (
    <InputContainer $fullWidth={fullWidth} className={className}>
      {label && (
        <Label style={{ 
          color: isFocused ? 'var(--text-accent)' : undefined 
        }}>
          {label}
        </Label>
      )}
      
      <div style={{ position: 'relative' }}>
        {icon && (
          <IconWrapper $size={size}>
            {icon}
          </IconWrapper>
        )}
        
        <StyledInput
          $hasIcon={!!icon}
          $hasError={!!error}
          $size={size}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...motionProps}
          {...props}
        />
      </div>
      
      {error && (
        <ErrorMessage
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          {error}
        </ErrorMessage>
      )}
    </InputContainer>
  );
};

export default Input;
