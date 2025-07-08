// src/components/ui/Button/Button.tsx - Cinema Grade Buttons
import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import styled, { css } from 'styled-components';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'gradient' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  glow?: boolean;
  shimmer?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  glow = false,
  shimmer = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const buttonClass = `
    ${className}
    ${shimmer ? 'shimmer' : ''}
    ${glow ? 'glow' : ''}
  `.trim();

  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || isLoading}
      className={buttonClass}
      {...props}
    >
      {isLoading && <LoadingWrapper><LoadingSpinner /></LoadingWrapper>}
      {!isLoading && leftIcon && <IconWrapper position="left">{leftIcon}</IconWrapper>}
      <ContentWrapper isLoading={isLoading}>
        {children}
      </ContentWrapper>
      {!isLoading && rightIcon && <IconWrapper position="right">{rightIcon}</IconWrapper>}
      {shimmer && <ShimmerEffect />}
    </StyledButton>
  );
}

// Specialized variant functions
export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="primary" {...props} />;
}

export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="secondary" {...props} />;
}

export function DangerButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="danger" {...props} />;
}

export function OutlineButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="outline" {...props} />;
}

export function GhostButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="ghost" {...props} />;
}

export function GlassButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="glass" shimmer {...props} />;
}

export function GradientButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="gradient" glow {...props} />;
}

// Styled components helpers
const getVariantStyles = (variant: ButtonVariant) => {
  const variants = {
    primary: css`
      background: ${props => props.theme.colors.primary};
      color: white;
      border: 2px solid ${props => props.theme.colors.primary};

      &:hover:not(:disabled) {
        background: ${props => props.theme.colors.primaryDark || props.theme.colors.primary};
        border-color: ${props => props.theme.colors.primaryDark || props.theme.colors.primary};
        transform: translateY(-3px);
        box-shadow: ${props => props.theme.shadows.lg};
      }

      &:active:not(:disabled) {
        transform: translateY(-1px);
      }
    `,

    secondary: css`
      background: ${props => props.theme.colors.surface};
      color: ${props => props.theme.colors.text};
      border: 2px solid ${props => props.theme.colors.border};

      &:hover:not(:disabled) {
        background: ${props => props.theme.colors.background};
        border-color: ${props => props.theme.colors.primary};
        transform: translateY(-2px);
        box-shadow: ${props => props.theme.shadows.md};
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,

    outline: css`
      background: transparent;
      color: ${props => props.theme.colors.primary};
      border: 2px solid ${props => props.theme.colors.primary};

      &:hover:not(:disabled) {
        background: ${props => props.theme.colors.primary};
        color: white;
        transform: translateY(-2px);
        box-shadow: ${props => props.theme.shadows.md};
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,

    ghost: css`
      background: transparent;
      color: ${props => props.theme.colors.text};
      border: 2px solid transparent;

      &:hover:not(:disabled) {
        background: ${props => props.theme.colors.surface};
        color: ${props => props.theme.colors.primary};
        transform: translateY(-1px);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,

    glass: css`
      background: ${props => props.theme.glass?.light?.background || 'rgba(255, 255, 255, 0.1)'};
      backdrop-filter: blur(10px);
      color: ${props => props.theme.colors.text};
      border: 2px solid ${props => props.theme.glass?.light?.border || 'rgba(255, 255, 255, 0.2)'};

      &:hover:not(:disabled) {
        background: ${props => props.theme.glass?.medium?.background || 'rgba(255, 255, 255, 0.2)'};
        transform: translateY(-3px);
        box-shadow: ${props => props.theme.shadows.xl};
      }

      &.shimmer::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: shimmer 2s infinite;
      }
    `,

    gradient: css`
      background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
      color: white;
      border: 2px solid transparent;
      position: relative;
      overflow: hidden;

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${props => props.theme.colors.secondary}, ${props => props.theme.colors.primary});
        transform: translateY(-4px) scale(1.02);
        box-shadow: ${props => props.theme.shadows.xl};
      }

      &.glow {
        animation: glow 2s ease-in-out infinite;
      }
    `,

    danger: css`
      background: ${props => props.theme.colors.error};
      color: white;
      border: 2px solid ${props => props.theme.colors.error};

      &:hover:not(:disabled) {
        background: #dc2626;
        border-color: #dc2626;
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,
  };

  return variants[variant];
};

const getSizeStyles = (size: ButtonSize) => {
  const sizes = {
    sm: css`
      padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
      font-size: ${props => props.theme.typography.fontSize.sm};
      min-height: 36px;
      border-radius: ${props => props.theme.borderRadius.lg};
    `,
    md: css`
      padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
      font-size: ${props => props.theme.typography.fontSize.base || props.theme.typography.fontSize.md};
      min-height: 44px;
      border-radius: ${props => props.theme.borderRadius.xl};
    `,
    lg: css`
      padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing['2xl']};
      font-size: ${props => props.theme.typography.fontSize.lg};
      min-height: 52px;
      border-radius: ${props => props.theme.borderRadius['2xl']};
    `,
    xl: css`
      padding: ${props => props.theme.spacing.xl} ${props => props.theme.spacing['3xl']};
      font-size: ${props => props.theme.typography.fontSize.xl};
      min-height: 60px;
      border-radius: ${props => props.theme.borderRadius['2xl']};
    `,
  };

  return sizes[size];
};

// Main styled components
const StyledButton = styled.button<{
  variant: ButtonVariant;
  size: ButtonSize;
  fullWidth: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  font-family: ${props => props.theme.typography.fontFamily.sans};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  transition: all ${props => props.theme.transitions.normal};
  cursor: pointer;
  user-select: none;
  position: relative;
  overflow: hidden;
  
  ${props => getVariantStyles(props.variant)}
  ${props => getSizeStyles(props.size)}
  
  ${props => props.fullWidth && css`
    width: 100%;
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  &:focus {
    outline: none;
    ring: 2px solid ${props => props.theme.colors.primary}40;
  }

  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }

  @keyframes glow {
    0%, 100% { 
      box-shadow: ${props => props.theme.shadows.lg}; 
    }
    50% { 
      box-shadow: 
        ${props => props.theme.shadows.xl},
        0 0 30px ${props => props.theme.colors.primary}40; 
    }
  }
`;

const LoadingWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ContentWrapper = styled.span<{ isLoading: boolean }>`
  opacity: ${props => props.isLoading ? 0 : 1};
  transition: opacity ${props => props.theme.transitions.fast};
`;

const IconWrapper = styled.span<{ position: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1em;
`;

const ShimmerEffect = styled.div`
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
  pointer-events: none;
`;

export default Button;
