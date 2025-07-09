import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// 📊 MetricCard - Exact copy from Dashboard
export const MetricCard = styled(motion.div)<{ $accent?: string }>`
  background: ${({ theme }) => theme.colors.glass.surface};
  backdrop-filter: ${({ theme }) => theme.cinema.backdrop.light};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  padding: ${({ theme }) => theme.spacing[6]};
  position: relative;
  overflow: hidden;
  transition: ${({ theme }) => theme.transitions.cinema};
  
  &:hover {
    background: ${({ theme }) => theme.colors.glass.surfaceHover};
    border-color: ${({ theme }) => theme.colors.text.accent};
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.cinema};
  }
  
  /* JetBrains-style accent indicator */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${({ $accent, theme }) => $accent || theme.colors.text.accent};
  }
`;

export const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

export const MetricIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  background: ${({ theme }) => theme.colors.text.accent}15;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.accent};
`;

export const MetricNumber = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
  line-height: 1;
`;

export const MetricLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
`;

export const MetricChange = styled.span<{ $positive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ $positive, theme }) => 
    $positive ? theme.colors.text.success : theme.colors.text.danger
  };
`;

// 🏆 HeroStatItem - Dashboard hero stats
export const HeroStatItem = styled(motion.div)`
  background: ${({ theme }) => theme.colors.glass.surface};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  transition: ${({ theme }) => theme.transitions.cinema};
  
  &:hover {
    background: ${({ theme }) => theme.colors.glass.surfaceHover};
    border-color: ${({ theme }) => theme.colors.text.accent};
    transform: translateY(-2px);
  }
`;

export const HeroStatIcon = styled.div`
  color: ${({ theme }) => theme.colors.text.accent};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

export const HeroStatValue = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const HeroStatLabel = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

// 📱 Responsive Grids
export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
`;

export const HeroStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
`;

// 🎬 Page Layout Components
export const PageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing[8]};
  max-width: 1400px;
  margin: 0 auto;
`;

export const PageHeader = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const PageSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

export const ControlsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[4]};
`;

// 🎨 Content Cards - Like dashboard project cards
export const ContentCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.glass.surface};
  backdrop-filter: ${({ theme }) => theme.cinema.backdrop.light};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  padding: ${({ theme }) => theme.spacing[6]};
  position: relative;
  overflow: hidden;
  transition: ${({ theme }) => theme.transitions.cinema};
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.glass.surfaceHover};
    border-color: ${({ theme }) => theme.colors.glass.borderHover};
    transform: translateY(-6px);
    box-shadow: ${({ theme }) => theme.shadows.cinema};
  }
  
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
  
  &:hover::before {
    left: 100%;
  }
`;

export const ContentCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

export const ContentCardTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
  flex: 1;
`;

export const ContentCardFooter = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding-top: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid ${({ theme }) => theme.colors.glass.border};
`;

// 🎯 Status Badge - Dashboard style
export const StatusBadge = styled.span<{ $status: string }>`
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[3]};
  border-radius: 9999px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${({ $status }) => {
    switch ($status) {
      case 'development':
        return `
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
        `;
      case 'pre_production':
        return `
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.3);
        `;
      case 'production':
        return `
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        `;
      case 'post_production':
        return `
          background: rgba(139, 92, 246, 0.2);
          color: #a78bfa;
          border: 1px solid rgba(139, 92, 246, 0.3);
        `;
      case 'completed':
        return `
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.3);
        `;
      default:
        return `
          background: rgba(107, 114, 128, 0.2);
          color: #9ca3af;
          border: 1px solid rgba(107, 114, 128, 0.3);
        `;
    }
  }}
`;

// 🔍 Search Input - Dashboard style
export const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  padding-left: ${({ theme }) => theme.spacing[10]};
  background: ${({ theme }) => theme.colors.glass.surface};
  backdrop-filter: ${({ theme }) => theme.cinema.backdrop.light};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  transition: ${({ theme }) => theme.transitions.cinema};
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.text.accent};
    background: ${({ theme }) => theme.colors.glass.surfaceHover};
  }
`;

export const SearchIcon = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.muted};
  display: flex;
  align-items: center;
  justify-content: center;
`;
