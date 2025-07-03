import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Film } from '../../../types';
import { FilmCard } from '../../ui/Card';
import { Grid } from '../../layout/Container';

interface FilmGalleryProps {
  films: Film[];
  loading?: boolean;
  onFilmClick?: (film: Film) => void;
}

const FilterBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  align-items: center;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: ${({ active, theme }) => 
    active ? theme.colors.accent.main : 'transparent'};
  color: ${({ theme }) => theme.colors.primary.light};
  border: 1px solid ${({ active, theme }) => 
    active ? theme.colors.accent.main : theme.colors.gray[700]};
  border-radius: 24px;
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.main};
    transform: translateY(-2px);
  }
`;

const SearchInput = styled.input`
  flex: 1;
  max-width: 300px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.gray[900]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.primary.light};
  font-size: ${({ theme }) => theme.sizes.body};
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[500]};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.main};
  }
`;

const SkeletonCard = styled.div`
  padding-bottom: 150%;
  background: ${({ theme }) => theme.colors.gray[900]};
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.05),
      transparent
    );
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    to {
      left: 100%;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxxl} 0;
  color: ${({ theme }) => theme.colors.gray[500]};
  
  h3 {
    font-size: ${({ theme }) => theme.sizes.h4};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

type SortBy = 'newest' | 'oldest' | 'rating' | 'title';

export const FilmGallery: React.FC<FilmGalleryProps> = ({ 
  films, 
  loading = false,
  onFilmClick 
}) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');

  const filteredAndSortedFilms = React.useMemo(() => {
    let filtered = films;
    
    // Search
    if (search) {
      filtered = filtered.filter(film => 
        film.title.toLowerCase().includes(search.toLowerCase()) ||
        film.director.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => b.year - a.year);
        break;
      case 'oldest':
        sorted.sort((a, b) => a.year - b.year);
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    
    return sorted;
  }, [films, search, sortBy]);

  return (
    <>
      <FilterBar>
        <SearchInput
          type="text"
          placeholder="Search films..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FilterButton 
          active={sortBy === 'newest'}
          onClick={() => setSortBy('newest')}
        >
          Newest
        </FilterButton>
        <FilterButton 
          active={sortBy === 'oldest'}
          onClick={() => setSortBy('oldest')}
        >
          Oldest
        </FilterButton>
        <FilterButton 
          active={sortBy === 'rating'}
          onClick={() => setSortBy('rating')}
        >
          Top Rated
        </FilterButton>
        <FilterButton 
          active={sortBy === 'title'}
          onClick={() => setSortBy('title')}
        >
          A-Z
        </FilterButton>
      </FilterBar>

      {loading ? (
        <Grid columns={5}>
          {[...Array(10)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </Grid>
      ) : filteredAndSortedFilms.length > 0 ? (
        <Grid columns={5}>
          <AnimatePresence>
            {filteredAndSortedFilms.map((film) => (
              <FilmCard
                key={film.id}
                film={film}
                onClick={() => onFilmClick?.(film)}
              />
            ))}
          </AnimatePresence>
        </Grid>
      ) : (
        <EmptyState>
          <h3>No films found</h3>
          <p>Try adjusting your search criteria</p>
        </EmptyState>
      )}
    </>
  );
};
