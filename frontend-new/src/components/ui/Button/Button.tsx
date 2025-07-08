// src/components/ui/Button/Button.tsx - Cinema Grade Buttons
import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { ButtonLoading } from '../../common/Loading';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'gradient';
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
      {isLoading && <LoadingWrapper><ButtonLoading /></LoadingWrapper>}
      {!isLoading && leftIcon && <IconWrapper position="left">{leftIcon}</IconWrapper>}
      <ContentWrapper isLoading={isLoading}>
        {children}
      </ContentWrapper>
      {!isLoading && rightIcon && <IconWrapper position="right">{rightIcon}</IconWrapper>}
      {shimmer && <ShimmerEffect />}
    </StyledButton>
  );
}

// Specialized variants
export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="primary" {...props} />;
}

export function GlassButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="glass" shimmer {...props} />;
}

export function GradientButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="gradient" glow {...props} />;
}

export function OutlineButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="outline" {...props} />;
}

export function GhostButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="ghost" {...props} />;
}

// Styled components
const getVariantStyles = (variant: ButtonVariant) => {
  const variants = {
    primary: css`
      background: ${props => props.theme.colors.primary};
      color: white;
      border: 2px solid ${props => props.theme.colors.primary};

      &:hover:not(:disabled) {
        background: ${props => props.theme.colors.primaryDark};
        border-color: ${props => props.theme.colors.primaryDark};
        transform: translateY(-3px);
        box-shadow: ${props => props.theme.shadows.primary};
      }

      &:active:not(:disabled) {
        transform: translateY(-1px);
      }
    `,

    secondary: css`
      background: ${props => props.theme.colors.secondary};
      color: white;
      border: 2px solid ${props => props.theme.colors.secondary};

      &:hover:not(:disabled) {
        background: ${props => props.theme.colors.secondaryDark};
        border-color: ${props => props.theme.colors.secondaryDark};
        transform: translateY(-3px);
        box-shadow: ${props => props.theme.shadows.secondary};
      }
    `,

    outline: css`
      background: transparent;
      color: ${props => props.theme.colors.primary};
      border: 2px solid ${props => props.theme.colors.primary};

      &:hover:not(:disabled) {
        background: ${props => props.theme.colors.primary};
        color: white;
        transform: translateY(-3px);
        box-shadow: ${props => props.theme.shadows.primary};
      }
    `,

    ghost: css`
      background: transparent;
      color: ${props => props.theme.colors.text};
      border: 2px solid transparent;

      &:hover:not(:disabled) {
        background: ${props => props.theme.colors.surfaceHover};
        border-color: ${props => props.theme.colors.border};
        transform: translateY(-2px);
      }
    `,

    glass: css`
      background: ${props => props.theme.glass.light.background};
      backdrop-filter: ${props => props.theme.glass.light.backdrop};
      color: ${props => props.theme.colors.text};
      border: 2px solid ${props => props.theme.glass.light.border};

      &:hover:not(:disabled) {
        background: ${props => props.theme.glass.medium.background};
        backdrop-filter: ${props => props.theme.glass.medium.backdrop};
        border-color: ${props => props.theme.colors.primary};
        transform: translateY(-4px);
        box-shadow: ${props => props.theme.shadows.glassSm};
      }
    `,

    gradient: css`
      background: ${props => props.theme.colors.gradients.sunset};
      color: white;
      border: 2px solid transparent;
      position: relative;
      overflow: hidden;

      &:hover:not(:disabled) {
        background: ${props => props.theme.colors.gradients.ocean};
        transform: translateY(-4px) scale(1.02);
        box-shadow: ${props => props.theme.shadows.glow};
      }

      &.glow {
        animation: glow 2s ease-in-out infinite;
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
      font-size: ${props => props.theme.typography.fontSize.base};
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

const StyledButton = styled.button<{
  variant: ButtonVariant;
  size: ButtonSize;
  fullWidth: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.md};
  
  font-family: ${props => props.theme.typography.fontFamily.sans};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  line-height: 1;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  
  cursor: pointer;
  user-select: none;
  position: relative;
  overflow: hidden;
  
  transition: all ${props => props.theme.transitions.normal};
  
  ${props => getVariantStyles(props.variant)}
  ${props => getSizeStyles(props.size)}
  
  ${props => props.fullWidth && css`
    width: 100%;
  `}

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}40;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  /* Shimmer effect */
  &.shimmer::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 255, 255, 0.4), 
      transparent
    );
    transition: left 0.6s;
  }

  &.shimmer:hover::before {
    left: 100%;
  }

  /* Glow animation */
  &.glow {
    animation: glow 2s ease-in-out infinite;
  }

  @keyframes glow {
    0%, 100% { 
      box-shadow: 0 0 5px ${props => props.theme.colors.primary}40; 
    }
    50% { 
      box-shadow: 0 0 30px ${props => props.theme.colors.primary}80,
                  0 0 60px ${props => props.theme.colors.primary}40; 
    }
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`;

const ContentWrapper = styled.span<{ isLoading: boolean }>`
  opacity: ${props => props.isLoading ? 0 : 1};
  transition: opacity ${props => props.theme.transitions.fast};
`;

const IconWrapper = styled.span<{ position: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  
  ${props => props.position === 'left' && css`
    margin-right: ${props => props.theme.spacing.xs};
  `}
  
  ${props => props.position === 'right' && css`
    margin-left: ${props => props.theme.spacing.xs};
  `}
`;

const ShimmerEffect = styled.div`
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.3), 
    transparent
  );
  pointer-events: none;
`;

export default Button;
