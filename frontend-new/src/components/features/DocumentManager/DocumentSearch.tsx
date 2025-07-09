import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

interface SearchFilters {
  query: string;
  type: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  tags: string[];
  uploadedBy: string;
  sortBy: 'name' | 'date' | 'size' | 'type';
  sortDirection: 'asc' | 'desc';
}

interface DocumentSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
  initialFilters?: Partial<SearchFilters>;
  availableTypes?: string[];
  availableStatuses?: string[];
  availableTags?: string[];
  availableUsers?: string[];
  isLoading?: boolean;
  resultCount?: number;
}

const defaultFilters: SearchFilters = {
  query: '',
  type: 'all',
  status: 'all',
  dateFrom: '',
  dateTo: '',
  tags: [],
  uploadedBy: 'all',
  sortBy: 'date',
  sortDirection: 'desc'
};

export function DocumentSearch({
  onSearch,
  onReset,
  initialFilters = {},
  availableTypes = ['script', 'schedule', 'budget', 'contract', 'technical', 'legal', 'creative', 'other'],
  availableStatuses = ['draft', 'review', 'approved', 'final', 'archived'],
  availableTags = [],
  availableUsers = [],
  isLoading = false,
  resultCount
}: DocumentSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    ...defaultFilters,
    ...initialFilters
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentTag, setCurrentTag] = useState('');

  useEffect(() => {
    // Trigger search when filters change (with debounce for query)
    const timeoutId = setTimeout(() => {
      onSearch(filters);
    }, filters.query ? 300 : 0);

    return () => clearTimeout(timeoutId);
  }, [filters, onSearch]);

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setShowAdvanced(false);
    onReset();
  };

  const addTag = () => {
    if (currentTag.trim() && !filters.tags.includes(currentTag.trim())) {
      updateFilter('tags', [...filters.tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFilter('tags', filters.tags.filter(tag => tag !== tagToRemove));
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'script': 'Scénář',
      'schedule': 'Harmonogram',
      'budget': 'Rozpočet',
      'contract': 'Smlouva',
      'technical': 'Technická dokumentace',
      'legal': 'Právní dokument',
      'creative': 'Kreativní materiál',
      'other': 'Ostatní'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'draft': 'Koncept',
      'review': 'Na kontrole',
      'approved': 'Schváleno',
      'final': 'Finální',
      'archived': 'Archivováno'
    };
    return labels[status] || status;
  };

  const getSortLabel = (sort: string) => {
    const labels: Record<string, string> = {
      'name': 'Názvu',
      'date': 'Datu',
      'size': 'Velikosti',
      'type': 'Typu'
    };
    return labels[sort] || sort;
  };

  const hasActiveFilters = () => {
    return filters.query !== '' ||
           filters.type !== 'all' ||
           filters.status !== 'all' ||
           filters.dateFrom !== '' ||
           filters.dateTo !== '' ||
           filters.tags.length > 0 ||
           filters.uploadedBy !== 'all' ||
           filters.sortBy !== 'date' ||
           filters.sortDirection !== 'desc';
  };

  return (
    <SearchContainer>
      <SearchHeader>
        <SearchTitle>🔍 Vyhledávání dokumentů</SearchTitle>
        {resultCount !== undefined && (
          <ResultCount>
            {resultCount} {resultCount === 1 ? 'výsledek' : resultCount < 5 ? 'výsledky' : 'výsledků'}
          </ResultCount>
        )}
      </SearchHeader>

      <SearchContent>
        {/* Basic Search */}
        <BasicSearch>
          <SearchInputGroup>
            <SearchInput
              type="text"
              placeholder="Hledat podle názvu, obsahu nebo tagů..."
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
            />
            <SearchButton disabled={isLoading}>
              {isLoading ? '🔄' : '🔍'}
            </SearchButton>
          </SearchInputGroup>

          <QuickFilters>
            <FilterGroup>
              <FilterLabel>Typ:</FilterLabel>
              <QuickSelect
                value={filters.type}
                onChange={(e) => updateFilter('type', e.target.value)}
              >
                <option value="all">Všechny typy</option>
                {availableTypes.map(type => (
                  <option key={type} value={type}>
                    {getTypeLabel(type)}
                  </option>
                ))}
              </QuickSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Stav:</FilterLabel>
              <QuickSelect
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
              >
                <option value="all">Všechny stavy</option>
                {availableStatuses.map(status => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </QuickSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Řadit podle:</FilterLabel>
              <SortContainer>
                <QuickSelect
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value as SearchFilters['sortBy'])}
                >
                  <option value="date">Data</option>
                  <option value="name">Názvu</option>
                  <option value="size">Velikosti</option>
                  <option value="type">Typu</option>
                </QuickSelect>
                <SortDirectionButton
                  onClick={() => updateFilter('sortDirection', filters.sortDirection === 'asc' ? 'desc' : 'asc')}
                >
                  {filters.sortDirection === 'asc' ? '↑' : '↓'}
                </SortDirectionButton>
              </SortContainer>
            </FilterGroup>
          </QuickFilters>

          <SearchActions>
            <AdvancedToggle onClick={() => setShowAdvanced(!showAdvanced)}>
              {showAdvanced ? '🔽' : '🔼'} Pokročilé vyhledávání
            </AdvancedToggle>
            
            {hasActiveFilters() && (
              <ResetButton onClick={handleReset}>
                🗑️ Vymazat filtry
              </ResetButton>
            )}
          </SearchActions>
        </BasicSearch>

        {/* Advanced Search */}
        {showAdvanced && (
          <AdvancedSearch>
            <AdvancedTitle>Pokročilé filtry</AdvancedTitle>
            
            <AdvancedFilters>
              <FilterRow>
                <FilterGroup>
                  <FilterLabel>Datum od:</FilterLabel>
                  <DateInput
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  />
                </FilterGroup>

                <FilterGroup>
                  <FilterLabel>Datum do:</FilterLabel>
                  <DateInput
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => updateFilter('dateTo', e.target.value)}
                  />
                </FilterGroup>

                {availableUsers.length > 0 && (
                  <FilterGroup>
                    <FilterLabel>Nahráno uživatelem:</FilterLabel>
                    <QuickSelect
                      value={filters.uploadedBy}
                      onChange={(e) => updateFilter('uploadedBy', e.target.value)}
                    >
                      <option value="all">Všichni uživatelé</option>
                      {availableUsers.map(user => (
                        <option key={user} value={user}>
                          {user}
                        </option>
                      ))}
                    </QuickSelect>
                  </FilterGroup>
                )}
              </FilterRow>

              <FilterGroup>
                <FilterLabel>Tagy:</FilterLabel>
                <TagInput>
                  <TagInputField
                    type="text"
                    placeholder="Přidat tag..."
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <AddTagButton onClick={addTag} disabled={!currentTag.trim()}>
                    Přidat
                  </AddTagButton>
                </TagInput>

                {filters.tags.length > 0 && (
                  <TagList>
                    {filters.tags.map(tag => (
                      <Tag key={tag}>
                        {tag}
                        <TagRemove onClick={() => removeTag(tag)}>✕</TagRemove>
                      </Tag>
                    ))}
                  </TagList>
                )}

                {availableTags.length > 0 && (
                  <SuggestedTags>
                    <SuggestedTagsLabel>Dostupné tagy:</SuggestedTagsLabel>
                    <SuggestedTagsList>
                      {availableTags
                        .filter(tag => !filters.tags.includes(tag))
                        .slice(0, 10)
                        .map(tag => (
                          <SuggestedTag
                            key={tag}
                            onClick={() => updateFilter('tags', [...filters.tags, tag])}
                          >
                            {tag}
                          </SuggestedTag>
                        ))}
                    </SuggestedTagsList>
                  </SuggestedTags>
                )}
              </FilterGroup>
            </AdvancedFilters>
          </AdvancedSearch>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters() && (
          <ActiveFilters>
            <ActiveFiltersTitle>Aktivní filtry:</ActiveFiltersTitle>
            <ActiveFiltersList>
              {filters.query && (
                <ActiveFilter>
                  Hledaný text: "{filters.query}"
                  <FilterRemove onClick={() => updateFilter('query', '')}>✕</FilterRemove>
                </ActiveFilter>
              )}
              {filters.type !== 'all' && (
                <ActiveFilter>
                  Typ: {getTypeLabel(filters.type)}
                  <FilterRemove onClick={() => updateFilter('type', 'all')}>✕</FilterRemove>
                </ActiveFilter>
              )}
              {filters.status !== 'all' && (
                <ActiveFilter>
                  Stav: {getStatusLabel(filters.status)}
                  <FilterRemove onClick={() => updateFilter('status', 'all')}>✕</FilterRemove>
                </ActiveFilter>
              )}
              {filters.dateFrom && (
                <ActiveFilter>
                  Od: {new Date(filters.dateFrom).toLocaleDateString('cs-CZ')}
                  <FilterRemove onClick={() => updateFilter('dateFrom', '')}>✕</FilterRemove>
                </ActiveFilter>
              )}
              {filters.dateTo && (
                <ActiveFilter>
                  Do: {new Date(filters.dateTo).toLocaleDateString('cs-CZ')}
                  <FilterRemove onClick={() => updateFilter('dateTo', '')}>✕</FilterRemove>
                </ActiveFilter>
              )}
              {filters.uploadedBy !== 'all' && (
                <ActiveFilter>
                  Uživatel: {filters.uploadedBy}
                  <FilterRemove onClick={() => updateFilter('uploadedBy', 'all')}>✕</FilterRemove>
                </ActiveFilter>
              )}
              {(filters.sortBy !== 'date' || filters.sortDirection !== 'desc') && (
                <ActiveFilter>
                  Řazení: {getSortLabel(filters.sortBy)} {filters.sortDirection === 'asc' ? '↑' : '↓'}
                  <FilterRemove onClick={() => {
                    updateFilter('sortBy', 'date');
                    updateFilter('sortDirection', 'desc');
                  }}>✕</FilterRemove>
                </ActiveFilter>
              )}
            </ActiveFiltersList>
          </ActiveFilters>
        )}
      </SearchContent>
    </SearchContainer>
  );
}

// Styled Components
const SearchContainer = styled(Card)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
`;

const SearchHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
`;

const SearchTitle = styled.h3`
  margin: 0;
  color: #fff;
  font-size: 1.25rem;
`;

const ResultCount = styled.div`
  color: #8b8b8b;
  font-size: 0.875rem;
`;

const SearchContent = styled.div`
  padding: 1.5rem;
`;

const BasicSearch = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SearchInputGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-family: inherit;
  font-size: 0.875rem;

  &::placeholder {
    color: #8b8b8b;
  }

  &:focus {
    outline: none;
    border-color: rgba(103, 126, 234, 0.4);
  }
`;

const SearchButton = styled.button`
  padding: 0.75rem 1rem;
  background: rgba(103, 126, 234, 0.2);
  border: 1px solid rgba(103, 126, 234, 0.4);
  border-radius: 8px;
  color: #667eea;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: rgba(103, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuickFilters = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  color: #8b8b8b;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const QuickSelect = styled.select`
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-family: inherit;
  font-size: 0.875rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: rgba(103, 126, 234, 0.4);
  }

  option {
    background: #1a1a2e;
    color: #fff;
  }
