// src/components/layout/Container/Container.tsx
import React, { ReactNode, HTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type ContainerPadding = 'none' | 'sm' | 'md' | 'lg';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
  padding?: ContainerPadding;
  center?: boolean;
  children: ReactNode;
}

export function Container({
  size = 'xl',
  padding = 'md',
  center = false,
  children,
  ...props
}: ContainerProps) {
  return (
    <StyledContainer
      size={size}
      padding={padding}
      center={center}
      {...props}
    >
      {children}
    </StyledContainer>
  );
}

// Page-level container
export function PageContainer({ children, ...props }: Omit<ContainerProps, 'size'>) {
  return (
    <Container size="xl" {...props}>
      {children}
    </Container>
  );
}

// Section container for content areas
interface SectionProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function Section({ title, subtitle, action, children, ...props }: SectionProps) {
  return (
    <StyledSection {...props}>
      {(title || subtitle || action) && (
        <SectionHeader>
          <SectionHeaderContent>
            {title && <SectionTitle>{title}</SectionTitle>}
            {subtitle && <SectionSubtitle>{subtitle}</SectionSubtitle>}
          </SectionHeaderContent>
          {action && <SectionAction>{action}</SectionAction>}
        </SectionHeader>
      )}
      <SectionContent>{children}</SectionContent>
    </StyledSection>
  );
}

// Grid layout component
type GridCols = 1 | 2 | 3 | 4 | 6 | 12;
type GridGap = 'sm' | 'md' | 'lg' | 'xl';

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: GridCols;
  gap?: GridGap;
  responsive?: boolean;
  children: ReactNode;
}

export function Grid({
  cols = 1,
  gap = 'md',
  responsive = true,
  children,
  ...props
}: GridProps) {
  return (
    <StyledGrid
      cols={cols}
      gap={gap}
      responsive={responsive}
      {...props}
    >
      {children}
    </StyledGrid>
  );
}

// Flex layouts
interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: GridGap;
  wrap?: boolean;
  children: ReactNode;
}

export function Flex({
  direction = 'row',
  align = 'start',
  justify = 'start',
  gap = 'md',
  wrap = false,
  children,
  ...props
}: FlexProps) {
  return (
    <StyledFlex
      direction={direction}
      align={align}
      justify={justify}
      gap={gap}
      wrap={wrap}
      {...props}
    >
      {children}
    </StyledFlex>
  );
}

// Stack layout (vertical flex)
export function Stack({ children, ...props }: Omit<FlexProps, 'direction'>) {
  return (
    <Flex direction="column" {...props}>
      {children}
    </Flex>
  );
}

// Inline layout (horizontal flex)
export function Inline({ children, ...props }: Omit<FlexProps, 'direction'>) {
  return (
    <Flex direction="row" {...props}>
      {children}
    </Flex>
  );
}

// Styled components
const getContainerSizeStyles = (size: ContainerSize) => {
  const sizes = {
    sm: css`max-width: 640px;`,
    md: css`max-width: 768px;`,
    lg: css`max-width: 1024px;`,
    xl: css`max-width: 1280px;`,
    full: css`max-width: 100%;`,
  };

  return sizes[size];
};

const getPaddingStyles = (padding: ContainerPadding) => {
  const paddings = {
    none: css`padding: 0;`,
    sm: css`padding: ${props => props.theme.spacing.md};`,
    md: css`padding: ${props => props.theme.spacing.lg};`,
    lg: css`padding: ${props => props.theme.spacing.xl};`,
  };

  return paddings[padding];
};

const getGapStyles = (gap: GridGap) => {
  const gaps = {
    sm: css`gap: ${props => props.theme.spacing.sm};`,
    md: css`gap: ${props => props.theme.spacing.md};`,
    lg: css`gap: ${props => props.theme.spacing.lg};`,
    xl: css`gap: ${props => props.theme.spacing.xl};`,
  };

  return gaps[gap];
};

const StyledContainer = styled.div<{
  size: ContainerSize;
  padding: ContainerPadding;
  center: boolean;
}>`
  width: 100%;
  ${props => getContainerSizeStyles(props.size)}
  ${props => getPaddingStyles(props.padding)}
  
  ${props => props.center && css`
    margin-left: auto;
    margin-right: auto;
  `}
`;

const StyledSection = styled.section`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.lg};
  gap: ${props => props.theme.spacing.md};
`;

const SectionHeaderContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const SectionTitle = styled.h2`
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text};
`;

const SectionSubtitle = styled.p`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.textSecondary};
`;

const SectionAction = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const SectionContent = styled.div`
  /* Content styles handled by children */
`;

const getGridCols = (cols: GridCols, responsive: boolean) => {
  if (!responsive) {
    return css`grid-template-columns: repeat(${cols}, 1fr);`;
  }

  // Responsive grid - adapts based on screen size
  return css`
    grid-template-columns: repeat(1, 1fr);
    
    @media (min-width: ${props => props.theme.breakpoints.sm}) {
      grid-template-columns: repeat(${Math.min(cols, 2)}, 1fr);
    }
    
    @media (min-width: ${props => props.theme.breakpoints.md}) {
      grid-template-columns: repeat(${Math.min(cols, 3)}, 1fr);
    }
    
    @media (min-width: ${props => props.theme.breakpoints.lg}) {
      grid-template-columns: repeat(${cols}, 1fr);
    }
  `;
};

const StyledGrid = styled.div<{
  cols: GridCols;
  gap: GridGap;
  responsive: boolean;
}>`
  display: grid;
  ${props => getGridCols(props.cols, props.responsive)}
  ${props => getGapStyles(props.gap)}
`;

const getFlexAlign = (align: string) => {
  const alignments = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
  };
  return alignments[align] || 'flex-start';
};

const getFlexJustify = (justify: string) => {
  const justifications = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
  };
  return justifications[justify] || 'flex-start';
};

const StyledFlex = styled.div<{
  direction: string;
  align: string;
  justify: string;
  gap: GridGap;
  wrap: boolean;
}>`
  display: flex;
  flex-direction: ${props => props.direction};
  align-items: ${props => getFlexAlign(props.align)};
  justify-content: ${props => getFlexJustify(props.justify)};
  ${props => getGapStyles(props.gap)}
  
  ${props => props.wrap && css`
    flex-wrap: wrap;
  `}
`;

export default Container;
