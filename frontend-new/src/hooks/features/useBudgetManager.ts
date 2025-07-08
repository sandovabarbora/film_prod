import { useState, useCallback, useMemo } from 'react';

interface BudgetData {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  forecasted: number;
  status: 'on_track' | 'warning' | 'critical';
}

interface BudgetTransaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  type: 'expense' | 'adjustment' | 'transfer';
}

export function useBudgetManager(projectId: string) {
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
  const [transactions, setTransactions] = useState<BudgetTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Vypočítané hodnoty
  const analytics = useMemo(() => {
    const totalAllocated = budgetData.reduce((sum, cat) => sum + cat.allocated, 0);
    const totalSpent = budgetData.reduce((sum, cat) => sum + cat.spent, 0);
    const totalForecasted = budgetData.reduce((sum, cat) => sum + cat.forecasted, 0);
    
    const utilizationRate = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
    const forecastVariance = totalForecasted - totalAllocated;
    const categoriesOverBudget = budgetData.filter(cat => cat.spent > cat.allocated).length;
    const categoriesWarning = budgetData.filter(cat => cat.status === 'warning').length;
    const categoriesCritical = budgetData.filter(cat => cat.status === 'critical').length;
    
    // Denní burn rate based na poslední 30 dní transakcí
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const recentExpenses = transactions.filter(t => 
      t.type === 'expense' && new Date(t.date) > last30Days
    );
    const totalRecentSpent = recentExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const burnRate = totalRecentSpent / 30;

    return {
      totalAllocated,
      totalSpent,
      totalForecasted,
      utilizationRate,
      forecastVariance,
      categoriesOverBudget,
      categoriesWarning,
      categoriesCritical,
      burnRate,
      recentlyModified: budgetData.filter(cat => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(cat.lastUpdated || Date.now()) > weekAgo;
      }).length
    };
  }, [budgetData, transactions]);

  const updateBudgetCategory = useCallback(async (categoryId: string, updates: Partial<BudgetData>) => {
    setIsLoading(true);
    try {
      // V reálné aplikaci by se volal API
      setBudgetData(prev => prev.map(cat => 
        cat.id === categoryId ? { ...cat, ...updates } : cat
      ));
      
      console.log('Budget category updated:', categoryId, updates);
    } catch (error) {
      console.error('Failed to update budget category:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTransaction = useCallback(async (transaction: Omit<BudgetTransaction, 'id'>) => {
    setIsLoading(true);
    try {
      const newTransaction: BudgetTransaction = {
        ...transaction,
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Update odpovídající kategorie
      if (transaction.type === 'expense') {
        setBudgetData(prev => prev.map(cat => 
          cat.category === transaction.category 
            ? { 
                ...cat, 
                spent: cat.spent + Math.abs(transaction.amount),
                remaining: cat.allocated - (cat.spent + Math.abs(transaction.amount))
              }
            : cat
        ));
      }
      
      console.log('Transaction added:', newTransaction);
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calculateForecast = useCallback((days: number) => {
    const dailyBurnRate = analytics.burnRate;
    const projectedSpend = dailyBurnRate * days;
    const projectedTotal = analytics.totalSpent + projectedSpend;
    const projectedRemaining = analytics.totalAllocated - projectedTotal;
    
    return {
      projectedSpend,
      projectedTotal, 
      projectedRemaining,
      isOverBudget: projectedTotal > analytics.totalAllocated,
      daysToCompletion: analytics.totalAllocated > analytics.totalSpent 
        ? Math.ceil((analytics.totalAllocated - analytics.totalSpent) / dailyBurnRate)
        : 0
    };
  }, [analytics]);

  return {
    budgetData,
    setBudgetData,
    transactions,
    analytics,
    isLoading,
    updateBudgetCategory,
    addTransaction,
    calculateForecast
  };
}
