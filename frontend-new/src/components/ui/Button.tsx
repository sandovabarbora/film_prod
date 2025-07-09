// src/components/ui/Button.tsx - Cinema-Grade Button
import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'golden';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const getVariantStyles = (variant: string) => {
  const variants = {
    primary: css`
      background: ${({ theme }) => theme.colors.gradients.primary};
      color: ${({ theme }) => theme.colors.text.primary};
      border: 1px solid transparent;
      
      &:hover:not(:disabled) {
        box-shadow: ${({ theme }) => theme.shadows.glow};
        transform: translateY(-2px);
      }
    `,
    
    secondary: css`
      background: ${({ theme }) => theme.colors.glass.surface};
      backdrop-filter: ${({ theme }) => theme.cinema.backdrop.light};
      color: ${({ theme }) => theme.colors.text.primary};
      border: 1px solid ${({ theme }) => theme.colors.glass.border};
      
      &:hover:not(:disabled) {
        background: ${({ theme }) => theme.colors.glass.surfaceHover};
        border-color: ${({ theme }) => theme.colors.glass.borderHover};
      }
    `,
    
    ghost: css`
      background: transparent;
      color: ${({ theme }) => theme.colors.text.secondary};
      border: 1px solid transparent;
      
      &:hover:not(:disabled) {
        background: ${({ theme }) => theme.colors.glass.surface};
        color: ${({ theme }) => theme.colors.text.primary};
      }
    `,
    
    danger: css`
      background: ${({ theme }) => theme.colors.gradients.ruby};
      color: ${({ theme }) => theme.colors.text.primary};
      border: 1px solid transparent;
      
      &:hover:not(:disabled) {
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
      }
    `,
    
    success: css`
      background: ${({ theme }) => theme.colors.gradients.emerald};
      color: ${({ theme }) => theme.colors.text.primary};
      border: 1px solid transparent;
      
      &:hover:not(:disabled) {
        box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
      }
    `,
    
    golden: css`
      background: ${({ theme }) => theme.colors.gradients.golden};
      color: ${({ theme }) => theme.colors.cinema.midnight};
      border: 1px solid transparent;
      
      &:hover:not(:disabled) {
        box-shadow: 0 0 20px rgba(234, 179, 8, 0.4);
      }
    `,
  };

  return variants[variant] || variants.primary;
};

const getSizeStyles = (size: string) => {
  const sizes = {
    sm: css`
      padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      border-radius: ${({ theme }) => theme.borderRadius.xl};
      min-height: 36px;
    `,
    
    md: css`
      padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[6]};
      font-size: ${({ theme }) => theme.typography.fontSize.base};
      border-radius: ${({ theme }) => theme.borderRadius['2xl']};
      min-height: 44px;
    `,
    
    lg: css`
      padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[8]};
      font-size: ${({ theme }) => theme.typography.fontSize.lg};
      border-radius: ${({ theme }) => theme.borderRadius['2xl']};
      min-height: 52px;
    `,
    
    xl: css`
      padding: ${({ theme }) => theme.spacing[5]} ${({ theme }) => theme.spacing[10]};
      font-size: ${({ theme }) => theme.typography.fontSize.xl};
      border-radius: ${({ theme }) => theme.borderRadius['3xl']};
      min-height: 60px;
    `,
  };

  return sizes[size] || sizes.md;
};

const StyledButton = styled(motion.button)<{
  $variant: string;
  $size: string;
  $fullWidth: boolean;
}>`
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: ${({ theme }) => theme.typography.lineHeight.none};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.cinema};
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  
  /* Variant styles */
  ${({ $variant }) => getVariantStyles($variant)}
  
  /* Size styles */
  ${({ $size }) => getSizeStyles($size)}
  
  /* Full width */
  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
  
  /* Loading state */
  &[data-loading="true"] {
    color: transparent;
  }
  
  /* Cinema shine effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s;
  }
  
  &:hover:not(:disabled)::before {
    left: 100%;
  }
`;

const LoadingSpinner = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 1em;
    height: 1em;
  }
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  className,
  ...props
}) => {
  const motionProps = {
    whileHover: disabled || loading ? {} : { scale: 1.02 },
    whileTap: disabled || loading ? {} : { scale: 0.98 },
    transition: { type: "spring", stiffness: 300, damping: 20 }
  };

  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      onClick={onClick}
      disabled={disabled || loading}
      data-loading={loading}
      className={className}
      {...motionProps}
      {...props}
    >
      {loading && <LoadingSpinner />}
      
      {icon && !loading && (
        <IconWrapper>
          {icon}
        </IconWrapper>
      )}
      
      {children}
    </StyledButton>
  );
};

export default Button;
