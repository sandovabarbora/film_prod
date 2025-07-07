// src/components/layout/Container/Container.tsx
import React from 'react'
import styled from 'styled-components'

interface ContainerProps {
  children: React.ReactNode
  maxWidth?: string
  padding?: string
  className?: string
}

interface PageContainerProps extends ContainerProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

// Basic Container
export const Container: React.FC<ContainerProps> = ({ 
  children, 
  maxWidth = '1200px', 
  padding = '20px',
  className 
}) => {
  return (
    <StyledContainer maxWidth={maxWidth} padding={padding} className={className}>
      {children}
    </StyledContainer>
  )
}

// Page Container with header
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  actions,
  maxWidth = '1200px',
  padding = '20px',
  className
}) => {
  return (
    <StyledPageContainer maxWidth={maxWidth} padding={padding} className={className}>
      {(title || actions) && (
        <PageHeader>
          <PageHeaderContent>
            {title && <PageTitle>{title}</PageTitle>}
            {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
          </PageHeaderContent>
          {actions && <PageActions>{actions}</PageActions>}
        </PageHeader>
      )}
      <PageContent>
        {children}
      </PageContent>
    </StyledPageContainer>
  )
}

// Styled Components
const StyledContainer = styled.div<{ maxWidth: string; padding: string }>`
  max-width: ${({ maxWidth }) => maxWidth};
  margin: 0 auto;
  padding: ${({ padding }) => padding};
  width: 100%;
  box-sizing: border-box;
`

const StyledPageContainer = styled(StyledContainer)`
  height: 100%;
  display: flex;
  flex-direction: column;
`

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`

const PageHeaderContent = styled.div`
  flex: 1;
`

const PageTitle = styled.h1`
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: 600;
  color: ${({ theme }) => theme?.colors?.text || '#333'};
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`

const PageSubtitle = styled.p`
  margin: 0;
  font-size: 1.1rem;
  color: ${({ theme }) => theme?.colors?.textSecondary || '#666'};
  line-height: 1.5;
`

const PageActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    justify-content: stretch;
    
    > * {
      flex: 1;
    }
  }
`

const PageContent = styled.div`
  flex: 1;
  overflow: auto;
`

// Export both as default and named
export default Container