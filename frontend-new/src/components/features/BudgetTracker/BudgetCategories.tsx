import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, GlassCard, CardHeader, CardContent } from '../../ui/Card';
import { PrimaryButton, SecondaryButton, OutlineButton, DangerButton } from '../../ui/Button';

interface BudgetCategory {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  forecasted: number;
  lastUpdated: string;
  status: 'on_track' | 'warning' | 'critical';
  departmentLead: string;
  transactions: Array<{
    id: string;
    date: string;
    amount: number;
    description: string;
    type: 'expense' | 'adjustment' | 'transfer';
  }>;
}

interface BudgetCategoriesProps {
  categories: BudgetCategory[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  onBudgetUpdate?: (categoryId: string, data: Partial<BudgetCategory>) => void;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => string;
  filterByStatus: string;
}

export function BudgetCategories({ 
  categories, 
  selectedCategory, 
  onCategorySelect,
  onBudgetUpdate,
  formatCurrency, 
  getStatusColor,
  filterByStatus 
}: BudgetCategoriesProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Filtrování kategorií podle statusu
  const filteredCategories = categories.filter(category => {
    if (filterByStatus === 'all') return true;
    return category.status === filterByStatus;
  });

  // Řazení kategorií - kritické první, pak podle názvu
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    const statusOrder = { critical: 0, warning: 1, on_track: 2 };
    const aOrder = statusOrder[a.status];
    const bOrder = statusOrder[b.status];
    
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.category.localeCompare(b.category);
  });

  const handleEditCategory = (categoryId: string) => {
    setEditingCategory(categoryId);
    onCategorySelect(categoryId);
  };

  const handleUpdateBudget = (categoryId: string, newAllocated: number) => {
    if (onBudgetUpdate) {
      onBudgetUpdate(categoryId, { allocated: newAllocated });
    }
    setEditingCategory(null);
  };

  const getCategoryUtilization = (category: BudgetCategory) => {
    return (category.spent / category.allocated) * 100;
  };

  const getCategoryTrend = (category: BudgetCategory) => {
    // Placeholder pro trend calculation
    // V reálné aplikaci by se počítal z historical data
    const variance = category.forecasted - category.allocated;
    if (variance > category.allocated * 0.1) return 'increasing';
    if (variance < -category.allocated * 0.1) return 'decreasing';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      default: return '➡️';
    }
  };

  return (
    <CategoriesContainer>
      {/* Categories Header */}
      <CategoriesHeader>
        <HeaderInfo>
          <h2>Kategorie rozpočtu</h2>
          <HeaderStats>
            Zobrazeno {sortedCategories.length} z {categories.length} kategorií
            {filterByStatus !== 'all' && (
              <FilterNote>
                (filtr: {filterByStatus})
              </FilterNote>
            )}
          </HeaderStats>
        </HeaderInfo>
        
        <HeaderActions>
          <SecondaryButton onClick={() => setShowAddCategory(true)}>
            ➕ Přidat kategorii
          </SecondaryButton>
          
          {selectedCategory && (
            <OutlineButton onClick={() => onCategorySelect(null)}>
              ✖️ Zrušit výběr
            </OutlineButton>
          )}
        </HeaderActions>
      </CategoriesHeader>

      {/* Categories Grid */}
      <CategoriesGrid>
        {sortedCategories.map(category => {
          const utilization = getCategoryUtilization(category);
          const trend = getCategoryTrend(category);
          const isSelected = selectedCategory === category.id;
          const isEditing = editingCategory === category.id;
          const isOverBudget = category.spent > category.allocated;

          return (
            <CategoryCard 
              key={category.id}
              $status={category.status}
              $isSelected={isSelected}
              onClick={() => !isEditing && onCategorySelect(category.id)}
            >
              <CategoryHeader>
                <CategoryTitleRow>
                  <CategoryName $isOverBudget={isOverBudget}>
                    {category.category}
                    {isOverBudget && <OverBudgetFlag>!</OverBudgetFlag>}
                  </CategoryName>
                  
                  <CategoryActions>
                    <StatusIndicator $color={getStatusColor(category.status)}>
                      <StatusDot />
                    </StatusIndicator>
                    
                    <TrendIndicator title={`Trend: ${trend}`}>
                      {getTrendIcon(trend)}
                    </TrendIndicator>
                    
                    <ActionButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCategory(category.id);
                      }}
                      title="Upravit rozpočet"
                    >
                      ✏️
                    </ActionButton>
                  </CategoryActions>
                </CategoryTitleRow>

                <CategoryMeta>
                  <DepartmentLead>👤 {category.departmentLead}</DepartmentLead>
                  <LastUpdated>
                    📅 {new Date(category.lastUpdated).toLocaleDateString('cs-CZ')}
                  </LastUpdated>
                </CategoryMeta>
              </CategoryHeader>

              <CategoryContent>
                {/* Budget Overview */}
                <BudgetOverview>
                  <BudgetRow>
                    <BudgetLabel>Alokováno:</BudgetLabel>
                    <BudgetValue>{formatCurrency(category.allocated)}</BudgetValue>
                  </BudgetRow>
                  
                  <BudgetRow>
                    <BudgetLabel>Utraceno:</BudgetLabel>
                    <BudgetValue $color={isOverBudget ? '#EF4444' : '#10B981'}>
                      {formatCurrency(category.spent)}
                    </BudgetValue>
                  </BudgetRow>
                  
                  <BudgetRow>
                    <BudgetLabel>Zbývá:</BudgetLabel>
                    <BudgetValue $color={category.remaining < 0 ? '#EF4444' : '#10B981'}>
                      {formatCurrency(category.remaining)}
                    </BudgetValue>
                  </BudgetRow>
                  
                  <BudgetRow>
                    <BudgetLabel>Prognóza:</BudgetLabel>
                    <BudgetValue $color={category.forecasted > category.allocated ? '#F59E0B' : '#6B7280'}>
                      {formatCurrency(category.forecasted)}
                    </BudgetValue>
                  </BudgetRow>
                </BudgetOverview>

                {/* Progress Bar */}
                <ProgressSection>
                  <ProgressLabel>
                    Využití: {Math.round(utilization)}%
                    {utilization > 100 && (
                      <OverageIndicator>
                        (+{Math.round(utilization - 100)}% přečerpání)
                      </OverageIndicator>
                    )}
                  </ProgressLabel>
                  
                  <ProgressBar>
                    <ProgressFill 
                      $percentage={Math.min(100, utilization)}
                      $color={getStatusColor(category.status)}
                    />
                    {utilization > 100 && (
                      <OverageFill 
                        $percentage={Math.min(50, utilization - 100)}
                      />
                    )}
                  </ProgressBar>
                </ProgressSection>

                {/* Recent Transactions Preview */}
                {category.transactions.length > 0 && (
                  <TransactionsPreview>
                    <TransactionsTitle>Poslední transakce:</TransactionsTitle>
                    <TransactionsList>
                      {category.transactions.slice(0, 3).map(transaction => (
                        <TransactionItem key={transaction.id}>
                          <TransactionInfo>
                            <TransactionDesc>{transaction.description}</TransactionDesc>
                            <TransactionDate>
                              {new Date(transaction.date).toLocaleDateString('cs-CZ')}
                            </TransactionDate>
                          </TransactionInfo>
                          <TransactionAmount $type={transaction.type}>
                            {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                          </TransactionAmount>
                        </TransactionItem>
                      ))}
                    </TransactionsList>
                    
                    {category.transactions.length > 3 && (
                      <ShowMoreButton onClick={(e) => e.stopPropagation()}>
                        +{category.transactions.length - 3} dalších transakcí
                      </ShowMoreButton>
                    )}
                  </TransactionsPreview>
                )}

                {/* Edit Mode */}
                {isEditing && (
                  <EditSection onClick={(e) => e.stopPropagation()}>
                    <EditForm onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const newAllocated = Number(formData.get('allocated'));
                      handleUpdateBudget(category.id, newAllocated);
                    }}>
                      <EditField>
                        <EditLabel>Nový rozpočet:</EditLabel>
                        <EditInput 
                          name="allocated"
                          type="number"
                          defaultValue={category.allocated}
                          step="1000"
                          min="0"
                        />
                      </EditField>
                      
                      <EditActions>
                        <PrimaryButton type="submit" size="sm">
                          💾 Uložit
                        </PrimaryButton>
                        <OutlineButton 
                          type="button" 
                          size="sm"
                          onClick={() => setEditingCategory(null)}
                        >
                          ❌ Zrušit
                        </OutlineButton>
                      </EditActions>
                    </EditForm>
                  </EditSection>
                )}
              </CategoryContent>
            </CategoryCard>
          );
        })}
      </CategoriesGrid>

      {/* Add Category Modal */}
      {showAddCategory && (
        <AddCategoryModal onClose={() => setShowAddCategory(false)} />
      )}

      {/* Empty State */}
      {sortedCategories.length === 0 && (
        <EmptyState>
          <EmptyIcon>📂</EmptyIcon>
          <EmptyTitle>Žádné kategorie</EmptyTitle>
          <EmptyDescription>
            {filterByStatus === 'all' 
              ? 'Zatím nebyly vytvořeny žádné kategorie rozpočtu.'
              : `Žádné kategorie se statusem "${filterByStatus}".`
            }
          </EmptyDescription>
          {filterByStatus !== 'all' && (
            <SecondaryButton onClick={() => {}}>
              Zobrazit všechny kategorie
            </SecondaryButton>
          )}
        </EmptyState>
      )}
    </CategoriesContainer>
  );
}