`;

const SortContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SortDirectionButton = styled.button`
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #8b8b8b;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

const SearchActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const AdvancedToggle = styled.button`
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #8b8b8b;
  font-family: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

const ResetButton = styled.button`
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 6px;
  color: #ef4444;
  font-family: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
  }
`;

const AdvancedSearch = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const AdvancedTitle = styled.h4`
  margin: 0 0 1rem 0;
  color: #fff;
  font-size: 1rem;
`;

const AdvancedFilters = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DateInput = styled.input`
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-family: inherit;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: rgba(103, 126, 234, 0.4);
  }
`;

const TagInput = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const TagInputField = styled.input`
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-family: inherit;
  font-size: 0.875rem;

  &::placeholder {
    color: #8b8b8b;
  }

  &:focus {
    outline: none;
    border-color: rgba(103, 126, 234, 0.4);
  }
`;

const AddTagButton = styled.button`
  padding: 0.5rem 1rem;
  background: rgba(103, 126, 234, 0.2);
  border: 1px solid rgba(103, 126, 234, 0.4);
  border-radius: 6px;
  color: #667eea;
  font-family: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: rgba(103, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const Tag = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: rgba(103, 126, 234, 0.2);
  border: 1px solid rgba(103, 126, 234, 0.4);
  border-radius: 4px;
  color: #667eea;
  font-size: 0.75rem;
`;

const TagRemove = styled.button`
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  padding: 0;
  font-size: 0.75rem;

  &:hover {
    color: #ef4444;
  }
`;

const SuggestedTags = styled.div``;

const SuggestedTagsLabel = styled.div`
  color: #8b8b8b;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
`;

const SuggestedTagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
`;

const SuggestedTag = styled.button`
  padding: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #8b8b8b;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(103, 126, 234, 0.1);
    border-color: rgba(103, 126, 234, 0.2);
    color: #667eea;
  }
`;

const ActiveFilters = styled.div`
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ActiveFiltersTitle = styled.div`
  color: #8b8b8b;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
`;

const ActiveFiltersList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const ActiveFilter = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(103, 126, 234, 0.1);
  border: 1px solid rgba(103, 126, 234, 0.2);
  border-radius: 6px;
  color: #667eea;
  font-size: 0.875rem;
`;

const FilterRemove = styled.button`
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  padding: 0;
  font-size: 0.75rem;

  &:hover {
    color: #ef4444;
  }
`;

export default DocumentSearch;
