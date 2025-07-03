import React from 'react';
import styled from 'styled-components';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Download, Filter } from 'lucide-react';

const BudgetContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const BudgetOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const OverviewCard = styled.div`
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  padding: 1.5rem;
`;

const OverviewLabel = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const OverviewValue = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const OverviewChange = styled.div<{ $positive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: ${props => props.$positive ? props.theme.colors.success : props.theme.colors.danger};
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const BudgetCategories = styled.div`
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  overflow: hidden;
`;

const CategoryHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[700]};
`;

const CategoryTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CategoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: ${({ theme }) => theme.colors.gray[750]};
  
  th {
    padding: 1rem 1.5rem;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.secondary};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;

const TableBody = styled.tbody`
  tr {
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[700]};
    
    &:hover {
      background: ${({ theme }) => theme.colors.gray[750]};
    }
  }
  
  td {
    padding: 1rem 1.5rem;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const CategoryName = styled.td`
  font-weight: 500;
`;

const ProgressBar = styled.div`
  position: relative;
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.gray[700]};
  border-radius: 4px;
  overflow: hidden;
`;

const Progress = styled.div<{ $percentage: number; $warning?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.$warning ? props.theme.colors.warning : props.theme.colors.primary};
  transition: width 0.3s ease;
`;

const ProgressCell = styled.td`
  width: 200px;
`;

const AmountCell = styled.td<{ $overBudget?: boolean }>`
  color: ${props => props.$overBudget ? props.theme.colors.danger : props.theme.colors.text.primary};
  font-weight: ${props => props.$overBudget ? '600' : '400'};
`;

const WarningIcon = styled(AlertCircle)`
  width: 16px;
  height: 16px;
  color: ${({ theme }) => theme.colors.warning};
  margin-left: 0.5rem;
  vertical-align: middle;
`;

const Budget: React.FC = () => {
  // Mock data
  const budgetOverview = {
    totalBudget: 1000000,
    spent: 670000,
    remaining: 330000,
    percentageUsed: 67,
    daysRemaining: 45
  };
  
  const categories = [
    { name: 'Cast', budget: 300000, spent: 250000, percentage: 83 },
    { name: 'Crew', budget: 200000, spent: 180000, percentage: 90 },
    { name: 'Equipment', budget: 150000, spent: 100000, percentage: 67 },
    { name: 'Locations', budget: 100000, spent: 40000, percentage: 40 },
    { name: 'Post-Production', budget: 100000, spent: 20000, percentage: 20 },
    { name: 'Marketing', budget: 50000, spent: 5000, percentage: 10 },
    { name: 'Contingency', budget: 100000, spent: 75000, percentage: 75 },
  ];

  return (
    <BudgetContainer>
      <PageHeader>
        <Title>Budget Tracker</Title>
        <HeaderActions>
          <Button>
            <Filter size={18} />
            Filter
          </Button>
          <Button>
            <Download size={18} />
            Export Report
          </Button>
        </HeaderActions>
      </PageHeader>
      
      <BudgetOverview>
        <OverviewCard>
          <OverviewLabel>Total Budget</OverviewLabel>
          <OverviewValue>${budgetOverview.totalBudget.toLocaleString()}</OverviewValue>
        </OverviewCard>
        
        <OverviewCard>
          <OverviewLabel>Spent to Date</OverviewLabel>
          <OverviewValue>${budgetOverview.spent.toLocaleString()}</OverviewValue>
          <OverviewChange $positive={false}>
            <TrendingUp />
            {budgetOverview.percentageUsed}% of budget
          </OverviewChange>
        </OverviewCard>
        
        <OverviewCard>
          <OverviewLabel>Remaining Budget</OverviewLabel>
          <OverviewValue>${budgetOverview.remaining.toLocaleString()}</OverviewValue>
          <OverviewChange $positive={true}>
            <TrendingDown />
            {100 - budgetOverview.percentageUsed}% remaining
          </OverviewChange>
        </OverviewCard>
        
        <OverviewCard>
          <OverviewLabel>Daily Burn Rate</OverviewLabel>
          <OverviewValue>${Math.round(budgetOverview.spent / 30).toLocaleString()}</OverviewValue>
          <OverviewChange $positive={false}>
            {budgetOverview.daysRemaining} days remaining
          </OverviewChange>
        </OverviewCard>
      </BudgetOverview>
      
      <BudgetCategories>
        <CategoryHeader>
          <CategoryTitle>Budget by Category</CategoryTitle>
        </CategoryHeader>
        <CategoryTable>
          <TableHeader>
            <tr>
              <th>Category</th>
              <th>Budget</th>
              <th>Spent</th>
              <th>Progress</th>
              <th>Remaining</th>
            </tr>
          </TableHeader>
          <TableBody>
            {categories.map(category => (
              <tr key={category.name}>
                <CategoryName>
                  {category.name}
                  {category.percentage > 80 && <WarningIcon />}
                </CategoryName>
                <td>${category.budget.toLocaleString()}</td>
                <AmountCell $overBudget={category.percentage > 100}>
                  ${category.spent.toLocaleString()}
                </AmountCell>
                <ProgressCell>
                  <ProgressBar>
                    <Progress 
                      $percentage={Math.min(category.percentage, 100)} 
                      $warning={category.percentage > 80}
                    />
                  </ProgressBar>
                </ProgressCell>
                <td>${(category.budget - category.spent).toLocaleString()}</td>
              </tr>
            ))}
          </TableBody>
        </CategoryTable>
      </BudgetCategories>
    </BudgetContainer>
  );
};

export default Budget;