// Placeholder component pro add category modal
function AddCategoryModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <h3>Přidat novou kategorii</h3>
        <p>Add category form bude implementován v další iteraci</p>
        <PrimaryButton onClick={onClose}>Zavřít</PrimaryButton>
      </ModalContent>
    </ModalOverlay>
  );
}

// Styled Components
const CategoriesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const CategoriesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderInfo = styled.div``;

const HeaderStats = styled.p`
  margin: ${props => props.theme.spacing.xs} 0 0 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const FilterNote = styled.span`
  color: ${props => props.theme.colors.primary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const CategoryCard = styled(GlassCard)<{ $status: string; $isSelected: boolean }>`
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};
  border: 2px solid ${props => {
    if (props.$isSelected) return props.theme.colors.primary;
    const colors = {
      on_track: 'rgba(16, 185, 129, 0.3)',
      warning: 'rgba(245, 158, 11, 0.3)',
      critical: 'rgba(239, 68, 68, 0.3)'
    };
    return colors[props.$status as keyof typeof colors] || props.theme.colors.border;
  }};
  
  background: ${props => {
    if (props.$isSelected) {
      return `linear-gradient(135deg, 
        rgba(59, 130, 246, 0.1) 0%, 
        rgba(59, 130, 246, 0.05) 100%
      )`;
    }
    const colors = {
      on_track: 'rgba(16, 185, 129, 0.05)',
      warning: 'rgba(245, 158, 11, 0.05)',
      critical: 'rgba(239, 68, 68, 0.05)'
    };
    return colors[props.$status as keyof typeof colors] || 'transparent';
  }};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.xl};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const CategoryHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const CategoryTitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const CategoryName = styled.h3<{ $isOverBudget: boolean }>`
  margin: 0;
  color: ${props => props.$isOverBudget ? '#EF4444' : props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const OverBudgetFlag = styled.span`
  color: #EF4444;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-size: ${props => props.theme.typography.fontSize.xl};
`;

const CategoryActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const StatusIndicator = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
`;

const StatusDot = styled.div<{ $color?: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$color || '#6B7280'};
`;

const TrendIndicator = styled.span`
  font-size: ${props => props.theme.typography.fontSize.lg};
  cursor: help;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: background ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const CategoryMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const DepartmentLead = styled.span``;
const LastUpdated = styled.span``;

const CategoryContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const BudgetOverview = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const BudgetRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BudgetLabel = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const BudgetValue = styled.span<{ $color?: string }>`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.$color || props.theme.colors.text};
`;

const ProgressSection = styled.div``;

const ProgressLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text};
`;

const OverageIndicator = styled.span`
  color: #EF4444;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const ProgressBar = styled.div`
  position: relative;
  height: 8px;
  background: ${props => props.theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.$color};
  transition: width ${props => props.theme.transitions.normal};
`;

const OverageFill = styled.div<{ $percentage: number }>`
  position: absolute;
  top: 0;
  left: 100%;
  height: 100%;
  width: ${props => props.$percentage}%;
  background: repeating-linear-gradient(
    45deg,
    #EF4444,
    #EF4444 4px,
    #FCA5A5 4px,
    #FCA5A5 8px
  );
`;

const TransactionsPreview = styled.div`
  border-top: 1px solid ${props => props.theme.colors.border};
  padding-top: ${props => props.theme.spacing.md};
`;

const TransactionsTitle = styled.h4`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const TransactionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const TransactionInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TransactionDesc = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TransactionDate = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const TransactionAmount = styled.div<{ $type: string }>`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.$type === 'expense' ? '#EF4444' : '#10B981'};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ShowMoreButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.sm};
  border: 1px dashed ${props => props.theme.colors.border};
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  margin-top: ${props => props.theme.spacing.sm};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
`;

const EditSection = styled.div`
  border-top: 1px solid ${props => props.theme.colors.border};
  padding-top: ${props => props.theme.spacing.md};
`;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const EditField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const EditLabel = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
`;

const EditInput = styled.input`
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const EditActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const EmptyTitle = styled.h3`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  color: ${props => props.theme.colors.text};
`;

const EmptyDescription = styled.p`
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
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
