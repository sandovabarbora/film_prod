// src/components/ui/Card/Card.tsx - Cinema Grade Cards
import React, { ReactNode, HTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

type CardVariant = 'default' | 'glass' | 'elevated' | 'gradient' | 'neon';
type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
  clickable?: boolean;
  glow?: boolean;
  children: ReactNode;
}

export function Card({
  variant = 'default',
  padding = 'lg',
  hover = false,
  clickable = false,
  glow = false,
  children,
  className = '',
  ...props
}: CardProps) {
  const cardClass = `
    ${className}
    ${glow ? 'glow' : ''}
    ${hover ? 'interactive' : ''}
  `.trim();

  return (
    <StyledCard
      variant={variant}
      padding={padding}
      hover={hover}
      clickable={clickable}
      className={cardClass}
      {...props}
    >
      <CardContent>
        {children}
      </CardContent>
      {variant === 'neon' && <NeonBorder />}
    </StyledCard>
  );
}

// Card sub-components with enhanced styling
interface CardHeaderProps {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  gradient?: boolean;
}

export function CardHeader({ children, action, className, gradient = false }: CardHeaderProps) {
  return (
    <StyledCardHeader className={className} gradient={gradient}>
      <CardHeaderContent>{children}</CardHeaderContent>
      {action && <CardHeaderAction>{action}</CardHeaderAction>}
    </StyledCardHeader>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <StyledCardContent className={className}>
      {children}
    </StyledCardContent>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
}

export function CardFooter({ children, className, gradient = false }: CardFooterProps) {
  return (
    <StyledCardFooter className={className} gradient={gradient}>
      {children}
    </StyledCardFooter>
  );
}

// Glass Card variant
export function GlassCard(props: Omit<CardProps, 'variant'>) {
  return <Card variant="glass" hover {...props} />;
}

// Elevated Card variant
export function ElevatedCard(props: Omit<CardProps, 'variant'>) {
  return <Card variant="elevated" hover {...props} />;
}

// Gradient Card variant
export function GradientCard(props: Omit<CardProps, 'variant'>) {
  return <Card variant="gradient" glow {...props} />;
}

// Styled components
const getVariantStyles = (variant: CardVariant) => {
  const variants = {
    default: css`
      background: ${props => props.theme.colors.surface};
      border: 1px solid ${props => props.theme.colors.border};
      box-shadow: ${props => props.theme.shadows.sm};
    `,
    
    glass: css`
      background: ${props => props.theme.glass.light.background};
      backdrop-filter: ${props => props.theme.glass.light.backdrop};
      border: 1px solid ${props => props.theme.glass.light.border};
      box-shadow: ${props => props.theme.shadows.glassSm};
    `,
    
    elevated: css`
      background: ${props => props.theme.colors.surface};
      border: 1px solid ${props => props.theme.colors.border};
      box-shadow: ${props => props.theme.shadows.xl};
    `,
    
    gradient: css`
      background: ${props => props.theme.colors.gradients.card};
      backdrop-filter: ${props => props.theme.glass.medium.backdrop};
      border: 1px solid ${props => props.theme.glass.medium.border};
      box-shadow: ${props => props.theme.shadows.glass};
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: ${props => props.theme.colors.gradients.sunset};
      }
    `,

    neon: css`
      background: ${props => props.theme.colors.surface};
      border: 2px solid ${props => props.theme.colors.primary};
      box-shadow: 
        ${props => props.theme.shadows.lg},
        inset 0 0 20px ${props => props.theme.colors.primary}10,
        0 0 20px ${props => props.theme.colors.primary}20;
      position: relative;
    `,
  };

  return variants[variant];
};

const getPaddingStyles = (padding: CardPadding) => {
  const paddings = {
    none: css`padding: 0;`,
    sm: css`padding: ${props => props.theme.spacing.md};`,
    md: css`padding: ${props => props.theme.spacing.lg};`,
    lg: css`padding: ${props => props.theme.spacing.xl};`,
    xl: css`padding: ${props => props.theme.spacing['2xl']};`,
  };

  return paddings[padding];
};

const StyledCard = styled.div<{
  variant: CardVariant;
  padding: CardPadding;
  hover: boolean;
  clickable: boolean;
}>`
  border-radius: ${props => props.theme.borderRadius['2xl']};
  transition: all ${props => props.theme.transitions.normal};
  overflow: hidden;
  position: relative;
  
  ${props => getVariantStyles(props.variant)}
  
  ${props => props.hover && css`
    &:hover {
      transform: translateY(-6px) scale(1.02);
      box-shadow: ${props => props.theme.shadows['2xl']};
    }
  `}
  
  ${props => props.clickable && css`
    cursor: pointer;
    user-select: none;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: ${props => props.theme.shadows.xl};
    }
    
    &:active {
      transform: translateY(-2px);
      transition: all ${props => props.theme.transitions.fast};
    }
  `}

  /* Glow effect */
  &.glow {
    animation: cardGlow 3s ease-in-out infinite;
  }

  @keyframes cardGlow {
    0%, 100% { 
      box-shadow: ${props => props.theme.shadows.lg}; 
    }
    50% { 
      box-shadow: 
        ${props => props.theme.shadows.xl},
        0 0 30px ${props => props.theme.colors.primary}20; 
    }
  }
`;

const CardContent = styled.div<{}>`
  ${props => getPaddingStyles('lg')}
  position: relative;
  z-index: 2;
`;

const StyledCardHeader = styled.div<{ gradient: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.lg};
  padding-bottom: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  position: relative;

  ${props => props.gradient && css`
    background: ${props => props.theme.colors.gradients.glass};
    margin: -${props => props.theme.spacing.xl} -${props => props.theme.spacing.xl} ${props => props.theme.spacing.lg};
    padding: ${props => props.theme.spacing.xl};
    border-bottom: 1px solid ${props => props.theme.colors.borderAccent};
  `}
`;

const CardHeaderContent = styled.div`
  flex: 1;
  min-width: 0;
  
  h1, h2, h3, h4, h5, h6 {
    margin: 0 0 ${props => props.theme.spacing.xs} 0;
    color: ${props => props.theme.colors.text};
  }
  
  p {
    margin: 0;
    color: ${props => props.theme.colors.textSecondary};
    font-size: ${props => props.theme.typography.fontSize.sm};
  }
`;

const CardHeaderAction = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-left: ${props => props.theme.spacing.lg};
`;

const StyledCardContent = styled.div`
  /* Content spacing handled by parent Card padding */
`;

const StyledCardFooter = styled.div<{ gradient: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${props => props.theme.spacing.lg};
  padding-top: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border};
  
  /* If only one child, right-align it */
  &:has(:only-child) {
    justify-content: flex-end;
  }

  ${props => props.gradient && css`
    background: ${props => props.theme.colors.gradients.glass};
    margin: ${props => props.theme.spacing.lg} -${props => props.theme.spacing.xl} -${props => props.theme.spacing.xl};
    padding: ${props => props.theme.spacing.xl};
    border-top: 1px solid ${props => props.theme.colors.borderAccent};
  `}
`;

const NeonBorder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: ${props => props.theme.borderRadius['2xl']};
  border: 2px solid ${props => props.theme.colors.primary};
  pointer-events: none;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: ${props => props.theme.borderRadius['2xl']};
    background: ${props => props.theme.colors.gradients.sunset};
    opacity: 0.3;
    filter: blur(4px);
    z-index: -1;
  }
`;

export default Card;
