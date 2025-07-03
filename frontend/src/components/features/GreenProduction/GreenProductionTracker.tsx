import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const GreenContainer = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const EcoCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.gray[900]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.xl};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      ${({ theme }) => theme.colors.status.success},
      ${({ theme }) => theme.colors.accent.main}
    );
  }
`;

const EcoScore = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.status.success}20;
  border: 3px solid ${({ theme }) => theme.colors.status.success};
  margin: 0 auto ${({ theme }) => theme.spacing.lg};
  
  .score {
    font-size: ${({ theme }) => theme.sizes.h2};
    font-weight: 700;
    color: ${({ theme }) => theme.colors.status.success};
  }
  
  .label {
    font-size: ${({ theme }) => theme.sizes.small};
    color: ${({ theme }) => theme.colors.gray[500]};
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const MetricCard = styled.div`
  background: ${({ theme }) => theme.colors.gray[850]};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: 8px;
  text-align: center;
  
  .icon {
    font-size: ${({ theme }) => theme.sizes.h4};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }
  
  .value {
    font-size: ${({ theme }) => theme.sizes.h5};
    font-weight: 700;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }
  
  .label {
    font-size: ${({ theme }) => theme.sizes.small};
    color: ${({ theme }) => theme.colors.gray[500]};
  }
`;

const RecommendationList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Recommendation = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.gray[850]};
  border-radius: 8px;
  align-items: center;
  
  .icon {
    width: 40px;
    height: 40px;
    background: ${({ theme }) => theme.colors.status.success}20;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .content {
    flex: 1;
    
    .title {
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .description {
      font-size: ${({ theme }) => theme.sizes.small};
      color: ${({ theme }) => theme.colors.gray[500]};
    }
  }
  
  .impact {
    text-align: right;
    
    .savings {
      font-weight: 700;
      color: ${({ theme }) => theme.colors.status.success};
    }
    
    .co2 {
      font-size: ${({ theme }) => theme.sizes.small};
      color: ${({ theme }) => theme.colors.gray[500]};
    }
  }
`;

export const GreenProductionTracker: React.FC = () => {
  const ecoScore = 78;
  
  const metrics = [
    { icon: '♻️', value: '2.3 tons', label: 'CO2 Saved' },
    { icon: '💡', value: '45%', label: 'Renewable Energy' },
    { icon: '🚗', value: '89%', label: 'Carpooling Rate' },
    { icon: '🗑️', value: '73%', label: 'Waste Recycled' },
    { icon: '💧', value: '1,200L', label: 'Water Saved' },
    { icon: '🌱', value: '156', label: 'Trees Planted' },
  ];

  const recommendations = [
    {
      icon: '🚐',
      title: 'Optimize Transportation Routes',
      description: 'Combine crew pickups from similar locations',
      savings: '$1,200',
      co2: '0.5 tons CO2'
    },
    {
      icon: '☀️',
      title: 'Use Natural Lighting',
      description: 'Scenes 45-48 can utilize golden hour lighting',
      savings: '$800',
      co2: '0.3 tons CO2'
    },
    {
      icon: '🍱',
      title: 'Switch to Eco Catering',
      description: 'Local, plant-based options for 2 days/week',
      savings: '$500',
      co2: '0.2 tons CO2'
    },
  ];

  return (
    <GreenContainer>
      <EcoCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Green Production Score
        </h3>
        
        <EcoScore>
          <div>
            <div className="score">{ecoScore}</div>
            <div className="label">Eco Score</div>
          </div>
        </EcoScore>

        <MetricsGrid>
          {metrics.map((metric, index) => (
            <MetricCard key={index}>
              <div className="icon">{metric.icon}</div>
              <div className="value">{metric.value}</div>
              <div className="label">{metric.label}</div>
            </MetricCard>
          ))}
        </MetricsGrid>

        <h4 style={{ marginBottom: '1rem' }}>AI Recommendations</h4>
        <RecommendationList>
          {recommendations.map((rec, index) => (
            <Recommendation key={index}>
              <div className="icon">{rec.icon}</div>
              <div className="content">
                <div className="title">{rec.title}</div>
                <div className="description">{rec.description}</div>
              </div>
              <div className="impact">
                <div className="savings">{rec.savings}</div>
                <div className="co2">{rec.co2}</div>
              </div>
            </Recommendation>
          ))}
        </RecommendationList>
      </EcoCard>
    </GreenContainer>
  );
};
