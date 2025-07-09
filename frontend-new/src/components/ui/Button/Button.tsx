import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import styled, { css } from 'styled-components';

// ✅ Use $ prefix for styled-components props to avoid DOM forwarding
interface StyledButtonProps {
  $variant: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glass' | 'gradient';
  $size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  $fullWidth: boolean;
  $isLoading: boolean;
  $glow: boolean;
  $shimmer: boolean;
}

const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
  border: none;
  border-radius: ${({ theme }) => theme?.borderRadius?.md || '0.375rem'};
  font-family: inherit;
  font-weight: ${({ theme }) => theme?.typography?.weights?.medium || theme?.typography?.fontWeight?.medium || 500};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  outline: none;
  
  /* Size variants */
  ${({ $size }) => {
    switch ($size) {
      case 'xs':
        return css`
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          min-height: 28px;
        `;
      case 'sm':
        return css`
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          min-height: 36px;
        `;
      case 'md':
        return css`
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          min-height: 40px;
        `;
      case 'lg':
        return css`
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          min-height: 48px;
        `;
      case 'xl':
        return css`
          padding: 1rem 2rem;
          font-size: 1.125rem;
          min-height: 56px;
        `;
      default:
        return css`
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          min-height: 40px;
        `;
    }
  }}
  
  /* Color variants */
  ${({ $variant, theme }) => {
    const colors = {
      primary: {
        bg: theme?.colors?.accent?.primary || theme?.colors?.primary || '#3182ce',
        hover: theme?.colors?.accent?.dark || theme?.colors?.primaryDark || '#2c5282',
        text: '#ffffff',
        border: theme?.colors?.accent?.primary || theme?.colors?.primary || '#3182ce'
      },
      secondary: {
        bg: theme?.colors?.surface?.elevated || '#f7fafc',
        hover: theme?.colors?.surface?.hover || '#edf2f7',
        text: theme?.colors?.text?.primary || '#1a202c',
        border: theme?.colors?.border?.primary || '#e2e8f0'
      },
      outline: {
        bg: 'transparent',
        hover: theme?.colors?.surface?.elevated || '#f7fafc',
        text: theme?.colors?.text?.primary || '#1a202c',
        border: theme?.colors?.border?.primary || '#e2e8f0'
      },
      danger: {
        bg: theme?.colors?.error?.primary || '#e53e3e',
        hover: theme?.colors?.error?.dark || '#c53030',
        text: '#ffffff',
        border: theme?.colors?.error?.primary || '#e53e3e'
      },
      ghost: {
        bg: 'transparent',
        hover: theme?.colors?.surface?.elevated || 'rgba(0, 0, 0, 0.05)',
        text: theme?.colors?.text?.primary || '#1a202c',
        border: 'transparent'
      },
      glass: {
        bg: 'rgba(255, 255, 255, 0.1)',
        hover: 'rgba(255, 255, 255, 0.2)',
        text: theme?.colors?.text?.primary || '#1a202c',
        border: 'rgba(255, 255, 255, 0.2)'
      },
      gradient: {
        bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        hover: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
        text: '#ffffff',
        border: 'transparent'
      }
    };
    
    const color = colors[$variant] || colors.primary;
    
    return css`
      background: ${color.bg};
      color: ${color.text};
      border: 1px solid ${color.border};
      
      &:hover:not(:disabled) {
        background: ${color.hover};
        transform: translateY(-1px);
        box-shadow: ${theme?.shadows?.md || '0 4px 6px -1px rgba(0, 0, 0, 0.1)'};
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `;
  }}
  
  /* Full width */
  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}
  
  /* Loading state */
  ${({ $isLoading }) => $isLoading && css`
    pointer-events: none;
    opacity: 0.7;
  `}
  
  /* Glow effect */
  ${({ $glow, theme }) => $glow && css`
    box-shadow: 0 0 20px ${theme?.colors?.accent?.primary || '#3182ce'}40;
    animation: glow 2s ease-in-out infinite alternate;
    
    @keyframes glow {
      from { box-shadow: 0 0 20px ${theme?.colors?.accent?.primary || '#3182ce'}40; }
      to { box-shadow: 0 0 30px ${theme?.colors?.accent?.primary || '#3182ce'}60; }
    }
  `}
  
  /* Shimmer effect */
  ${({ $shimmer }) => $shimmer && css`
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      animation: shimmer 2s infinite;
    }
    
    @keyframes shimmer {
      0% { left: -100%; }
      100% { left: 100%; }
    }
  `}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  &:focus-visible {
    box-shadow: 0 0 0 3px ${({ theme, $variant }) => 
      $variant === 'primary' 
        ? theme?.colors?.accent?.muted || 'rgba(49, 130, 206, 0.3)'
        : theme?.colors?.text?.muted || 'rgba(0, 0, 0, 0.1)'
    };
  }
`;

const LoadingSpinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glass' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  glow?: boolean;
  shimmer?: boolean;
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  glow = false,
  shimmer = false,
  children,
  type = 'button',
  disabled,
  ...props
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $isLoading={isLoading}
      $glow={glow}
      $shimmer={shimmer}
      type={type}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <LoadingSpinner />}
      {!isLoading && leftIcon && <span>{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span>{rightIcon}</span>}
    </StyledButton>
  );
};

// ✅ Backward compatibility - wrapper components
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="secondary" {...props} />
);

export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="outline" {...props} />
);

export const DangerButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="danger" {...props} />
);

export const GhostButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="ghost" {...props} />
);

export const GlassButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="glass" shimmer {...props} />
);

export const GradientButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="gradient" glow {...props} />
);
