import styled from 'styled-components';

interface ContainerProps {
  maxWidth?: 'small' | 'medium' | 'large' | 'full';
  noPadding?: boolean;
}

const maxWidths = {
  small: '960px',
  medium: '1200px',
  large: '1440px',
  full: '100%',
};

export const Container = styled.div<ContainerProps>`
  width: 100%;
  max-width: ${({ maxWidth = 'large' }) => maxWidths[maxWidth]};
  margin: 0 auto;
  padding: ${({ theme, noPadding }) => 
    noPadding ? 0 : `0 ${theme.spacing.lg}`};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme, noPadding }) => 
      noPadding ? 0 : `0 ${theme.spacing.md}`};
  }
`;

export const PageContainer = styled(Container)`
  min-height: 100vh;
  padding-top: ${({ theme }) => theme.spacing.xxl};
  padding-bottom: ${({ theme }) => theme.spacing.xxl};
  margin-left: 80px;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    margin-left: 0;
    padding-top: ${({ theme }) => theme.spacing.xl};
  }
`;

export const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const Grid = styled.div<{ columns?: number; gap?: string }>`
  display: grid;
  grid-template-columns: repeat(
    ${({ columns = 3 }) => columns}, 
    minmax(0, 1fr)
  );
  gap: ${({ theme, gap }) => gap || theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;
