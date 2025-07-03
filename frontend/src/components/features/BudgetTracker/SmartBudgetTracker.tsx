import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const BudgetContainer = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const BudgetCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.gray[900]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const BudgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ProgressBar = styled.div`
  height: 12px;
  background: ${({ theme }) => theme.colors.gray[800]};
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ProgressFill = styled(motion.div)<{ percentage: number; status: string }>`
  height: 100%;
  background: ${({ theme, status }) => {
    if (status === 'danger') return theme.colors.status.error;
    if (status === 'warning') return theme.colors.status.warning;
    return theme.colors.status.success;
  }};
  border-radius: 6px;
`;

const BudgetStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.xl} 0;
`;

const StatBox = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.gray[850]};
  border-radius: 8px;
  
  .label {
    color: ${({ theme }) => theme.colors.gray[500]};
    font-size: ${({ theme }) => theme.sizes.small};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }
  
  .value {
    font-size: ${({ theme }) => theme.sizes.h5};
    font-weight: 700;
  }
  
  .value-up {
    color: ${({ theme }) => theme.colors.status.error};
  }
  
  .value-down {
    color: ${({ theme }) => theme.colors.status.success};
  }
  
  .value-neutral {
    color: ${({ theme }) => theme.colors.primary.light};
  }
  
  .trend {
    font-size: ${({ theme }) => theme.sizes.small};
    color: ${({ theme }) => theme.colors.gray[500]};
    margin-top: ${({ theme }) => theme.spacing.xs};
  }
`;

const PredictionAlert = styled(motion.div)<{ severity: 'low' | 'medium' | 'high' }>`
  background: ${({ theme, severity }) => {
    if (severity === 'high') return theme.colors.status.error + '20';
    if (severity === 'medium') return theme.colors.status.warning + '20';
    return theme.colors.status.success + '20';
  }};
  border: 1px solid ${({ theme, severity }) => {
    if (severity === 'high') return theme.colors.status.error;
    if (severity === 'medium') return theme.colors.status.warning;
    return theme.colors.status.success;
  }};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  .title {
    font-weight: 600;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
  }
  
  .content {
    font-size: ${({ theme }) => theme.sizes.small};
    line-height: 1.6;
  }
`;

const DepartmentGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const DepartmentRow = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr auto auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.gray[850]};
  border-radius: 8px;
  
  .name {
    font-weight: 500;
  }
  
  .bar {
    height: 8px;
    background: ${({ theme }) => theme.colors.gray[700]};
    border-radius: 4px;
    overflow: hidden;
    
    .fill {
      height: 100%;
      background: ${({ theme }) => theme.colors.accent.main};
      transition: width ${({ theme }) => theme.transitions.normal};
    }
  }
  
  .amount {
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: ${({ theme }) => theme.sizes.body};
    min-width: 100px;
    text-align: right;
  }
  
  .percentage {
    font-size: ${({ theme }) => theme.sizes.small};
    color: ${({ theme }) => theme.colors.gray[500]};
    min-width: 50px;
    text-align: right;
  }
`;

export const SmartBudgetTracker: React.FC = () => {
  const totalBudget = 5000000;
  const spent = 2700000;
  const percentage = (spent / totalBudget) * 100;

  const departments = [
    { name: 'Camera & Lighting', budget: 1200000, spent: 780000 },
    { name: 'Cast & Crew', budget: 1500000, spent: 920000 },
    { name: 'Locations', budget: 800000, spent: 450000 },
    { name: 'Post Production', budget: 700000, spent: 150000 },
    { name: 'Equipment', budget: 500000, spent: 320000 },
    { name: 'Catering & Transport', budget: 300000, spent: 80000 },
  ];

  return (
    <BudgetContainer>
      <BudgetCard>
        <BudgetHeader>
          <div>
            <h3>Budget Overview</h3>
            <p style={{ color: '#999' }}>Project Sunset - Real-time tracking</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              ${(totalBudget - spent).toLocaleString()}
            </div>
            <div style={{ color: '#999', fontSize: '0.875rem' }}>
              Remaining budget
            </div>
          </div>
        </BudgetHeader>

        <ProgressBar>
          <ProgressFill
            percentage={percentage}
            status={percentage > 80 ? 'warning' : 'success'}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </ProgressBar>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: '-1rem',
          marginBottom: '2rem',
          fontSize: '0.875rem',
          color: '#999'
        }}>
          <span>${spent.toLocaleString()} spent</span>
          <span>{percentage.toFixed(1)}% of total budget</span>
          <span>${totalBudget.toLocaleString()} total</span>
        </div>

        <BudgetStats>
          <StatBox>
            <div className="label">Daily Burn Rate</div>
            <div className="value value-up">$45,000</div>
            <div className="trend">↑ 12% vs avg</div>
          </StatBox>
          <StatBox>
            <div className="label">Days Remaining</div>
            <div className="value value-neutral">33</div>
            <div className="trend">On schedule</div>
          </StatBox>
          <StatBox>
            <div className="label">Cost per Day</div>
            <div className="value value-down">$42,000</div>
            <div className="trend">↓ 5% vs planned</div>
          </StatBox>
          <StatBox>
            <div className="label">Contingency</div>
            <div className="value value-neutral">$180,000</div>
            <div className="trend">15% available</div>
          </StatBox>
        </BudgetStats>

        <PredictionAlert severity="medium">
          <div className="title">
            <span>⚠️</span> AI Budget Prediction
          </div>
          <div className="content">
            Based on current spending patterns, you may exceed the lighting department 
            budget by 15% if the current burn rate continues. Consider renegotiating 
            equipment rental rates or adjusting the shooting schedule to use natural light 
            for scenes 28-31.
          </div>
        </PredictionAlert>

        <h4 style={{ marginBottom: '1rem' }}>Department Breakdown</h4>
        <DepartmentGrid>
          {departments.map((dept, index) => (
            <DepartmentRow key={index}>
              <div className="name">{dept.name}</div>
              <div className="bar">
                <div 
                  className="fill" 
                  style={{ width: `${(dept.spent / dept.budget) * 100}%` }}
                />
              </div>
              <div className="amount">
                ${dept.spent.toLocaleString()}
              </div>
              <div className="percentage">
                {((dept.spent / dept.budget) * 100).toFixed(0)}%
              </div>
            </DepartmentRow>
          ))}
        </DepartmentGrid>
      </BudgetCard>
    </BudgetContainer>
  );
};
