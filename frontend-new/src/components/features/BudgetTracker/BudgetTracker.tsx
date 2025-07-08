import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Card, GlassCard, CardHeader, CardContent } from '../../ui/Card';
import { PrimaryButton, SecondaryButton, OutlineButton } from '../../ui/Button';
import { BudgetOverview } from './BudgetOverview';
import { BudgetCategories } from './BudgetCategories';
import { BudgetChart } from './BudgetChart';
import { BudgetControls } from './BudgetControls';
import { CashFlowForecast } from './CashFlowForecast';

interface BudgetData {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  forecasted: number;
  lastUpdated: string;
  status: 'on_track' | 'warning' | 'critical';
  departmentLead: string;
  transactions: BudgetTransaction[];
}

interface BudgetTransaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  type: 'expense' | 'adjustment' | 'transfer';
  approvedBy?: string;
  invoiceNumber?: string;
}

interface BudgetTrackerProps {
  projectId: string;
  budget: {
    total: number;
    allocated: number;
    spent: number;
    remaining: number;
    categories: BudgetData[];
    lastUpdated: string;
  };
  onBudgetUpdate?: (budgetData: Partial<BudgetData>) => void;
  onTransactionAdd?: (transaction: Omit<BudgetTransaction, 'id'>) => void;
}

type ViewMode = 'overview' | 'categories' | 'chart' | 'forecast' | 'transactions';

export function BudgetTracker({ 
  projectId, 
  budget, 
  onBudgetUpdate,
  onTransactionAdd 
}: BudgetTrackerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [filterByStatus, setFilterByStatus] = useState<string>('all');

  // Vypočítané hodnoty pro business intelligence
  const budgetAnalytics = useMemo(() => {
    const totalAllocated = budget.categories.reduce((sum, cat) => sum + cat.allocated, 0);
    const totalSpent = budget.categories.reduce((sum, cat) => sum + cat.spent, 0);
    const totalForecasted = budget.categories.reduce((sum, cat) => sum + cat.forecasted, 0);
    
    const utilizationRate = (totalSpent / totalAllocated) * 100;
    const forecastVariance = totalForecasted - totalAllocated;
    const categoriesOverBudget = budget.categories.filter(cat => cat.spent > cat.allocated).length;
    const categoriesWarning = budget.categories.filter(cat => cat.status === 'warning').length;
    const categoriesCritical = budget.categories.filter(cat => cat.status === 'critical').length;
    
    return {
      totalAllocated,
      totalSpent,
      totalForecasted,
      utilizationRate,
      forecastVariance,
      categoriesOverBudget,
      categoriesWarning,
      categoriesCritical,
      burnRate: totalSpent / Math.max(1, getDaysElapsed()), // denní burn rate
    };
  }, [budget.categories]);

  const getDaysElapsed = () => {
    // Placeholder - v reálné aplikaci by se počítaly dny od začátku projektu
    return 30;
  };

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedCategory(null);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setViewMode('categories');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <BudgetContainer>
      {/* Budget Controls & Navigation */}
      <BudgetControls 
        viewMode={viewMode}
        onViewChange={handleViewChange}
        onAddTransaction={() => setShowAddTransaction(true)}
        filterByStatus={filterByStatus}
        onFilterChange={setFilterByStatus}
        analytics={budgetAnalytics}
      />

      {/* Main Content Area */}
      <BudgetContent>
        {viewMode === 'overview' && (
          <BudgetOverview 
            budget={budget}
            analytics={budgetAnalytics}
            onCategorySelect={handleCategorySelect}
            formatCurrency={formatCurrency}
            getStatusColor={getStatusColor}
          />
        )}

        {viewMode === 'categories' && (
          <BudgetCategories 
            categories={budget.categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            onBudgetUpdate={onBudgetUpdate}
            formatCurrency={formatCurrency}
            getStatusColor={getStatusColor}
            filterByStatus={filterByStatus}
          />
        )}

        {viewMode === 'chart' && (
          <BudgetChart 
            categories={budget.categories}
            analytics={budgetAnalytics}
            formatCurrency={formatCurrency}
          />
        )}

        {viewMode === 'forecast' && (
          <CashFlowForecast 
            categories={budget.categories}
            analytics={budgetAnalytics}
            projectId={projectId}
            formatCurrency={formatCurrency}
          />
        )}

        {viewMode === 'transactions' && (
          <TransactionHistory 
            categories={budget.categories}
            selectedCategory={selectedCategory}
            formatCurrency={formatCurrency}
          />
        )}
      </BudgetContent>

      {/* Transaction Modal */}
      {showAddTransaction && (
        <AddTransactionModal 
          categories={budget.categories}
          onClose={() => setShowAddTransaction(false)}
          onSubmit={onTransactionAdd}
        />
      )}
    </BudgetContainer>
  );
}

// Placeholder component pro transaction history
function TransactionHistory({ categories, selectedCategory, formatCurrency }: any) {
  return (
    <GlassCard>
      <CardHeader>
        <h3>Historie transakcí</h3>
      </CardHeader>
      <CardContent>
        <p>Transaction history bude implementován v další iteraci</p>
      </CardContent>
    </GlassCard>
  );
}

// Placeholder component pro add transaction modal
function AddTransactionModal({ categories, onClose, onSubmit }: any) {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <h3>Přidat transakci</h3>
        <p>Add transaction form bude implementován v další iteraci</p>
        <PrimaryButton onClick={onClose}>Zavřít</PrimaryButton>
      </ModalContent>
    </ModalOverlay>
  );
}

// Styled Components
const BudgetContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
  height: 100%;
`;

const BudgetContent = styled.div`
  flex: 1;
  min-height: 0;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing['2xl']};
  border-radius: ${props => props.theme.borderRadius.lg};
  min-width: 400px;
  max-width: 90vw;
`;
