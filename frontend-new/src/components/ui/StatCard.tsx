// src/components/ui/StatCard.tsx - Cinema-Grade Stat Card
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'positive' | 'negative' | 'neutral';
  trendValue?: string | number;
  description?: string;
  className?: string;
  onClick?: () => void;
}

const StatCardContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  cursor: ${props => props.onClick ? 'pointer' : 'default'};
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(103, 126, 234, 0.3);
    transform: translateY(-2px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 12px;
  background: rgba(103, 126, 234, 0.1);
  border: 1px solid rgba(103, 126, 234, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  flex-shrink: 0;
`;

const StatTitle = styled.h3`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: #8b8b8b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.2;
  flex: 1;
  margin-right: 1rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #f9fafb;
  line-height: 1;
  margin-bottom: 0.5rem;
  font-family: 'JetBrains Mono', monospace;
`;

const StatFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const StatTrend = styled.div<{ $trend: 'positive' | 'negative' | 'neutral' }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: ${props => {
    switch (props.$trend) {
      case 'positive': return '#4ade80';
      case 'negative': return '#f87171';
      default: return '#8b8b8b';
    }
  }};
`;

const StatDescription = styled.p`
  margin: 0;
  font-size: 0.75rem;
  color: #8b8b8b;
  line-height: 1.3;
`;

const formatValue = (value: string | number): string => {
  if (typeof value === 'number') {
    // Format large numbers with K/M suffix
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }
  return value;
};

const getTrendIcon = (trend: 'positive' | 'negative' | 'neutral') => {
  switch (trend) {
    case 'positive': return <TrendingUp size={12} />;
    case 'negative': return <TrendingDown size={12} />;
    default: return <Minus size={12} />;
  }
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend = 'neutral',
  trendValue,
  description,
  className,
  onClick
}) => {
  return (
    <StatCardContainer
      className={className}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <StatHeader>
        <StatTitle>{title}</StatTitle>
        {icon && <StatIcon>{icon}</StatIcon>}
      </StatHeader>

      <StatValue>{formatValue(value)}</StatValue>

      <StatFooter>
        {trendValue && (
          <StatTrend $trend={trend}>
            {getTrendIcon(trend)}
            <span>{trendValue}</span>
          </StatTrend>
        )}
        {description && (
          <StatDescription>{description}</StatDescription>
        )}
      </StatFooter>
    </StatCardContainer>
  );
};

export default StatCard;
