// src/components/ui/Card.tsx - Cinema-Grade Card
import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

interface CardProps {
  variant?: 'default' | 'glass' | 'solid' | 'minimal';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  glow?: boolean;
}

const getVariantStyles = (variant: string) => {
  const variants = {
    default: css`
      background: ${({ theme }) => theme.colors.glass.surface};
      backdrop-filter: ${({ theme }) => theme.cinema.backdrop.light};
      border: 1px solid ${({ theme }) => theme.colors.glass.border};
    `,
    
    glass: css`
      background: ${({ theme }) => theme.colors.glass.surfaceHover};
      backdrop-filter: ${({ theme }) => theme.cinema.backdrop.medium};
      border: 1px solid ${({ theme }) => theme.colors.glass.borderHover};
    `,
    
    solid: css`
      background: ${({ theme }) => theme.colors.background.surface};
      border: 1px solid ${({ theme }) => theme.colors.cinema.steel};
    `,
    
    minimal: css`
      background: transparent;
      border: 1px solid ${({ theme }) => theme.colors.glass.border};
    `,
  };

  return variants[variant] || variants.default;
};

const getPaddingStyles = (padding: string) => {
  const paddings = {
    sm: css`padding: ${({ theme }) => theme.spacing[4]};`,
    md: css`padding: ${({ theme }) => theme.spacing[6]};`,
    lg: css`padding: ${({ theme }) => theme.spacing[8]};`,
    xl: css`padding: ${({ theme }) => theme.spacing[10]};`,
  };

  return paddings[padding] || paddings.md;
};

const StyledCard = styled(motion.div)<{
  $variant: string;
  $padding: string;
  $isClickable: boolean;
  $hover: boolean;
  $glow: boolean;
}>`
  position: relative;
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  transition: ${({ theme }) => theme.transitions.cinema};
  overflow: hidden;
  
  /* Variant styles */
  ${({ $variant }) => getVariantStyles($variant)}
  
  /* Padding styles */
  ${({ $padding }) => getPaddingStyles($padding)}
  
  /* Clickable styles */
  ${({ $isClickable }) => $isClickable && css`
    cursor: pointer;
  `}
  
  /* Hover effects */
  ${({ $hover, theme }) => $hover && css`
    &:hover {
      transform: translateY(-4px);
      background: ${theme.colors.glass.surfaceHover};
      border-color: ${theme.colors.glass.borderHover};
      box-shadow: ${theme.shadows.cinema};
    }
  `}
  
  /* Glow effect */
  ${({ $glow, theme }) => $glow && css`
    box-shadow: ${theme.shadows.glow};
    
    &:hover {
      box-shadow: ${theme.shadows.glowHover};
    }
  `}
  
  /* Cinema shine effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.6s;
    pointer-events: none;
  }
  
  ${({ $hover }) => $hover && css`
    &:hover::before {
      left: 100%;
    }
  `}
`;

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  className,
  onClick,
  hover = false,
  glow = false,
  ...props
}) => {
  const motionProps = {
    whileHover: hover ? { scale: 1.02 } : {},
    whileTap: onClick ? { scale: 0.98 } : {},
    transition: { type: "spring", stiffness: 300, damping: 20 }
  };

  return (
    <StyledCard
      $variant={variant}
      $padding={padding}
      $isClickable={!!onClick}
      $hover={hover}
      $glow={glow}
      onClick={onClick}
      className={className}
      {...motionProps}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

export default Card;
